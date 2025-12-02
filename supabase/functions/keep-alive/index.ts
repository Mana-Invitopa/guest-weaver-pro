import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const timestamp = new Date().toISOString();
    console.log(`[Keep-Alive] Ping at ${timestamp}`);

    // Execute multiple lightweight queries to keep the database active
    const queries = await Promise.all([
      // Query 1: Simple count on events
      supabase.from('events').select('id', { count: 'exact', head: true }),
      
      // Query 2: Simple count on invitees
      supabase.from('invitees').select('id', { count: 'exact', head: true }),
      
      // Query 3: Simple count on rsvps
      supabase.from('rsvps').select('id', { count: 'exact', head: true }),
      
      // Query 4: Check profiles table
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      
      // Query 5: Cleanup expired verification codes
      supabase.rpc('cleanup_expired_codes'),
    ]);

    const [eventsResult, inviteesResult, rsvpsResult, profilesResult, cleanupResult] = queries;

    // Log results
    const stats = {
      timestamp,
      events_count: eventsResult.count || 0,
      invitees_count: inviteesResult.count || 0,
      rsvps_count: rsvpsResult.count || 0,
      profiles_count: profilesResult.count || 0,
      expired_codes_cleaned: cleanupResult.data || 0,
      errors: [
        eventsResult.error,
        inviteesResult.error,
        rsvpsResult.error,
        profilesResult.error,
        cleanupResult.error
      ].filter(Boolean).map(e => e?.message)
    };

    console.log('[Keep-Alive] Stats:', JSON.stringify(stats));

    // Update pulse metrics with activity
    const { data: userData } = await supabase.auth.getUser();
    
    // Create a simple health check record in system_alerts for admins
    // This is optional - only if we want to track keep-alive runs
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Database keep-alive successful',
      stats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Keep-Alive] Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
