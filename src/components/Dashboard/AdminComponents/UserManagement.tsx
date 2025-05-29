
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';

// Mock users data
const users = [
  { id: '1', name: 'Dr. Sarah Admin', email: 'admin@hospital.com', role: 'admin', isActive: true },
  { id: '2', name: 'Mary Johnson', email: 'frontdesk@hospital.com', role: 'front_desk', isActive: true },
  { id: '3', name: 'Nurse Lisa Brown', email: 'nurse1@hospital.com', role: 'labor_nurse', isActive: true },
  { id: '4', name: 'Nurse Carol White', email: 'nurse2@hospital.com', role: 'labor_nurse', isActive: true },
];

const UserManagement: React.FC = () => {
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });

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

  const handleAddUser = () => {
    console.log('Adding user:', newUser);
    setIsAddingUser(false);
    setNewUser({ name: '', email: '', role: '', password: '' });
  };

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
            <Button onClick={() => setIsAddingUser(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingUser && (
            <Card className="mb-6 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Add New User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="front_desk">Front Desk Officer</SelectItem>
                        <SelectItem value="labor_nurse">Labor Room Nurse</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter temporary password"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddUser}>Create User</Button>
                  <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{user.name}</h3>
                    {getRoleBadge(user.role)}
                    {user.isActive && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
