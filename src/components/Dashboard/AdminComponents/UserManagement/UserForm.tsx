
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useHospital } from '@/contexts/HospitalContext';

interface UserFormProps {
  onUserCreated: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onUserCreated, onCancel }) => {
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'front_desk' as 'admin' | 'front_desk' | 'labor_nurse',
    labor_room_id: 'unassigned'
  });
  const { toast } = useToast();
  const { laborRooms, updateLaborRoom } = useHospital();

  const handleAddUser = async () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
        options: {
          data: {
            name: newUserForm.name
          }
        }
      });

      if (authError) {
        toast({
          title: "Error",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (authData.user) {
        const roomId = newUserForm.labor_room_id === 'unassigned' ? null : newUserForm.labor_room_id;

        // Update the profile with the correct role and room assignment
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: newUserForm.role,
            labor_room_id: roomId
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // If assigning labor nurse to room, update the room
        if (newUserForm.role === 'labor_nurse' && roomId) {
          await updateLaborRoom(roomId, {
            assignedNurseId: authData.user.id
          });
        }

        toast({
          title: "Success",
          description: "User created successfully",
        });

        setNewUserForm({
          name: '',
          email: '',
          password: '',
          role: 'front_desk',
          labor_room_id: 'unassigned'
        });
        onUserCreated();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium mb-4">Add New User</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-name">Full Name</Label>
          <Input
            id="new-name"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
            placeholder="Enter full name"
          />
        </div>
        <div>
          <Label htmlFor="new-email">Email</Label>
          <Input
            id="new-email"
            type="email"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
            placeholder="Enter email address"
          />
        </div>
        <div>
          <Label htmlFor="new-password">Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newUserForm.password}
            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
            placeholder="Enter password"
          />
        </div>
        <div>
          <Label htmlFor="new-role">Role</Label>
          <Select 
            value={newUserForm.role} 
            onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value as any })}
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
        {newUserForm.role === 'labor_nurse' && (
          <div>
            <Label htmlFor="new-room">Assigned Labor Room</Label>
            <Select 
              value={newUserForm.labor_room_id} 
              onValueChange={(value) => setNewUserForm({ ...newUserForm, labor_room_id: value })}
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
      <div className="flex gap-2 mt-4">
        <Button onClick={handleAddUser}>Create User</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default UserForm;
