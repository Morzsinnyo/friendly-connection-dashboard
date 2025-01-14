import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from "npm:googleapis@126.0.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize the OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  Deno.env.get('GOOGLE_CLIENT_ID'),
  Deno.env.get('GOOGLE_CLIENT_SECRET'),
  'http://localhost:5173/calendar/callback' // Update this with your production URL later
);

// Set credentials directly (this is temporary, in production you should handle token refresh)
oauth2Client.setCredentials({
  access_token: 'placeholder', // This will be replaced with actual token
  refresh_token: Deno.env.get('GOOGLE_REFRESH_TOKEN'),
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Received request to Google Calendar function');
    const { action, eventData } = await req.json()
    let result;

    // Verify we have the necessary credentials
    if (!Deno.env.get('GOOGLE_CLIENT_ID') || !Deno.env.get('GOOGLE_CLIENT_SECRET')) {
      throw new Error('Missing required Google Calendar credentials');
    }

    console.log(`Processing action: ${action}`);

    switch (action) {
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
      JSON.stringify(result.data),
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