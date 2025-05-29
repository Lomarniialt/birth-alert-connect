
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHospital } from '@/contexts/HospitalContext';
import { Clock, User, Activity } from 'lucide-react';

const ActivityLogs: React.FC = () => {
  const { activityLogs } = useHospital();

  const getActionBadge = (action: string) => {
    const colors = {
      'Patient Registered': 'bg-blue-100 text-blue-800',
      'Patient Accepted': 'bg-orange-100 text-orange-800',
      'Delivery Completed': 'bg-green-100 text-green-800',
      'Template Created': 'bg-purple-100 text-purple-800',
      'User Created': 'bg-indigo-100 text-indigo-800'
    };

    return (
      <Badge className={colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {action}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Activity Logs
        </CardTitle>
        <CardDescription>
          Real-time system activities and user actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activity logs found. System activities will appear here.
            </div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getActionBadge(log.action)}
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-1">{log.details}</p>
                  <p className="text-xs text-gray-500">
                    by {log.userName} (ID: {log.userId})
                    {log.patientId && ` • Patient ID: ${log.patientId}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityLogs;
