
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Save, X, Home } from 'lucide-react';
import { useHospital } from '@/contexts/HospitalContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RoomManagement: React.FC = () => {
  const { laborRooms, createLaborRoom, updateLaborRoom, refreshData } = useHospital();
  const [nurses, setNurses] = useState<any[]>([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', assignedNurseId: '' });
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchNurses = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'labor_nurse')
        .eq('is_active', true);
      
      if (!error) {
        setNurses(data || []);
      }
    };
    
    fetchNurses();
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name",
        variant: "destructive"
      });
      return;
    }

    await createLaborRoom(newRoomName);
    setNewRoomName('');
    setShowAddRoom(false);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room.id);
    setEditForm({
      name: room.name,
      assignedNurseId: room.assignedNurseId || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRoom) return;

    await updateLaborRoom(editingRoom, {
      name: editForm.name,
      assignedNurseId: editForm.assignedNurseId || undefined
    });

    setEditingRoom(null);
    setEditForm({ name: '', assignedNurseId: '' });
    await refreshData();
  };

  const handleCancelEdit = () => {
    setEditingRoom(null);
    setEditForm({ name: '', assignedNurseId: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Room Management
            </CardTitle>
            <CardDescription>
              Manage labor rooms and nurse assignments
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddRoom(true)} disabled={showAddRoom}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddRoom && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">Add New Room</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Labor Room 5"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCreateRoom}>Create Room</Button>
              <Button variant="outline" onClick={() => setShowAddRoom(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {laborRooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No labor rooms found. Create the first room using the button above.
            </div>
          ) : (
            laborRooms.map((room) => (
              <div key={room.id} className="border rounded-lg p-4">
                {editingRoom === room.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-room-name">Room Name</Label>
                        <Input
                          id="edit-room-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-nurse">Assigned Nurse</Label>
                        <Select 
                          value={editForm.assignedNurseId} 
                          onValueChange={(value) => setEditForm({ ...editForm, assignedNurseId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select nurse" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No nurse assigned</SelectItem>
                            {nurses.map((nurse) => (
                              <SelectItem key={nurse.id} value={nurse.id}>
                                {nurse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                        <h3 className="font-medium">{room.name}</h3>
                        {room.isOccupied ? (
                          <Badge className="bg-red-100 text-red-800">Occupied</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">Available</Badge>
                        )}
                      </div>
                      {room.assignedNurseId && (
                        <p className="text-sm text-gray-600 mt-1">
                          Assigned Nurse: {nurses.find(n => n.id === room.assignedNurseId)?.name || 'Unknown'}
                        </p>
                      )}
                      {room.currentPatientId && (
                        <p className="text-xs text-gray-500">
                          Current Patient ID: {room.currentPatientId}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>
                        <Edit2 className="h-4 w-4" />
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
  );
};

export default RoomManagement;
