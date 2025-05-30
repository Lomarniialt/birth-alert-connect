
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
  createLaborRoom: (name: string) => Promise<void>;
  updateLaborRoom: (id: string, updates: { assignedNurseId?: string; name?: string }) => Promise<void>;
  toggleRoomAvailability: (roomId: string) => Promise<void>;
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
    
    // Map database fields to TypeScript interface
    const mappedPatients: Patient[] = (data || []).map(patient => ({
      id: patient.id,
      fullName: patient.full_name,
      deliveryDate: patient.delivery_date,
      nextOfKinName: patient.next_of_kin_name,
      nextOfKinPhone: patient.next_of_kin_phone,
      status: patient.status,
      assignedNurseId: patient.assigned_nurse_id,
      laborRoomId: patient.labor_room_id,
      registeredBy: patient.registered_by,
      registeredAt: patient.registered_at,
      deliveredAt: patient.delivered_at,
      babyGender: patient.baby_gender,
      deliveryNotes: patient.delivery_notes
    }));
    
    setPatients(mappedPatients);
  };

  const fetchLaborRooms = async () => {
    const { data, error } = await supabase
      .from('labor_rooms')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching labor rooms:', error);
      toast({
        title: "Error",
        description: "Failed to fetch labor rooms",
        variant: "destructive"
      });
      return;
    }
    
    // Map database fields to TypeScript interface
    const mappedRooms: LaborRoom[] = (data || []).map(room => ({
      id: room.id,
      name: room.name,
      isOccupied: room.is_occupied,
      assignedNurseId: room.assigned_nurse_id,
      currentPatientId: room.current_patient_id
    }));
    
    setLaborRooms(mappedRooms);
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
    
    // Map database fields to TypeScript interface
    const mappedTemplates: MessageTemplate[] = (data || []).map(template => ({
      id: template.id,
      name: template.name,
      content: template.content,
      isActive: template.is_active,
      createdBy: template.created_by
    }));
    
    setMessageTemplates(mappedTemplates);
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
    
    // Map database fields to TypeScript interface
    const mappedLogs: ActivityLog[] = (data || []).map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      userId: log.user_id,
      userName: log.user_name,
      timestamp: log.timestamp,
      patientId: log.patient_id
    }));
    
    setActivityLogs(mappedLogs);
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

  const createLaborRoom = async (name: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create labor rooms",
        variant: "destructive"
      });
      return;
    }

    console.log('Creating labor room with name:', name);

    const { data, error } = await supabase
      .from('labor_rooms')
      .insert({
        name: name,
        is_occupied: false,
        assigned_nurse_id: null,
        current_patient_id: null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating labor room:', error);
      toast({
        title: "Error",
        description: "Failed to create labor room: " + error.message,
        variant: "destructive"
      });
      return;
    }

    console.log('Labor room created successfully:', data);
    toast({
      title: "Success",
      description: "Labor room created successfully",
    });

    await addActivityLog({
      action: 'Labor Room Created',
      details: `New labor room "${name}" created`,
      userId: user.id,
      userName: user.name
    });

    await fetchLaborRooms();
  };

  const updateLaborRoom = async (id: string, updates: { assignedNurseId?: string; name?: string }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update labor rooms",
        variant: "destructive"
      });
      return;
    }

    console.log('Updating labor room:', id, 'with updates:', updates);

    const updateData: any = {};
    
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    
    if (updates.assignedNurseId !== undefined) {
      updateData.assigned_nurse_id = updates.assignedNurseId === 'unassigned' ? null : updates.assignedNurseId;
    }

    const { error } = await supabase
      .from('labor_rooms')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating labor room:', error);
      toast({
        title: "Error",
        description: "Failed to update labor room: " + error.message,
        variant: "destructive"
      });
      return;
    }

    const room = laborRooms.find(r => r.id === id);
    await addActivityLog({
      action: 'Labor Room Updated',
      details: `Labor room "${room?.name || id}" updated`,
      userId: user.id,
      userName: user.name
    });

    toast({
      title: "Success",
      description: "Labor room updated successfully",
    });

    await fetchLaborRooms();
  };

  const toggleRoomAvailability = async (roomId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update room availability",
        variant: "destructive"
      });
      return;
    }

    const room = laborRooms.find(r => r.id === roomId);
    if (!room) {
      toast({
        title: "Error",
        description: "Room not found",
        variant: "destructive"
      });
      return;
    }

    // Don't allow making a room unavailable if it has a current patient
    if (!room.isOccupied && room.currentPatientId) {
      toast({
        title: "Error",
        description: "Cannot make room unavailable while it has a current patient",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('labor_rooms')
      .update({
        is_occupied: !room.isOccupied,
        // If making room available, clear assigned nurse and patient
        assigned_nurse_id: !room.isOccupied ? null : room.assignedNurseId,
        current_patient_id: !room.isOccupied ? null : room.currentPatientId
      })
      .eq('id', roomId);

    if (error) {
      console.error('Error toggling room availability:', error);
      toast({
        title: "Error",
        description: "Failed to update room availability: " + error.message,
        variant: "destructive"
      });
      return;
    }

    await addActivityLog({
      action: 'Room Availability Updated',
      details: `Room "${room.name}" marked as ${room.isOccupied ? 'available' : 'occupied'}`,
      userId: user.id,
      userName: user.name
    });

    toast({
      title: "Success",
      description: `Room ${room.isOccupied ? 'made available' : 'marked as occupied'}`,
    });

    await fetchLaborRooms();
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
      refreshData,
      createLaborRoom,
      updateLaborRoom,
      toggleRoomAvailability
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
