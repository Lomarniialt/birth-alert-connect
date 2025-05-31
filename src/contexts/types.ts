
import { Patient, LaborRoom, MessageTemplate, ActivityLog } from '@/types';

export interface HospitalContextType {
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
