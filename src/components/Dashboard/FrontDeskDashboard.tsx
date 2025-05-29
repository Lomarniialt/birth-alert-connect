
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useHospital } from '@/contexts/HospitalContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Clock, Calendar } from 'lucide-react';

const FrontDeskDashboard: React.FC = () => {
  const { patients, registerPatient, isLoading } = useHospital();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [patientForm, setPatientForm] = useState({
    fullName: '',
    deliveryDate: '',
    nextOfKinName: '',
    nextOfKinPhone: ''
  });

  const handleRegister = async () => {
    if (!user) return;
    
    try {
      await registerPatient({
        ...patientForm,
        registeredBy: user.id
      });

      toast({
        title: "Patient Registered Successfully",
        description: `${patientForm.fullName} has been registered and broadcasted to labor rooms.`,
      });

      setPatientForm({
        fullName: '',
        deliveryDate: '',
        nextOfKinName: '',
        nextOfKinPhone: ''
      });
      setIsRegistering(false);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      registered: 'bg-blue-100 text-blue-800',
      in_labor: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800'
    };

    const labels = {
      registered: 'Registered',
      in_labor: 'In Labor',
      delivered: 'Delivered'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDeliveryDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const todayPatients = patients.filter(p => {
    const today = new Date().toDateString();
    const registeredDate = new Date(p.registeredAt).toDateString();
    return today === registeredDate;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Front Desk Dashboard</h1>
        <p className="text-gray-600 mt-2">Register new patients and monitor registration status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">All registered patients</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Registrations</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPatients.length}</div>
            <p className="text-xs text-muted-foreground">Registered today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Labor</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter(p => p.status === 'registered').length}
            </div>
            <p className="text-xs text-muted-foreground">Waiting for labor room</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Registration */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Patient Registration</CardTitle>
              <CardDescription>Register new expectant mothers</CardDescription>
            </div>
            <Button onClick={() => setIsRegistering(true)} disabled={isRegistering}>
              <Plus className="h-4 w-4 mr-2" />
              Register Patient
            </Button>
          </div>
        </CardHeader>
        {isRegistering && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Patient Full Name</Label>
                  <Input
                    id="fullName"
                    value={patientForm.fullName}
                    onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })}
                    placeholder="Enter patient's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate">Expected Delivery Date (Optional)</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={patientForm.deliveryDate}
                    onChange={(e) => setPatientForm({ ...patientForm, deliveryDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="nextOfKinName">Next of Kin Name</Label>
                  <Input
                    id="nextOfKinName"
                    value={patientForm.nextOfKinName}
                    onChange={(e) => setPatientForm({ ...patientForm, nextOfKinName: e.target.value })}
                    placeholder="Enter next of kin's name"
                  />
                </div>
                <div>
                  <Label htmlFor="nextOfKinPhone">Next of Kin Phone</Label>
                  <Input
                    id="nextOfKinPhone"
                    value={patientForm.nextOfKinPhone}
                    onChange={(e) => setPatientForm({ ...patientForm, nextOfKinPhone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRegister}>Register Patient</Button>
                <Button variant="outline" onClick={() => setIsRegistering(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>Recently registered patients and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No patients registered yet. Use the form above to register the first patient.
              </div>
            ) : (
              patients.slice().reverse().map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{patient.fullName}</h3>
                    <p className="text-sm text-gray-600">
                      Next of Kin: {patient.nextOfKinName || 'N/A'} 
                      {patient.nextOfKinPhone && ` (${patient.nextOfKinPhone})`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Registered: {formatDate(patient.registeredAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(patient.status)}
                    {patient.deliveryDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Expected: {formatDeliveryDate(patient.deliveryDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrontDeskDashboard;
