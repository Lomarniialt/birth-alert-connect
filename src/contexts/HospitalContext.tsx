import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, LaborRoom, MessageTemplate, ActivityLog } from '@/types';
import { HospitalContextType } from './types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchPatients, 
  registerPatient as registerPatientService, 
  acceptPatient as acceptPatientService, 
  completeDelivery as completeDeliveryService 
} from '@/services/patientService';
import { 
  fetchLaborRooms, 
  createLaborRoom as createLaborRoomService, 
  updateLaborRoom as updateLaborRoomService, 
  toggleRoomAvailability as toggleRoomAvailabilityService 
} from '@/services/laborRoomService';
import { 
  fetchMessageTemplates, 
  addMessageTemplate as addMessageTemplateService, 
  updateMessageTemplate as updateMessageTemplateService,
  processMessageTemplate 
} from '@/services/messageTemplateService';
import { 
  fetchActivityLogs, 
  addActivityLog as addActivityLogService 
} from '@/services/activityLogService';

const HospitalContext = createContext<HospitalContextType | null>(null);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [laborRooms, setLaborRooms] = useState<LaborRoom[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPatients = async () => {
    try {
      const data = await fetchPatients();
      setPatients(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive"
      });
    }
  };

  const loadLaborRooms = async () => {
    try {
      const data = await fetchLaborRooms();
      setLaborRooms(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch labor rooms",
        variant: "destructive"
      });
    }
  };

  const loadMessageTemplates = async () => {
    try {
      const data = await fetchMessageTemplates();
      setMessageTemplates(data);
    } catch (error) {
      console.error('Error loading message templates:', error);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const data = await fetchActivityLogs();
      setActivityLogs(data);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    }
  };

  const refreshData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    await Promise.all([
      loadPatients(),
      loadLaborRooms(),
      loadMessageTemplates(),
      loadActivityLogs()
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

    try {
      await addActivityLogService(log);
      await loadActivityLogs();
    } catch (error) {
      console.error('Error adding activity log:', error);
    }
  };

  const registerPatient = async (patientData: Omit<Patient, 'id' | 'status' | 'registeredAt'>) => {
    if (!user) return;

    try {
      const data = await registerPatientService(patientData, user.id);

      await addActivityLog({
        action: 'Patient Registered',
        details: `New patient ${patientData.fullName} registered`,
        userId: user.id,
        userName: user.name,
        patientId: data.id
      });

      await loadPatients();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register patient",
        variant: "destructive"
      });
    }
  };

  const acceptPatient = async (patientId: string, laborRoomId: string) => {
    if (!user) return;

    try {
      await acceptPatientService(patientId, laborRoomId, user.id);

      const patient = patients.find(p => p.id === patientId);
      const room = laborRooms.find(r => r.id === laborRoomId);
      
      await addActivityLog({
        action: 'Patient Accepted',
        details: `Patient ${patient?.fullName} accepted into ${room?.name}`,
        userId: user.id,
        userName: user.name,
        patientId
      });

      await Promise.all([loadPatients(), loadLaborRooms()]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept patient",
        variant: "destructive"
      });
    }
  };

  const completeDelivery = async (patientId: string, details: { babyGender: 'male' | 'female'; deliveryNotes: string; templateId: string }) => {
    if (!user) return;

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    try {
      const template = messageTemplates.find(t => t.id === details.templateId);
      const deliveryTime = new Date().toLocaleString();
      
      if (template) {
        // Use the enhanced message processing that includes next of kin data
        const processedMessage = await processMessageTemplate(
          template.content, 
          patientId, 
          { 
            babyGender: details.babyGender, 
            deliveryTime 
          }
        );
        
        console.log(`SMS sent to ${patient.nextOfKinPhone}: ${processedMessage}`);
      }

      await completeDeliveryService(patientId, details);

      await addActivityLog({
        action: 'Delivery Completed',
        details: `${patient.fullName} delivered a ${details.babyGender} baby. SMS sent to next of kin: ${patient.nextOfKinName}.`,
        userId: user.id,
        userName: user.name,
        patientId
      });

      await Promise.all([loadPatients(), loadLaborRooms()]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete delivery",
        variant: "destructive"
      });
    }
  };

  const addMessageTemplate = async (templateData: Omit<MessageTemplate, 'id'>) => {
    if (!user) return;

    try {
      await addMessageTemplateService(templateData, user.id);
      await loadMessageTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add message template",
        variant: "destructive"
      });
    }
  };

  const updateMessageTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    try {
      await updateMessageTemplateService(id, updates);
      await loadMessageTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message template",
        variant: "destructive"
      });
    }
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

    try {
      console.log('Creating labor room with name:', name);
      const data = await createLaborRoomService(name);

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

      await loadLaborRooms();
    } catch (error: any) {
      console.error('Error creating labor room:', error);
      toast({
        title: "Error",
        description: "Failed to create labor room: " + error.message,
        variant: "destructive"
      });
    }
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

    try {
      console.log('Updating labor room:', id, 'with updates:', updates);
      await updateLaborRoomService(id, updates);

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

      await loadLaborRooms();
    } catch (error: any) {
      console.error('Error updating labor room:', error);
      toast({
        title: "Error",
        description: "Failed to update labor room: " + error.message,
        variant: "destructive"
      });
    }
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

    try {
      await toggleRoomAvailabilityService(roomId, room);

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

      await loadLaborRooms();
    } catch (error: any) {
      console.error('Error toggling room availability:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update room availability",
        variant: "destructive"
      });
    }
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
