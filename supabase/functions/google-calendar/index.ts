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
    case 'Every 2 months':
      return 'RRULE:FREQ=MONTHLY;INTERVAL=2';
    case 'Every 3 months':
      return 'RRULE:FREQ=MONTHLY;INTERVAL=3';
    default:
      return '';
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

const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseKey);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, eventData, calendarId, contactName, contactId } = await req.json();
    console.log('Received request:', { action, calendarId, contactName, contactId });
    
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
        console.log('Creating calendar event');
        if (!eventData.summary || !eventData.start || !eventData.end) {
          throw new Error('Missing required event fields');
        }

        const extendedProperties = {
          private: {
            contactId: contactId || '',
            reminderStatus: 'pending'
          }
        };

        if (eventData.frequency) {
          const recurrenceRule = getRecurrenceRule(eventData.frequency);
          if (recurrenceRule) {
            eventData.recurrence = [recurrenceRule];
          }
          delete eventData.frequency;
        }

        if (!eventData.start.timeZone) eventData.start.timeZone = 'UTC';
        if (!eventData.end.timeZone) eventData.end.timeZone = 'UTC';

        const createResponse = await calendar.events.insert({
          calendarId,
          requestBody: {
            ...eventData,
            extendedProperties,
          },
        });
        
        if (contactId) {
          const supabase = createSupabaseClient();
          await supabase
            .from('contacts')
            .update({ 
              calendar_event_id: createResponse.data.id,
              reminder_status: 'pending'
            })
            .eq('id', contactId);
        }
        
        result = createResponse.data;
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