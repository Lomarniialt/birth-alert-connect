
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, LaborRoom, MessageTemplate, ActivityLog } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HospitalContextType {
  patients: Patient[];
  laborRooms: LaborRoom[];
  messageTemplates: MessageTemplate[];
  activityLogs: ActivityLog[];
  isLoading: boolean;
  registerPatient: (patient: Omit<Patient, 'id' | 'status' | 'registeredAt'>) => Promise<void>;
  acceptPatient: (patientId: string, laborRoomId: string) => Promise<void>;
  completeDelivery: (patientId: string, details: { babyGender: 'male' | 'female'; deliveryNotes: string; templateId: string }) => Promise<void>;
  addMessageTemplate: (template: Omit<MessageTemplate, 'id'>) => Promise<void>;
  updateMessageTemplate: (id: string, template: Partial<MessageTemplate>) => Promise<void>;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | null>(null);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [laborRooms, setLaborRooms] = useState<LaborRoom[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('registered_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      });
      return;
    }
    
    setPatients(data || []);
  };

  const fetchLaborRooms = async () => {
    const { data, error } = await supabase
      .from('labor_rooms')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching labor rooms:', error);
      return;
    }
    
    setLaborRooms(data || []);
  };

  const fetchMessageTemplates = async () => {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching message templates:', error);
      return;
    }
    
    setMessageTemplates(data || []);
  };

  const fetchActivityLogs = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching activity logs:', error);
      return;
    }
    
    setActivityLogs(data || []);
  };

  const refreshData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    await Promise.all([
      fetchPatients(),
      fetchLaborRooms(),
      fetchMessageTemplates(),
      fetchActivityLogs()
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const addActivityLog = async (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    if (!user) return;

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
      return;
    }

    await fetchActivityLogs();
  };

  const registerPatient = async (patientData: Omit<Patient, 'id' | 'status' | 'registeredAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('patients')
      .insert({
        full_name: patientData.fullName,
        delivery_date: patientData.deliveryDate || null,
        next_of_kin_name: patientData.nextOfKinName,
        next_of_kin_phone: patientData.nextOfKinPhone,
        registered_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering patient:', error);
      toast({
        title: "Error",
        description: "Failed to register patient",
        variant: "destructive"
      });
      return;
    }

    await addActivityLog({
      action: 'Patient Registered',
      details: `New patient ${patientData.fullName} registered`,
      userId: user.id,
      userName: user.name,
      patientId: data.id
    });

    await fetchPatients();
  };

  const acceptPatient = async (patientId: string, laborRoomId: string) => {
    if (!user) return;

    // Update patient
    const { error: patientError } = await supabase
      .from('patients')
      .update({
        status: 'in_labor',
        labor_room_id: laborRoomId,
        assigned_nurse_id: user.id
      })
      .eq('id', patientId);

    if (patientError) {
      console.error('Error accepting patient:', patientError);
      toast({
        title: "Error",
        description: "Failed to accept patient",
        variant: "destructive"
      });
      return;
    }

    // Update labor room
    const { error: roomError } = await supabase
      .from('labor_rooms')
      .update({
        is_occupied: true,
        current_patient_id: patientId,
        assigned_nurse_id: user.id
      })
      .eq('id', laborRoomId);

    if (roomError) {
      console.error('Error updating labor room:', roomError);
    }

    const patient = patients.find(p => p.id === patientId);
    const room = laborRooms.find(r => r.id === laborRoomId);
    
    await addActivityLog({
      action: 'Patient Accepted',
      details: `Patient ${patient?.fullName} accepted into ${room?.name}`,
      userId: user.id,
      userName: user.name,
      patientId
    });

    await Promise.all([fetchPatients(), fetchLaborRooms()]);
  };

  const completeDelivery = async (patientId: string, details: { babyGender: 'male' | 'female'; deliveryNotes: string; templateId: string }) => {
    if (!user) return;

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const template = messageTemplates.find(t => t.id === details.templateId);
    const deliveryTime = new Date().toLocaleString();
    
    // Simulate SMS sending
    if (template) {
      const message = template.content
        .replace('{{patientName}}', patient.fullName)
        .replace('{{babyGender}}', details.babyGender)
        .replace('{{deliveryTime}}', deliveryTime);
      
      console.log(`SMS sent to ${patient.nextOfKinPhone}: ${message}`);
    }

    // Update patient
    const { error: patientError } = await supabase
      .from('patients')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        baby_gender: details.babyGender,
        delivery_notes: details.deliveryNotes
      })
      .eq('id', patientId);

    if (patientError) {
      console.error('Error completing delivery:', patientError);
      toast({
        title: "Error",
        description: "Failed to complete delivery",
        variant: "destructive"
      });
      return;
    }

    // Free up the labor room
    const { error: roomError } = await supabase
      .from('labor_rooms')
      .update({
        is_occupied: false,
        current_patient_id: null,
        assigned_nurse_id: null
      })
      .eq('current_patient_id', patientId);

    if (roomError) {
      console.error('Error updating labor room:', roomError);
    }

    await addActivityLog({
      action: 'Delivery Completed',
      details: `${patient.fullName} delivered a ${details.babyGender} baby. SMS sent to next of kin.`,
      userId: user.id,
      userName: user.name,
      patientId
    });

    await Promise.all([fetchPatients(), fetchLaborRooms()]);
  };

  const addMessageTemplate = async (templateData: Omit<MessageTemplate, 'id'>) => {
    if (!user) return;

    const { error } = await supabase
      .from('message_templates')
      .insert({
        name: templateData.name,
        content: templateData.content,
        is_active: templateData.isActive,
        created_by: user.id
      });

    if (error) {
      console.error('Error adding message template:', error);
      toast({
        title: "Error",
        description: "Failed to add message template",
        variant: "destructive"
      });
      return;
    }

    await fetchMessageTemplates();
  };

  const updateMessageTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    const { error } = await supabase
      .from('message_templates')
      .update({
        name: updates.name,
        content: updates.content,
        is_active: updates.isActive
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating message template:', error);
      toast({
        title: "Error",
        description: "Failed to update message template",
        variant: "destructive"
      });
      return;
    }

    await fetchMessageTemplates();
  };

  return (
    <HospitalContext.Provider value={{
      patients,
      laborRooms,
      messageTemplates,
      activityLogs,
      isLoading,
      registerPatient,
      acceptPatient,
      completeDelivery,
      addMessageTemplate,
      updateMessageTemplate,
      addActivityLog,
      refreshData
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
