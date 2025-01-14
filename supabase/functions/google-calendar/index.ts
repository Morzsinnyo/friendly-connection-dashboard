import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { google } from "npm:googleapis@126.0.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const oauth2Client = new google.auth.OAuth2(
  Deno.env.get('GOOGLE_CLIENT_ID'),
  Deno.env.get('GOOGLE_CLIENT_SECRET'),
  'http://localhost:5173/calendar/callback' // We'll update this with your production URL later
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, eventData } = await req.json()
    let result;

    switch (action) {
      case 'listEvents':
        result = await calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });
        break;

      case 'createEvent':
        result = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: eventData,
        });
        break;

      case 'updateEvent':
        result = await calendar.events.update({
          calendarId: 'primary',
          eventId: eventData.id,
          requestBody: eventData,
        });
        break;

      case 'deleteEvent':
        result = await calendar.events.delete({
          calendarId: 'primary',
          eventId: eventData.id,
        });
        break;

      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result.data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})