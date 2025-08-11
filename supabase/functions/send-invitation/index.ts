import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  to: string;
  subject: string;
  message?: string;
  invitationUrl: string;
  eventTitle: string;
  guestName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, invitationUrl, eventTitle, guestName }: InvitationEmailRequest = await req.json();

    const customMessage = message || `Vous êtes cordialement invité(e) à ${eventTitle}. Cliquez sur le lien ci-dessous pour confirmer votre présence.`;

    const emailResponse = await resend.emails.send({
      from: "Invitation <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1f36, #d4af37); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Invitation Spéciale</h1>
          </div>
          
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1f36; margin-bottom: 20px;">Bonjour ${guestName},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              ${customMessage}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" style="
                display: inline-block;
                background: linear-gradient(135deg, #1a1f36, #d4af37);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                font-size: 16px;
                text-transform: uppercase;
                letter-spacing: 1px;
                box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
              ">
                Confirmer ma présence
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>
              <p style="color: #666; font-size: 14px; word-break: break-all; margin: 10px 0;">
                ${invitationUrl}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
              <h3 style="color: #1a1f36; margin-bottom: 10px; font-size: 18px;">${eventTitle}</h3>
              <p style="color: #666; margin: 0; font-style: italic;">
                Votre présence nous ferait grand plaisir !
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);