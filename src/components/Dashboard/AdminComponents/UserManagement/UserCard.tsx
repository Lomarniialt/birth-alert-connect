
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2 } from 'lucide-react';
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

interface UserCardProps {
  user: Profile;
  onEdit: (user: Profile) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onToggleStatus }) => {
  const { laborRooms } = useHospital();

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

  return (
    <div className="border rounded-lg p-4">
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
          <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onToggleStatus(user.id, user.is_active)}
            className={user.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
          >
            {user.is_active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
