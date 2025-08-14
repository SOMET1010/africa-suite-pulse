import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  action: string;
  severity: string;
  new_values: any;
  occurred_at: string;
  user_id: string;
}

export function useSecurityMonitoring() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityEvents();
    
    // Set up real-time monitoring
    const subscription = supabase
      .channel('security_events')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'audit_logs',
          filter: 'table_name=eq.security_events'
        }, 
        (payload) => {
          const newEvent = payload.new as SecurityEvent;
          setEvents(prev => [newEvent, ...prev.slice(0, 99)]);
          
          // Show toast for critical events
          if (newEvent.severity === 'error') {
            toast.error(`Security Alert: ${newEvent.action}`, {
              description: 'Check security dashboard for details'
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'security_events')
        .order('occurred_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (eventType: string, details: any = {}, severity: string = 'info') => {
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_details: details,
        p_severity: severity
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const checkRateLimit = async (action: string, maxAttempts: number = 5, windowMinutes: number = 15) => {
    try {
      const { data, error } = await supabase.rpc('check_security_rate_limit', {
        p_action: action,
        p_max_attempts: maxAttempts,
        p_window_minutes: windowMinutes
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return false;
    }
  };

  return {
    events,
    loading,
    logSecurityEvent,
    checkRateLimit,
    refreshEvents: fetchSecurityEvents
  };
}