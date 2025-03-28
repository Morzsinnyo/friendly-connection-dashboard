import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { google } from 'npm:googleapis@126';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getRecurrenceRule = (frequency: string): string[] => {
  switch (frequency) {
    case 'Every week':
      return ['RRULE:FREQ=WEEKLY'];
    case 'Every 2 weeks':
      return ['RRULE:FREQ=WEEKLY;INTERVAL=2'];
    case 'Monthly':
      return ['RRULE:FREQ=MONTHLY'];
    case 'Every 2 months':
      return ['RRULE:FREQ=MONTHLY;INTERVAL=2'];
    case 'Every 3 months':
      return ['RRULE:FREQ=MONTHLY;INTERVAL=3'];
    default:
      return [];
  }
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
    console.log('[Google Calendar] Request received:', { action, calendarId, contactName });
    
    if (!calendarId) {
      throw new Error('Calendar ID is required');
    }

    const calendar = await createClient();
    console.log('[Google Calendar] Client initialized');

    let result;
    switch (action) {
      case 'createEvent': {
        console.log('[Google Calendar] Creating event with data:', {
          summary: eventData.summary,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end,
          recurrence: eventData.frequency ? getRecurrenceRule(eventData.frequency) : []
        });

        if (!eventData.summary || !eventData.start || !eventData.end) {
          throw new Error('Missing required event fields');
        }

        if (!eventData.description) {
          console.warn('[Google Calendar] No description provided for event');
        }

        // Ensure the event is 1 hour long
        const startDate = new Date(eventData.start.dateTime);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 1);

        const recurrence = eventData.frequency ? getRecurrenceRule(eventData.frequency) : [];
        console.log('[Google Calendar] Recurrence rule:', recurrence);

        // Use the description directly without transformation
        console.log('[Google Calendar] Using description:', eventData.description);

        const event = {
          summary: eventData.summary,
          description: eventData.description, // Use description directly
          start: {
            dateTime: startDate.toISOString(),
            timeZone: 'UTC',
          },
          end: {
            dateTime: endDate.toISOString(),
            timeZone: 'UTC',
          },
          recurrence,
          reminders: eventData.reminders,
        };

        console.log('[Google Calendar] Final event configuration:', JSON.stringify(event, null, 2));
        const createResponse = await calendar.events.insert({
          calendarId,
          requestBody: event,
        });
        
        console.log('[Google Calendar] Event created successfully:', createResponse.data);
        result = createResponse.data;
        break;
      }

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

      case 'updateEventStatus': {
        console.log('Updating event status');
        const event = await calendar.events.get({
          calendarId,
          eventId: eventData.id
        });

        const contactId = event.data.extendedProperties?.private?.contactId;
        if (contactId) {
          const supabase = createSupabaseClient();
          await supabase
            .from('contacts')
            .update({ 
              reminder_status: eventData.status,
              last_contact: eventData.status === 'completed' ? new Date().toISOString() : null
            })
            .eq('id', contactId);
        }

        const updatedEvent = await calendar.events.patch({
          calendarId,
          eventId: eventData.id,
          requestBody: {
            extendedProperties: {
              private: {
                ...event.data.extendedProperties?.private,
                reminderStatus: eventData.status
              }
            }
          }
        });
        
        result = updatedEvent.data;
        break;
      }

      case 'deleteEvent': {
        console.log('Deleting event');
        await calendar.events.delete({
          calendarId,
          eventId: eventData.id,
        });
        result = { success: true };
        break;
      }

      case 'deleteExistingReminders': {
        console.log('Deleting existing reminders');
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
    console.error('[Google Calendar] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});