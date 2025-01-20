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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, eventData } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('Invalid user token:', userError);
      throw new Error('Invalid user token');
    }

    console.log('Processing action:', action, 'for user:', user.id);

    // Get user's Google refresh token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    if (!profile?.google_refresh_token) {
      if (action === 'connect') {
        console.log('Generating auth URL for initial connection');
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
      console.error('User not connected to Google Calendar');
      throw new Error('User not connected to Google Calendar');
    }

    // Set up authenticated fetch for Google Calendar API
    const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
      console.log('Refreshing token for request to:', url);
      const tokens = await oauth2Client.refreshToken(profile.google_refresh_token);
      console.log('Token refreshed successfully');
      
      const headers = {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });
      
      if (!response.ok) {
        console.error('Google Calendar API error:', response.statusText);
        throw new Error(`Google Calendar API error: ${response.statusText}`);
      }
      
      return response.json();
    };

    let result;
    switch (action) {
      case 'callback': {
        console.log('Processing OAuth callback');
        const { code, state } = eventData;
        if (state !== user.id) {
          console.error('Invalid state parameter');
          throw new Error('Invalid state parameter');
        }

        const tokens = await oauth2Client.code.getToken(code);
        console.log('Obtained tokens successfully');
        
        // Store refresh token
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ google_refresh_token: tokens.refreshToken })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error storing refresh token:', updateError);
          throw updateError;
        }

        result = { success: true };
        break;
      }

      case 'listEvents': {
        console.log('Fetching calendar events');
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
        console.log('Creating calendar event');
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
        console.log('Deleting calendar event');
        await makeAuthenticatedRequest(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventData.id}`,
          { method: 'DELETE' }
        );
        result = { success: true };
        break;
      }

      default:
        console.error('Invalid action:', action);
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});