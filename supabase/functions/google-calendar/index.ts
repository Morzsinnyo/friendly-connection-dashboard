import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from "npm:googleapis@126.0.1"
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const oauth2Client = new google.auth.OAuth2(
  Deno.env.get('GOOGLE_CLIENT_ID'),
  Deno.env.get('GOOGLE_CLIENT_SECRET'),
  'https://friendly-connection-dashboard.lovable.app/calendar/callback'
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to Google Calendar function');
    const { action, eventData } = await req.json();
    let result;

    if (!Deno.env.get('GOOGLE_CLIENT_ID') || !Deno.env.get('GOOGLE_CLIENT_SECRET')) {
      console.error('Missing Google Calendar credentials');
      throw new Error('Missing required Google Calendar credentials');
    }

    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    console.log('Fetching user session...');
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      console.error('Invalid user session:', userError);
      throw new Error('Invalid user session');
    }

    console.log(`Processing action: ${action} for user: ${user.id}`);
    console.log('Fetching user profile and tokens...');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    if (!profile?.google_refresh_token) {
      console.log('No refresh token found for user');
      
      if (action === 'connect') {
        console.log('Generating OAuth URL for initial connection');
        const scopes = [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ];
        
        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes.join(' '),
          prompt: 'consent',
          state: user.id,
        });
        
        console.log('Generated OAuth URL with scopes:', scopes);
        result = { url };
      } else {
        throw new Error('User not connected to Google Calendar');
      }
    } else {
      console.log('Setting credentials with refresh token');
      oauth2Client.setCredentials({
        refresh_token: profile.google_refresh_token
      });

      try {
        console.log('Refreshing access token...');
        await oauth2Client.refreshAccessToken();
        console.log('Successfully refreshed access token');
      } catch (refreshError) {
        console.error('Error refreshing access token:', refreshError);
        throw new Error('Failed to refresh access token');
      }

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      switch (action) {
        case 'connect':
          console.log('Generating OAuth URL for reconnection');
          const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
          ];
          
          const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes.join(' '),
            prompt: 'consent',
            state: user.id,
          });
          
          console.log('Generated OAuth URL with scopes:', scopes);
          result = { url };
          break;

        case 'callback':
          if (!eventData.code) {
            throw new Error('No authorization code provided');
          }

          console.log('Processing OAuth callback');
          const { tokens } = await oauth2Client.getToken(eventData.code);
          console.log('Received tokens from Google:', {
            access_token: tokens.access_token ? 'present' : 'missing',
            refresh_token: tokens.refresh_token ? 'present' : 'missing',
            expiry_date: tokens.expiry_date
          });

          if (!tokens.refresh_token) {
            console.error('No refresh token received from Google');
            throw new Error('No refresh token received from Google');
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ google_refresh_token: tokens.refresh_token })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error storing refresh token:', updateError);
            throw new Error('Failed to store refresh token');
          }

          console.log('Successfully stored refresh token');
          result = { success: true };
          break;

        case 'listEvents':
          console.log('Fetching calendar events');
          try {
            result = await calendar.events.list({
              calendarId: 'primary',
              timeMin: new Date().toISOString(),
              maxResults: 10,
              singleEvents: true,
              orderBy: 'startTime',
            });
            console.log('Successfully fetched events');
          } catch (apiError) {
            console.error('Google Calendar API Error:', apiError);
            throw new Error('Failed to fetch calendar events');
          }
          break;

        case 'createEvent':
          console.log('Creating calendar event');
          try {
            result = await calendar.events.insert({
              calendarId: 'primary',
              requestBody: eventData,
            });
            console.log('Successfully created event');
          } catch (apiError) {
            console.error('Google Calendar API Error:', apiError);
            throw new Error('Failed to create calendar event');
          }
          break;

        case 'deleteEvent':
          console.log('Deleting calendar event');
          try {
            result = await calendar.events.delete({
              calendarId: 'primary',
              eventId: eventData.id,
            });
            console.log('Successfully deleted event');
          } catch (apiError) {
            console.error('Google Calendar API Error:', apiError);
            throw new Error('Failed to delete calendar event');
          }
          break;

        default:
          throw new Error('Invalid action');
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Google Calendar function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});