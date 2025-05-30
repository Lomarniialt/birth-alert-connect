
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { useHospital } from '@/contexts/HospitalContext';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'front_desk' | 'labor_nurse';
  labor_room_id?: string;
  is_active: boolean;
  created_at: string;
}

interface UserEditFormProps {
  editForm: Partial<Profile>;
  setEditForm: (form: Partial<Profile>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const UserEditForm: React.FC<UserEditFormProps> = ({
  editForm,
  setEditForm,
  onSave,
  onCancel
}) => {
  const { laborRooms } = useHospital();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">Full Name</Label>
          <Input
            id="edit-name"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit-role">Role</Label>
          <Select 
            value={editForm.role} 
            onValueChange={(value) => setEditForm({ ...editForm, role: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="front_desk">Front Desk Officer</SelectItem>
              <SelectItem value="labor_nurse">Labor Room Nurse</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {editForm.role === 'labor_nurse' && (
          <div>
            <Label htmlFor="edit-room">Assigned Labor Room</Label>
            <Select 
              value={editForm.labor_room_id || 'unassigned'} 
              onValueChange={(value) => setEditForm({ ...editForm, labor_room_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">No room assigned</SelectItem>
                {laborRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={onSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default UserEditForm;
