
import { MessageTemplate } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const fetchMessageTemplates = async (): Promise<MessageTemplate[]> => {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching message templates:', error);
    throw error;
  }
  
  return (data || []).map(template => ({
    id: template.id,
    name: template.name,
    content: template.content,
    isActive: template.is_active,
    createdBy: template.created_by
  }));
};

export const addMessageTemplate = async (templateData: Omit<MessageTemplate, 'id'>, userId: string) => {
  const { error } = await supabase
    .from('message_templates')
    .insert({
      name: templateData.name,
      content: templateData.content,
      is_active: templateData.isActive,
      created_by: userId
    });

  if (error) {
    console.error('Error adding message template:', error);
    throw error;
  }
};

export const updateMessageTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
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
    throw error;
  }
};

export const processMessageTemplate = async (templateContent: string, patientId: string, additionalData?: { babyGender?: string; deliveryTime?: string }) => {
  // Fetch patient data including next of kin information
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error) {
    console.error('Error fetching patient data for message template:', error);
    throw error;
  }

  const deliveryTime = additionalData?.deliveryTime || new Date().toLocaleString();
  
  // Replace template variables with actual data
  let processedMessage = templateContent
    .replace(/\{\{patientName\}\}/g, patient.full_name)
    .replace(/\{\{nextOfKinName\}\}/g, patient.next_of_kin_name)
    .replace(/\{\{nextOfKinPhone\}\}/g, patient.next_of_kin_phone)
    .replace(/\{\{deliveryTime\}\}/g, deliveryTime);

  if (additionalData?.babyGender) {
    processedMessage = processedMessage.replace(/\{\{babyGender\}\}/g, additionalData.babyGender);
  }

  return processedMessage;
};
