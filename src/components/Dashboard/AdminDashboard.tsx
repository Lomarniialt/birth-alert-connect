
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useHospital } from '@/contexts/HospitalContext';
import { Users, Activity, MessageSquare, Calendar, Home } from 'lucide-react';
import UserManagement from './AdminComponents/UserManagement';
import TemplateManagement from './AdminComponents/TemplateManagement';
import ActivityLogs from './AdminComponents/ActivityLogs';
import SystemStats from './AdminComponents/SystemStats';
import RoomManagement from './AdminComponents/RoomManagement';

const AdminDashboard: React.FC = () => {
  const { patients, activityLogs, messageTemplates } = useHospital();

  const stats = {
    totalPatients: patients.length,
    patientsInLabor: patients.filter(p => p.status === 'in_labor').length,
    deliveredToday: patients.filter(p => {
      if (!p.deliveredAt) return false;
      const today = new Date().toDateString();
      const deliveryDate = new Date(p.deliveredAt).toDateString();
      return today === deliveryDate;
    }).length,
    recentActivities: activityLogs.slice(0, 5)
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administrator Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, monitor system activity, and configure settings</p>
      </div>

      <SystemStats stats={stats} />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomManagement />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManagement />
        </TabsContent>

        <TabsContent value="logs">
          <ActivityLogs />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>
                Generate and export system reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Export Delivery Report (This Month)
                </Button>
                <Button variant="outline" className="w-full">
                  Export User Activity Report
                </Button>
                <Button variant="outline" className="w-full">
                  Export Patient Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
