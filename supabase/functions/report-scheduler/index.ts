import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function getSecureCorsHeaders(request: Request): Record<string, string> {
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://app.africasuite.com').split(',');
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.africasuite.com';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

interface SchedulerRequest {
  action: 'check' | 'execute';
  scheduleId?: string;
}

serve(async (req) => {
  const corsHeaders = getSecureCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { action, scheduleId }: SchedulerRequest = await req.json();

    console.log(`Report scheduler action: ${action}`, scheduleId ? `for schedule ${scheduleId}` : '');

    if (action === 'check') {
      // Check for due schedules and execute them
      const dueSchedules = await findDueSchedules();
      
      for (const schedule of dueSchedules) {
        console.log(`Executing scheduled report: ${schedule.templateId}`);
        await executeScheduledReport(schedule);
      }

      return new Response(JSON.stringify({
        success: true,
        executed: dueSchedules.length,
        schedules: dueSchedules.map(s => s.id)
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      });
    }

    if (action === 'execute' && scheduleId) {
      // Execute a specific schedule manually
      const schedule = await findScheduleById(scheduleId);
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      await executeScheduledReport(schedule);

      return new Response(JSON.stringify({
        success: true,
        message: `Schedule ${scheduleId} executed successfully`
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in report scheduler:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });
  }
});

async function findDueSchedules() {
  // Mock schedules - in real implementation, query database for due schedules
  const now = new Date();
  const mockSchedules = [
    {
      id: '1',
      templateId: '1',
      frequency: 'daily',
      time: '08:00',
      isActive: true,
      orgId: 'mock-org-id',
      lastRun: new Date(now.getTime() - 25 * 60 * 60 * 1000), // 25 hours ago
      nextRun: new Date(now.getTime() - 1 * 60 * 60 * 1000) // 1 hour ago (due)
    }
  ];

  // Filter schedules that are due
  return mockSchedules.filter(schedule => {
    if (!schedule.isActive) return false;
    return schedule.nextRun && schedule.nextRun <= now;
  });
}

async function findScheduleById(scheduleId: string) {
  // Mock schedule lookup
  return {
    id: scheduleId,
    templateId: '1',
    frequency: 'daily',
    time: '08:00',
    isActive: true,
    orgId: 'mock-org-id'
  };
}

async function executeScheduledReport(schedule: any) {
  try {
    console.log(`Executing scheduled report for template ${schedule.templateId}`);

    // Call the generate-report function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        templateId: schedule.templateId,
        orgId: schedule.orgId,
        manual: false
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Report generated successfully:', result);

    // Update schedule's last run and calculate next run
    await updateScheduleAfterExecution(schedule);

    return result;
  } catch (error) {
    console.error(`Failed to execute scheduled report for template ${schedule.templateId}:`, error);
    throw error;
  }
}

async function updateScheduleAfterExecution(schedule: any) {
  const now = new Date();
  let nextRun = new Date(now);

  // Calculate next run based on frequency
  switch (schedule.frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
  }

  // Set the time from schedule
  const [hours, minutes] = schedule.time.split(':');
  nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  console.log(`Schedule ${schedule.id} next run: ${nextRun.toISOString()}`);

  // In real implementation, update database with lastRun and nextRun
}