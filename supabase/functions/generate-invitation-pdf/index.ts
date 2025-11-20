import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationPDFRequest {
  eventId: string;
  inviteeId: string;
  inviteeName: string;
  inviteeTable?: string;
  invitationImageUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { eventId, inviteeId, inviteeName, inviteeTable, invitationImageUrl }: InvitationPDFRequest = await req.json();

    console.log('Generating PDF for:', { eventId, inviteeId, inviteeName });

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    // Fetch event program
    const { data: programs, error: programError } = await supabase
      .from('event_programs')
      .select('*')
      .eq('event_id', eventId)
      .order('display_order', { ascending: true });

    if (programError) throw programError;

    // Fetch invitee for QR code
    const { data: invitee } = await supabase
      .from('invitees')
      .select('qr_code_data, token')
      .eq('id', inviteeId)
      .single();

    // Generate HTML content for PDF
    const htmlContent = generateInvitationHTML(event, inviteeName, inviteeTable, programs, invitationImageUrl, invitee?.qr_code_data || invitee?.token);

    // Note: For actual PDF generation, you would use a library like jsPDF or puppeteer
    // For now, we return the HTML that can be converted to PDF on the client side
    // or use a service like html2pdf
    
    const pdfData = {
      html: htmlContent,
      event,
      inviteeName,
      inviteeTable,
      programs
    };

    return new Response(JSON.stringify(pdfData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateInvitationHTML(
  event: any,
  inviteeName: string,
  inviteeTable: string | undefined,
  programs: any[],
  invitationImageUrl?: string,
  qrCodeData?: string
): string {
  const eventDate = new Date(event.date_time).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const eventTime = new Date(event.date_time).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Georgia', serif;
          color: #333;
        }
        .page {
          page-break-after: always;
          width: 210mm;
          height: 297mm;
          position: relative;
          overflow: hidden;
        }
        .page:last-child {
          page-break-after: avoid;
        }
        
        /* Page 1 - Invitation Image */
        .page-1 {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .header-info {
          position: absolute;
          top: 40px;
          left: 0;
          right: 0;
          text-align: center;
          background: rgba(255, 255, 255, 0.95);
          padding: 30px;
          margin: 0 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .invitee-name {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 10px;
        }
        .invitee-table {
          font-size: 20px;
          color: #666;
          font-style: italic;
        }
        .invitation-image {
          max-width: 80%;
          max-height: 60%;
          object-fit: contain;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          margin-top: 180px;
        }
        
        /* Page 2 - Event Details */
        .page-2 {
          background-image: url('${event.background_image_url || ''}');
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .page-2::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }
        .event-details {
          position: relative;
          z-index: 1;
          color: white;
          padding: 60px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .event-title {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 40px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .event-info {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          padding: 40px;
          border-radius: 15px;
          margin-bottom: 20px;
        }
        .info-row {
          margin-bottom: 25px;
          font-size: 20px;
          display: flex;
          align-items: center;
        }
        .info-label {
          font-weight: bold;
          min-width: 150px;
          color: #667eea;
        }
        .event-description {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          padding: 30px;
          border-radius: 15px;
          font-size: 18px;
          line-height: 1.8;
        }
        
        /* Page 3 - Program */
        .page-3 {
          background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
          padding: 60px;
        }
        .program-header {
          text-align: center;
          margin-bottom: 50px;
        }
        .program-title {
          font-size: 42px;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 15px;
        }
        .program-subtitle {
          font-size: 20px;
          color: #666;
        }
        .program-item {
          background: white;
          padding: 25px 30px;
          margin-bottom: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-left: 5px solid #667eea;
        }
        .program-time {
          font-size: 16px;
          color: #667eea;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .program-item-title {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #333;
        }
        .program-location {
          font-size: 16px;
          color: #666;
          font-style: italic;
          margin-bottom: 8px;
        }
        .program-description {
          font-size: 16px;
          color: #555;
          line-height: 1.6;
        }
        .no-program {
          text-align: center;
          color: #666;
          font-size: 20px;
          margin-top: 100px;
        }
        
        /* Page 4 - QR Code and Guest Info */
        .page-4 {
          background: white;
          padding: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .qr-title {
          font-size: 36px;
          color: #1a1f36;
          margin-bottom: 30px;
          text-align: center;
        }
        .qr-container {
          background: white;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          margin-bottom: 40px;
          text-align: center;
        }
        .qr-code {
          width: 300px;
          height: 300px;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #667eea;
          border-radius: 10px;
          margin: 0 auto;
        }
        .guest-info-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          border-radius: 15px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }
        .guest-info-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 25px;
          text-align: center;
          border-bottom: 2px solid rgba(255,255,255,0.3);
          padding-bottom: 15px;
        }
        .guest-detail {
          font-size: 18px;
          margin: 15px 0;
          padding: 10px 0;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .guest-detail-label {
          font-weight: 600;
          opacity: 0.9;
        }
        .guest-detail-value {
          font-weight: 400;
        }
      </style>
    </head>
    <body>
      <!-- Page 1: Invitation Image -->
      <div class="page page-1">
        <div class="header-info">
          <div class="invitee-name">${inviteeName}</div>
          ${inviteeTable ? `<div class="invitee-table">Table: ${inviteeTable}</div>` : ''}
        </div>
        ${invitationImageUrl ? `<img src="${invitationImageUrl}" alt="Invitation" class="invitation-image">` : '<div class="invitation-image" style="background: white; padding: 100px; text-align: center; font-size: 48px; color: #667eea;">Invitation</div>'}
      </div>
      
      <!-- Page 2: Event Details -->
      <div class="page page-2">
        <div class="event-details">
          <div class="event-title">${event.title}</div>
          <div class="event-info">
            <div class="info-row">
              <span class="info-label">📅 Date:</span>
              <span>${eventDate}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🕐 Heure:</span>
              <span>${eventTime}</span>
            </div>
            <div class="info-row">
              <span class="info-label">📍 Lieu:</span>
              <span>${event.location}</span>
            </div>
            ${event.event_type ? `
            <div class="info-row">
              <span class="info-label">🎭 Type:</span>
              <span>${event.event_type}</span>
            </div>
            ` : ''}
          </div>
          ${event.description ? `
          <div class="event-description">
            ${event.description}
          </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Page 3: Program -->
      <div class="page page-3">
        <div class="program-header">
          <div class="program-title">Programme de l'événement</div>
          <div class="program-subtitle">Déroulement de la soirée</div>
        </div>
        ${programs && programs.length > 0 ? programs.map(program => {
          const startTime = new Date(program.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          const endTime = new Date(program.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          return `
          <div class="program-item">
            <div class="program-time">${startTime} - ${endTime}</div>
            <div class="program-item-title">${program.title}</div>
            ${program.location ? `<div class="program-location">📍 ${program.location}</div>` : ''}
            ${program.description ? `<div class="program-description">${program.description}</div>` : ''}
          </div>
          `;
        }).join('') : '<div class="no-program">Programme à venir...</div>'}
      </div>
      
      <!-- Page 4: QR Code & Guest Information -->
      <div class="page page-4">
        <div class="qr-title">Votre Invitation Personnalisée</div>
        <div class="qr-container">
          ${qrCodeData ? `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}" alt="QR Code" class="qr-code">
          ` : '<div class="qr-code"><span style="color: #999;">QR Code</span></div>'}
          <p style="margin-top: 20px; color: #666; font-size: 14px;">Présentez ce code à l'entrée</p>
        </div>
        
        <div class="guest-info-card">
          <div class="guest-info-title">Informations de l'invité</div>
          <div class="guest-detail">
            <span class="guest-detail-label">Nom:</span>
            <span class="guest-detail-value">${inviteeName}</span>
          </div>
          ${inviteeTable ? `
          <div class="guest-detail">
            <span class="guest-detail-label">Table:</span>
            <span class="guest-detail-value">${inviteeTable}</span>
          </div>
          ` : ''}
          <div class="guest-detail">
            <span class="guest-detail-label">Événement:</span>
            <span class="guest-detail-value">${event.title}</span>
          </div>
          <div class="guest-detail">
            <span class="guest-detail-label">Date:</span>
            <span class="guest-detail-value">${eventDate}</span>
          </div>
          <div class="guest-detail">
            <span class="guest-detail-label">Heure:</span>
            <span class="guest-detail-value">${eventTime}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
