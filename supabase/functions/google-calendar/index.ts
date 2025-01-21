import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'npm:googleapis@126';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CALENDAR_ID = 'morzsi812@gmail.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, eventData } = await req.json();
    
    // Initialize Google Calendar API with service account
    const serviceAccount = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT') || '{}');
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      undefined,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/calendar']
    );

    const calendar = google.calendar({ version: 'v3', auth: jwtClient });
    console.log('Initialized Google Calendar API with service account');

    let result;
    switch (action) {
      case 'listEvents':
        console.log('Fetching calendar events from:', CALENDAR_ID);
        const response = await calendar.events.list({
          calendarId: CALENDAR_ID,
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });
        result = response.data;
        break;

      case 'createEvent':
        console.log('Creating calendar event in calendar:', CALENDAR_ID, 'Event data:', eventData);
        const createResponse = await calendar.events.insert({
          calendarId: CALENDAR_ID,
          requestBody: eventData,
        });
        result = createResponse.data;
        break;

      case 'deleteEvent':
        console.log('Deleting calendar event:', eventData.id, 'from calendar:', CALENDAR_ID);
        await calendar.events.delete({
          calendarId: CALENDAR_ID,
          eventId: eventData.id,
        });
        result = { success: true };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in Google Calendar function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});