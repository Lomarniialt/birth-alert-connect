
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, CheckCircle, Activity } from 'lucide-react';

interface SystemStatsProps {
  stats: {
    totalPatients: number;
    patientsInLabor: number;
    deliveredToday: number;
    recentActivities: any[];
  };
}

const SystemStats: React.FC<SystemStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      description: 'Registered patients',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'In Labor',
      value: stats.patientsInLabor,
      description: 'Currently in labor rooms',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Delivered Today',
      value: stats.deliveredToday,
      description: 'Successful deliveries',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Recent Activities',
      value: stats.recentActivities.length,
      description: 'System activities',
      icon: Activity,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemStats;
