
import { Patient } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const fetchPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('registered_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
  
  return (data || []).map(patient => ({
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
};

export const registerPatient = async (patientData: Omit<Patient, 'id' | 'status' | 'registeredAt'>, userId: string) => {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      full_name: patientData.fullName,
      delivery_date: patientData.deliveryDate || null,
      next_of_kin_name: patientData.nextOfKinName,
      next_of_kin_phone: patientData.nextOfKinPhone,
      registered_by: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering patient:', error);
    throw error;
  }

  return data;
};

export const acceptPatient = async (patientId: string, laborRoomId: string, userId: string) => {
  const { error: patientError } = await supabase
    .from('patients')
    .update({
      status: 'in_labor',
      labor_room_id: laborRoomId,
      assigned_nurse_id: userId
    })
    .eq('id', patientId);

  if (patientError) {
    console.error('Error accepting patient:', patientError);
    throw patientError;
  }

  const { error: roomError } = await supabase
    .from('labor_rooms')
    .update({
      is_occupied: true,
      current_patient_id: patientId,
      assigned_nurse_id: userId
    })
    .eq('id', laborRoomId);

  if (roomError) {
    console.error('Error updating labor room:', roomError);
    throw roomError;
  }
};

export const completeDelivery = async (patientId: string, details: { babyGender: 'male' | 'female'; deliveryNotes: string; templateId: string }) => {
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
    throw patientError;
  }

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
    throw roomError;
  }
};
