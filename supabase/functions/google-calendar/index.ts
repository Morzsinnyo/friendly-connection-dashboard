import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'npm:googleapis@126';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getRecurrenceRule = (frequency: string, customRecurrence?: any): string[] => {
  console.log('Generating recurrence rule for:', { frequency, customRecurrence });

  if (!frequency) return [];

  if (frequency === 'Custom' && customRecurrence) {
    const { interval, unit, ends, endDate, occurrences } = customRecurrence;
    let rrule = `FREQ=${unit.toUpperCase()};INTERVAL=${interval}`;
    
    if (ends === 'on' && endDate) {
      const until = new Date(endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      rrule += `;UNTIL=${until}`;
    } else if (ends === 'after' && occurrences) {
      rrule += `;COUNT=${occurrences}`;
    }
    
    console.log('Generated custom RRULE:', rrule);
    return [`RRULE:${rrule}`];
  }

  // Standard frequencies with explicit intervals
  const frequencies: Record<string, string> = {
    'Every week': 'FREQ=WEEKLY;INTERVAL=1',
    'Every 2 weeks': 'FREQ=WEEKLY;INTERVAL=2',
    'Monthly': 'FREQ=MONTHLY;INTERVAL=1'
  };

  const rule = frequencies[frequency];
  console.log('Generated standard RRULE:', rule);
  return rule ? [`RRULE:${rule}`] : [];
};

const createClient = async () => {
  try {
    const serviceAccount = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT') || '{}');
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      undefined,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/calendar']
    );
    return google.calendar({ version: 'v3', auth: jwtClient });
  } catch (error) {
    console.error('Error creating Google Calendar client:', error);
    throw new Error('Failed to initialize Google Calendar client');
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, eventData, calendarId, contactName } = await req.json();
    console.log('Received request:', { action, calendarId, contactName });
    
    if (!calendarId) {
      throw new Error('Calendar ID is required');
    }

    const calendar = await createClient();
    console.log('Google Calendar client initialized');

    let result;
    switch (action) {
      case 'listEvents': {
        console.log('Fetching calendar events');
        const response = await calendar.events.list({
          calendarId,
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });
        result = response.data;
        break;
      }

      case 'createEvent': {
        console.log('Creating calendar event with data:', eventData);
        if (!eventData.summary || !eventData.start || !eventData.end) {
          throw new Error('Missing required event fields');
        }

        const recurrenceRules = getRecurrenceRule(eventData.frequency, eventData.customRecurrence);
        console.log('Using recurrence rules:', recurrenceRules);

        // Create the event request body with proper recurrence
        const requestBody = {
          summary: eventData.summary,
          description: eventData.description,
          start: {
            dateTime: eventData.start.dateTime,
            timeZone: eventData.start.timeZone || 'UTC'
          },
          end: {
            dateTime: eventData.end.dateTime,
            timeZone: eventData.end.timeZone || 'UTC'
          },
          reminders: eventData.reminders,
          recurrence: recurrenceRules
        };

        console.log('Final event request body:', JSON.stringify(requestBody, null, 2));

        const createResponse = await calendar.events.insert({
          calendarId,
          requestBody,
        });
        
        console.log('Event created successfully:', createResponse.data);
        result = createResponse.data;
        break;
      }

      case 'deleteEvent': {
        console.log('Deleting event:', eventData.id);
        await calendar.events.delete({
          calendarId,
          eventId: eventData.id,
        });
        result = { success: true };
        break;
      }

      case 'deleteExistingReminders': {
        console.log('Deleting existing reminders for:', contactName);
        if (!contactName) {
          throw new Error('Contact name is required for deleting reminders');
        }

        const searchResponse = await calendar.events.list({
          calendarId,
          q: `${contactName} - It's time to contact`,
          timeMin: new Date().toISOString(),
          singleEvents: false,
        });

        console.log('Found events to delete:', searchResponse.data.items?.length || 0);

        const deletionPromises = (searchResponse.data.items || []).map(event => 
          calendar.events.delete({
            calendarId,
            eventId: event.id as string,
          })
        );

        await Promise.all(deletionPromises);
        result = { success: true, deletedCount: deletionPromises.length };
        break;
      }

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