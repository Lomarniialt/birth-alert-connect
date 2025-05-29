
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, LaborRoom, MessageTemplate, ActivityLog } from '@/types';
import { useAuth } from './AuthContext';

interface HospitalContextType {
  patients: Patient[];
  laborRooms: LaborRoom[];
  messageTemplates: MessageTemplate[];
  activityLogs: ActivityLog[];
  registerPatient: (patient: Omit<Patient, 'id' | 'status' | 'registeredAt'>) => void;
  acceptPatient: (patientId: string, laborRoomId: string) => void;
  completeDelivery: (patientId: string, details: { babyGender: 'male' | 'female'; deliveryNotes: string; templateId: string }) => void;
  addMessageTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  updateMessageTemplate: (id: string, template: Partial<MessageTemplate>) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

const HospitalContext = createContext<HospitalContextType | null>(null);

const initialLaborRooms: LaborRoom[] = [
  { id: 'room1', name: 'Labor Room 1', isOccupied: false },
  { id: 'room2', name: 'Labor Room 2', isOccupied: false },
  { id: 'room3', name: 'Labor Room 3', isOccupied: false },
  { id: 'room4', name: 'Labor Room 4', isOccupied: false },
];

const initialTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Standard Birth Notification',
    content: 'Congratulations! {{patientName}} has successfully delivered a healthy {{babyGender}} baby at {{deliveryTime}}. Both mother and baby are doing well. Contact the hospital for visiting hours.',
    isActive: true,
    createdBy: 'admin'
  },
  {
    id: '2',
    name: 'Simple Notification',
    content: 'Good news! {{patientName}} has delivered safely. Please contact the hospital for more details.',
    isActive: true,
    createdBy: 'admin'
  }
];

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [laborRooms, setLaborRooms] = useState<LaborRoom[]>(initialLaborRooms);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(initialTemplates);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: generateId(),
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const registerPatient = (patientData: Omit<Patient, 'id' | 'status' | 'registeredAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: generateId(),
      status: 'registered',
      registeredAt: new Date().toISOString()
    };
    
    setPatients(prev => [...prev, newPatient]);
    
    if (user) {
      addActivityLog({
        action: 'Patient Registered',
        details: `New patient ${newPatient.fullName} registered`,
        userId: user.id,
        userName: user.name,
        patientId: newPatient.id
      });
    }
  };

  const acceptPatient = (patientId: string, laborRoomId: string) => {
    setPatients(prev => prev.map(patient => 
      patient.id === patientId 
        ? { ...patient, status: 'in_labor', laborRoomId, assignedNurseId: user?.id }
        : patient
    ));
    
    setLaborRooms(prev => prev.map(room => 
      room.id === laborRoomId 
        ? { ...room, isOccupied: true, currentPatientId: patientId, assignedNurseId: user?.id }
        : room
    ));

    if (user) {
      const patient = patients.find(p => p.id === patientId);
      addActivityLog({
        action: 'Patient Accepted',
        details: `Patient ${patient?.fullName} accepted into ${laborRooms.find(r => r.id === laborRoomId)?.name}`,
        userId: user.id,
        userName: user.name,
        patientId
      });
    }
  };

  const completeDelivery = (patientId: string, details: { babyGender: 'male' | 'female'; deliveryNotes: string; templateId: string }) => {
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

    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { 
            ...p, 
            status: 'delivered',
            deliveredAt: new Date().toISOString(),
            babyGender: details.babyGender,
            deliveryNotes: details.deliveryNotes
          }
        : p
    ));

    // Free up the labor room
    setLaborRooms(prev => prev.map(room => 
      room.currentPatientId === patientId 
        ? { ...room, isOccupied: false, currentPatientId: undefined, assignedNurseId: undefined }
        : room
    ));

    if (user) {
      addActivityLog({
        action: 'Delivery Completed',
        details: `${patient.fullName} delivered a ${details.babyGender} baby. SMS sent to next of kin.`,
        userId: user.id,
        userName: user.name,
        patientId
      });
    }
  };

  const addMessageTemplate = (templateData: Omit<MessageTemplate, 'id'>) => {
    const newTemplate: MessageTemplate = {
      ...templateData,
      id: generateId()
    };
    setMessageTemplates(prev => [...prev, newTemplate]);
  };

  const updateMessageTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setMessageTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ));
  };

  return (
    <HospitalContext.Provider value={{
      patients,
      laborRooms,
      messageTemplates,
      activityLogs,
      registerPatient,
      acceptPatient,
      completeDelivery,
      addMessageTemplate,
      updateMessageTemplate,
      addActivityLog
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
