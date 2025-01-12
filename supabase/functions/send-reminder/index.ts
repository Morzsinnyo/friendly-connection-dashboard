import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req: Request): Promise<Response> => {
  console.log("Reminder function triggered");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get all contacts that need reminders
    const now = new Date();
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*, profiles(full_name)')
      .lte('next_reminder', now.toISOString());

    if (contactsError) {
      throw contactsError;
    }

    console.log(`Found ${contacts?.length || 0} contacts needing reminders`);

    // Send reminders for each contact
    for (const contact of contacts || []) {
      try {
        // Send email using Resend
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Lovable CRM <onboarding@resend.dev>",
            to: [contact.profiles.full_name], // Send to the user's email
            subject: `Reminder: Get in touch with ${contact.full_name}`,
            html: `
              <h2>Contact Reminder</h2>
              <p>It's time to get in contact with ${contact.full_name}!</p>
              <p>Last contact: ${contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'Never'}</p>
            `,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to send email: ${await res.text()}`);
        }

        // Calculate next reminder based on frequency
        let nextReminder = null;
        if (contact.reminder_frequency === 'daily') {
          nextReminder = new Date(now.setDate(now.getDate() + 1));
        } else if (contact.reminder_frequency === 'weekly') {
          nextReminder = new Date(now.setDate(now.getDate() + 7));
        } else if (contact.reminder_frequency === 'monthly') {
          nextReminder = new Date(now.setMonth(now.getMonth() + 1));
        }

        // Update the contact's next reminder
        if (nextReminder) {
          const { error: updateError } = await supabase
            .from('contacts')
            .update({ next_reminder: nextReminder.toISOString() })
            .eq('id', contact.id);

          if (updateError) {
            console.error(`Failed to update next reminder for contact ${contact.id}:`, updateError);
          }
        }

      } catch (error) {
        console.error(`Failed to process reminder for contact ${contact.id}:`, error);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);