
import { ActivityLog } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const fetchActivityLogs = async (): Promise<ActivityLog[]> => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
  
  return (data || []).map(log => ({
    id: log.id,
    action: log.action,
    details: log.details,
    userId: log.user_id,
    userName: log.user_name,
    timestamp: log.timestamp,
    patientId: log.patient_id
  }));
};

export const addActivityLog = async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  const { error } = await supabase
    .from('activity_logs')
    .insert({
      action: log.action,
      details: log.details,
      user_id: log.userId,
      user_name: log.userName,
      patient_id: log.patientId
    });

  if (error) {
    console.error('Error adding activity log:', error);
    throw error;
  }
};
