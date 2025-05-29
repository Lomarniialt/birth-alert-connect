
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'front_desk' | 'labor_nurse';
  laborRoomId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  fullName: string;
  deliveryDate?: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  status: 'registered' | 'in_labor' | 'delivered';
  assignedNurseId?: string;
  laborRoomId?: string;
  registeredBy: string;
  registeredAt: string;
  deliveredAt?: string;
  babyGender?: 'male' | 'female';
  deliveryNotes?: string;
}

export interface LaborRoom {
  id: string;
  name: string;
  isOccupied: boolean;
  assignedNurseId?: string;
  currentPatientId?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  userName: string;
  timestamp: string;
  patientId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
