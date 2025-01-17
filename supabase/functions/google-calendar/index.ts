import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from "npm:googleapis@126.0.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const oauth2Client = new google.auth.OAuth2(
  Deno.env.get('GOOGLE_CLIENT_ID'),
  Deno.env.get('GOOGLE_CLIENT_SECRET'),
  'https://friendly-connection-dashboard.lovable.app/calendar/callback'
);

oauth2Client.setCredentials({
  access_token: 'placeholder',
  refresh_token: Deno.env.get('GOOGLE_REFRESH_TOKEN'),
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

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

    console.log(`Processing action: ${action}`);

    switch (action) {
      case 'connect':
        const scopes = [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events'
        ];
        
        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: scopes,
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