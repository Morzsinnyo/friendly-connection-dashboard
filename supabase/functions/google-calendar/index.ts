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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received request to Google Calendar function');
    const { action, eventData } = await req.json()
    let result;

    if (!Deno.env.get('GOOGLE_CLIENT_ID') || !Deno.env.get('GOOGLE_CLIENT_SECRET')) {
      throw new Error('Missing required Google Calendar credentials');
    }

    // Get the user's ID from the authorization header
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get the user's session
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    if (userError || !user) {
      throw new Error('Invalid user session');
    }

    console.log(`Processing action: ${action} for user: ${user.id}`);

    // Get the user's Google refresh token from your database/storage
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_refresh_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.google_refresh_token) {
      console.log('No refresh token found for user');
      // If no refresh token, proceed with OAuth flow
      if (action === 'connect') {
        const scopes = [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/calendar.readonly',
          'https://www.googleapis.com/auth/calendar.settings.readonly'
        ];
        
        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes,
          prompt: 'consent'  // Force consent screen to ensure we get refresh token
        });
        
        result = { url };
      } else {
        throw new Error('User not connected to Google Calendar');
      }
    } else {
      // Set the refresh token and get a new access token
      oauth2Client.setCredentials({
        refresh_token: profile.google_refresh_token
      });

      // Create calendar client with the authenticated oauth2Client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      switch (action) {
        case 'connect':
          const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.settings.readonly'
          ];
          
          const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'  // Force consent screen to ensure we get refresh token
          });
          
          result = { url };
          break;

        case 'listEvents':
          result = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
          });
          console.log('Successfully fetched events');
          break;

        case 'createEvent':
          result = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: eventData,
          });
          console.log('Successfully created event');
          break;

        case 'updateEvent':
          result = await calendar.events.update({
            calendarId: 'primary',
            eventId: eventData.id,
            requestBody: eventData,
          });
          console.log('Successfully updated event');
          break;

        case 'deleteEvent':
          result = await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventData.id,
          });
          console.log('Successfully deleted event');
          break;

        default:
          throw new Error('Invalid action');
      }
    }

    return new Response(
      JSON.stringify(result.data || result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in Google Calendar function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})