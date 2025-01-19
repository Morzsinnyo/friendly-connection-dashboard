import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { google } from "https://deno.land/x/googleapis@v118.0.0/googleapis.ts";
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

// Update the redirect URI to match what's configured in Google Cloud Console
const redirectUri = 'https://friendly-connection-dashboard.lovable.app/auth/google/callback';

console.log('Using redirect URI:', redirectUri);

const oauth2Client = new google.auth.OAuth2(
  Deno.env.get('GOOGLE_CLIENT_ID'),
  Deno.env.get('GOOGLE_CLIENT_SECRET'),
  redirectUri
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

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
        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes,
          state: user.id, // Pass user ID to verify in callback
          prompt: 'consent' // Force consent screen to get refresh token
        });

        return new Response(
          JSON.stringify({ url: authUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('User not connected to Google Calendar');
    }

    // Set credentials if we have a refresh token
    oauth2Client.setCredentials({
      refresh_token: profile.google_refresh_token
    });

    let result;
    switch (action) {
      case 'callback':
        const { code, state } = eventData;
        if (state !== user.id) {
          throw new Error('Invalid state parameter');
        }

        const { tokens } = await oauth2Client.getToken(code);
        
        // Store refresh token
        await supabase
          .from('profiles')
          .update({ google_refresh_token: tokens.refresh_token })
          .eq('id', user.id);

        result = { success: true };
        break;

      case 'listEvents':
        const events = await calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });
        result = events.data;
        break;

      case 'createEvent':
        const event = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: eventData,
        });
        result = event.data;
        break;

      case 'deleteEvent':
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: eventData.id,
        });
        result = { success: true };
        break;

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