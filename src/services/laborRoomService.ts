
import { LaborRoom } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const fetchLaborRooms = async (): Promise<LaborRoom[]> => {
  const { data, error } = await supabase
    .from('labor_rooms')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching labor rooms:', error);
    throw error;
  }
  
  return (data || []).map(room => ({
    id: room.id,
    name: room.name,
    isOccupied: room.is_occupied,
    assignedNurseId: room.assigned_nurse_id,
    currentPatientId: room.current_patient_id
  }));
};

export const createLaborRoom = async (name: string) => {
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
    throw error;
  }

  console.log('Labor room created successfully:', data);
  return data;
};

export const updateLaborRoom = async (id: string, updates: { assignedNurseId?: string; name?: string }) => {
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
    throw error;
  }
};

export const toggleRoomAvailability = async (roomId: string, currentRoom: LaborRoom) => {
  if (!currentRoom.isOccupied && currentRoom.currentPatientId) {
    throw new Error('Cannot make room unavailable while it has a current patient');
  }

  const { error } = await supabase
    .from('labor_rooms')
    .update({
      is_occupied: !currentRoom.isOccupied,
      assigned_nurse_id: !currentRoom.isOccupied ? null : currentRoom.assignedNurseId,
      current_patient_id: !currentRoom.isOccupied ? null : currentRoom.currentPatientId
    })
    .eq('id', roomId);

  if (error) {
    console.error('Error toggling room availability:', error);
    throw error;
  }
};
