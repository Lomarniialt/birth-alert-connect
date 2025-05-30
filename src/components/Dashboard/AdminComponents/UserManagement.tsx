
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useHospital } from '@/contexts/HospitalContext';
import UserForm from './UserManagement/UserForm';
import UserCard from './UserManagement/UserCard';
import UserEditForm from './UserManagement/UserEditForm';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'front_desk' | 'labor_nurse';
  labor_room_id?: string;
  is_active: boolean;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const { toast } = useToast();
  const { updateLaborRoom } = useHospital();

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
      return;
    }
    
    setUsers(data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchUsers();
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const handleEditUser = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm({
      ...user,
      labor_room_id: user.labor_room_id || 'unassigned'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !editForm) return;

    const roomId = editForm.labor_room_id === 'unassigned' ? null : editForm.labor_room_id;

    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update({
        name: editForm.name,
        role: editForm.role,
        labor_room_id: roomId,
        is_active: editForm.is_active
      })
      .eq('id', editingUser);

    if (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
      return;
    }

    // If assigning labor nurse to room, update the room
    if (editForm.role === 'labor_nurse' && roomId) {
      await updateLaborRoom(roomId, {
        assignedNurseId: editingUser
      });
    }

    toast({
      title: "Success",
      description: "User updated successfully",
    });

    setEditingUser(null);
    setEditForm({});
    await fetchUsers();
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
    });

    await fetchUsers();
  };

  const handleUserCreated = async () => {
    setShowAddUser(false);
    await fetchUsers();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage system users and their permissions
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddUser(true)} disabled={showAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddUser && (
            <UserForm 
              onUserCreated={handleUserCreated}
              onCancel={() => setShowAddUser(false)}
            />
          )}

          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id}>
                  {editingUser === user.id ? (
                    <div className="border rounded-lg p-4">
                      <UserEditForm
                        editForm={editForm}
                        setEditForm={setEditForm}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                      />
                    </div>
                  ) : (
                    <UserCard
                      user={user}
                      onEdit={handleEditUser}
                      onToggleStatus={toggleUserStatus}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
