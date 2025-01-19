import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.2/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.events.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.settings.readonly'
];

const redirectUri = 'https://friendly-connection-dashboard.lovable.app/auth/google/callback';
console.log('Using redirect URI:', redirectUri);

const oauth2Client = new OAuth2Client({
  clientId: Deno.env.get('GOOGLE_CLIENT_ID') || '',
  clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
  authorizationEndpointUri: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUri: "https://oauth2.googleapis.com/token",
  redirectUri: redirectUri,
  defaults: {
    scope: scopes,
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, eventData } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get user's Google refresh token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.google_refresh_token) {
      if (action === 'connect') {
        // Generate auth URL for initial connection
        const authUrl = await oauth2Client.code.getAuthorizationUri({
          state: user.id,
          access_type: 'offline',
          prompt: 'consent'
        });

        return new Response(
          JSON.stringify({ url: authUrl.toString() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('User not connected to Google Calendar');
    }

    // Set up authenticated fetch for Google Calendar API
    const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
      const tokens = await oauth2Client.refreshToken(profile.google_refresh_token);
      const headers = {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });
      
      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`);
      }
      
      return response.json();
    };

    let result;
    switch (action) {
      case 'callback': {
        const { code, state } = eventData;
        if (state !== user.id) {
          throw new Error('Invalid state parameter');
        }

        const tokens = await oauth2Client.code.getToken(code);
        
        // Store refresh token
        await supabase
          .from('profiles')
          .update({ google_refresh_token: tokens.refreshToken })
          .eq('id', user.id);

        result = { success: true };
        break;
      }

      case 'listEvents': {
        result = await makeAuthenticatedRequest(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + new URLSearchParams({
            timeMin: new Date().toISOString(),
            maxResults: '10',
            singleEvents: 'true',
            orderBy: 'startTime',
          })
        );
        break;
      }

      case 'createEvent': {
        result = await makeAuthenticatedRequest(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            body: JSON.stringify(eventData),
          }
        );
        break;
      }

      case 'deleteEvent': {
        await makeAuthenticatedRequest(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventData.id}`,
          { method: 'DELETE' }
        );
        result = { success: true };
        break;
      }

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});