import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'npm:googleapis@126';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define all required scopes for full calendar access
const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.settings.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly'
];

const oauth2Client = new google.auth.OAuth2(
  Deno.env.get('GOOGLE_CLIENT_ID'),
  Deno.env.get('GOOGLE_CLIENT_SECRET'),
  `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar/callback`
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, eventData } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    // Get user from Supabase auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw userError;
    if (!user) throw new Error('No user found');

    // Get user's Google refresh token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token')
      .eq('id', user.id)
      .single();

    let result;

    if (!profile?.google_refresh_token) {
      console.log('No refresh token found for user');
      
      if (action === 'connect') {
        console.log('Generating OAuth URL for initial connection');
        console.log('Required scopes:', REQUIRED_SCOPES);
        
        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: REQUIRED_SCOPES.join(' '),
          prompt: 'consent', // Force consent screen
          include_granted_scopes: true,
          state: user.id,
        });
        
        console.log('Generated OAuth URL with scopes:', REQUIRED_SCOPES);
        result = { url };
      } else {
        throw new Error('User not connected to Google Calendar');
      }
    } else {
      // Set refresh token and try to refresh access token
      oauth2Client.setCredentials({
        refresh_token: profile.google_refresh_token
      });

      try {
        await oauth2Client.getAccessToken();
        console.log('Successfully refreshed access token');
      } catch (refreshError) {
        console.error('Error refreshing access token:', refreshError);
        throw new Error('Failed to refresh access token');
      }

      // Handle different actions
      switch (action) {
        case 'connect':
          console.log('Generating OAuth URL for reconnection');
          const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: REQUIRED_SCOPES.join(' '),
            prompt: 'consent',
            include_granted_scopes: true,
            state: user.id,
          });
          
          console.log('Generated OAuth URL with scopes:', REQUIRED_SCOPES);
          result = { url };
          break;

        case 'callback':
          const { code } = eventData;
          console.log('Handling OAuth callback with code');

          const { tokens } = await oauth2Client.getToken(code);
          oauth2Client.setCredentials(tokens);

          console.log('Received tokens from Google:', {
            access_token: tokens.access_token ? 'present' : 'missing',
            refresh_token: tokens.refresh_token ? 'present' : 'missing',
            scope: tokens.scope,
            expiry_date: tokens.expiry_date
          });

          if (!tokens.refresh_token) {
            console.error('No refresh token received from Google');
            throw new Error('No refresh token received from Google. Please revoke access and try again.');
          }

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ google_refresh_token: tokens.refresh_token })
            .eq('id', user.id);

          if (updateError) throw updateError;
          
          result = { success: true };
          break;

        case 'listEvents':
          console.log('Fetching calendar events');
          const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
          });
          
          result = response.data;
          break;

        case 'createEvent':
          console.log('Creating calendar event:', eventData);
          const createResponse = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: eventData,
          });
          
          result = createResponse.data;
          break;

        case 'deleteEvent':
          console.log('Deleting calendar event:', eventData.id);
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventData.id,
          });
          
          result = { success: true };
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Google Calendar function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: 'auth_error',
        needsReconnect: error.message.includes('Failed to refresh access token') || 
                       error.message.includes('No refresh token')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});