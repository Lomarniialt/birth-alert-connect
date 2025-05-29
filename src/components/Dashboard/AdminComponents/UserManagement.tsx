
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'front_desk' as 'admin' | 'front_desk' | 'labor_nurse',
    labor_room_id: ''
  });
  const { toast } = useToast();
  const { laborRooms, updateLaborRoom } = useHospital();

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

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      front_desk: 'bg-blue-100 text-blue-800',
      labor_nurse: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      admin: 'Administrator',
      front_desk: 'Front Desk',
      labor_nurse: 'Labor Nurse'
    };

    return (
      <Badge className={colors[role as keyof typeof colors]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const handleEditUser = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm(user);
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !editForm) return;

    // Update user profile
    const { error } = await supabase
      .from('profiles')
      .update({
        name: editForm.name,
        role: editForm.role,
        labor_room_id: editForm.labor_room_id || null,
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
    if (editForm.role === 'labor_nurse' && editForm.labor_room_id) {
      await updateLaborRoom(editForm.labor_room_id, {
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
        // Update the profile with the correct role and room assignment
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: newUserForm.role,
            labor_room_id: newUserForm.labor_room_id || null
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // If assigning labor nurse to room, update the room
        if (newUserForm.role === 'labor_nurse' && newUserForm.labor_room_id) {
          await updateLaborRoom(newUserForm.labor_room_id, {
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
          labor_room_id: ''
        });
        setShowAddUser(false);
        await fetchUsers();
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
                        <SelectItem value="">No room assigned</SelectItem>
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
                <Button variant="outline" onClick={() => setShowAddUser(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  {editingUser === user.id ? (
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
                              value={editForm.labor_room_id || ''} 
                              onValueChange={(value) => setEditForm({ ...editForm, labor_room_id: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select room" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No room assigned</SelectItem>
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
                        <Button onClick={handleSaveEdit} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{user.name}</h3>
                          {getRoleBadge(user.role)}
                          {user.is_active ? (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                        {user.labor_room_id && (
                          <p className="text-xs text-gray-500">
                            Assigned: {laborRooms.find(r => r.id === user.labor_room_id)?.name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          className={user.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
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
