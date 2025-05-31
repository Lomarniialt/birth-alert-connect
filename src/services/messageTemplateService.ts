
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
