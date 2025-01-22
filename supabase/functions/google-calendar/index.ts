import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'npm:googleapis@126';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getRecurrenceRule = (frequency: string): string => {
  switch (frequency) {
    case 'Every week':
      return 'RRULE:FREQ=WEEKLY';
    case 'Every 2 weeks':
      return 'RRULE:FREQ=WEEKLY;INTERVAL=2';
    case 'Monthly':
      return 'RRULE:FREQ=MONTHLY';
    default:
      return '';
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, eventData, calendarId } = await req.json();
    console.log('Received request:', { action, calendarId, eventData });
    
    if (!calendarId) {
      throw new Error('Calendar ID is required');
    }

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

    // Verify service account permissions
    try {
      await calendar.calendarList.list();
      console.log('Service account permissions verified');
    } catch (error) {
      console.error('Service account permission error:', error);
      throw new Error('Failed to verify service account permissions');
    }

    // Validate calendar ID
    try {
      await calendar.calendars.get({ calendarId });
      console.log('Calendar ID validated:', calendarId);
    } catch (error) {
      console.error('Invalid calendar ID:', error);
      throw new Error('Invalid calendar ID');
    }

    let result;
    switch (action) {
      case 'listEvents':
        console.log('Fetching calendar events from:', calendarId);
        const response = await calendar.events.list({
          calendarId,
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });
        result = response.data;
        break;

      case 'createEvent':
        console.log('Creating calendar event in calendar:', calendarId, 'Event data:', eventData);
        
        // Validate event data
        if (!eventData.summary || !eventData.start || !eventData.end) {
          throw new Error('Missing required event fields');
        }

        // Add recurrence if frequency is provided
        if (eventData.frequency) {
          const recurrenceRule = getRecurrenceRule(eventData.frequency);
          if (recurrenceRule) {
            eventData.recurrence = [recurrenceRule];
          }
          delete eventData.frequency; // Remove frequency from eventData as it's not needed by Google Calendar
        }

        // Ensure proper timezone
        if (!eventData.start.timeZone) {
          eventData.start.timeZone = 'UTC';
        }
        if (!eventData.end.timeZone) {
          eventData.end.timeZone = 'UTC';
        }

        const createResponse = await calendar.events.insert({
          calendarId,
          requestBody: eventData,
        });
        
        console.log('Successfully created event:', createResponse.data);
        result = createResponse.data;
        break;

      case 'deleteEvent':
        console.log('Deleting calendar event:', eventData.id, 'from calendar:', calendarId);
        await calendar.events.delete({
          calendarId,
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
        status: 400
      }
    );
  }
});