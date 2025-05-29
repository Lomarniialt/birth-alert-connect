
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useHospital } from '@/contexts/HospitalContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

const LaborNurseDashboard: React.FC = () => {
  const { patients, laborRooms, messageTemplates, acceptPatient, completeDelivery } = useHospital();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliveryForm, setDeliveryForm] = useState({
    patientId: '',
    babyGender: '',
    deliveryNotes: '',
    templateId: ''
  });
  const [isCompletingDelivery, setIsCompletingDelivery] = useState(false);

  // Get nurse's assigned room
  const myRoom = laborRooms.find(room => room.assignedNurseId === user?.id);
  const availablePatients = patients.filter(p => p.status === 'registered');
  const myPatient = patients.find(p => p.assignedNurseId === user?.id && p.status === 'in_labor');

  const handleAcceptPatient = (patientId: string) => {
    if (!user?.laborRoomId) {
      toast({
        title: "Error",
        description: "No labor room assigned to your account.",
        variant: "destructive"
      });
      return;
    }

    acceptPatient(patientId, user.laborRoomId);
    toast({
      title: "Patient Accepted",
      description: "Patient has been assigned to your labor room.",
    });
  };

  const handleCompleteDelivery = () => {
    if (!deliveryForm.patientId || !deliveryForm.babyGender || !deliveryForm.templateId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    completeDelivery(deliveryForm.patientId, {
      babyGender: deliveryForm.babyGender as 'male' | 'female',
      deliveryNotes: deliveryForm.deliveryNotes,
      templateId: deliveryForm.templateId
    });

    toast({
      title: "Delivery Completed",
      description: "SMS notification has been sent to next of kin.",
    });

    setDeliveryForm({
      patientId: '',
      babyGender: '',
      deliveryNotes: '',
      templateId: ''
    });
    setIsCompletingDelivery(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Labor Room Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage patients in your assigned labor room
        </p>
      </div>

      {/* Room Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {myRoom?.isOccupied ? (
              <AlertCircle className="h-5 w-5 text-orange-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {myRoom?.name || 'No Room Assigned'}
          </CardTitle>
          <CardDescription>
            Status: {myRoom?.isOccupied ? 'Occupied' : 'Available'}
          </CardDescription>
        </CardHeader>
        {myPatient && (
          <CardContent>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-medium text-orange-800">Current Patient</h3>
              <p className="text-orange-700">{myPatient.fullName}</p>
              <p className="text-sm text-orange-600">
                Next of Kin: {myPatient.nextOfKinName} ({myPatient.nextOfKinPhone})
              </p>
              <Button 
                className="mt-3 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setDeliveryForm({ ...deliveryForm, patientId: myPatient.id });
                  setIsCompletingDelivery(true);
                }}
              >
                Complete Delivery
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Available Patients */}
      {!myRoom?.isOccupied && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Available Patients
            </CardTitle>
            <CardDescription>
              Patients waiting for labor room assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availablePatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No patients currently waiting for labor room assignment.
                </div>
              ) : (
                availablePatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{patient.fullName}</h3>
                      <p className="text-sm text-gray-600">
                        Next of Kin: {patient.nextOfKinName} ({patient.nextOfKinPhone})
                      </p>
                      <p className="text-xs text-gray-500">
                        Registered: {new Date(patient.registeredAt).toLocaleString()}
                      </p>
                    </div>
                    <Button onClick={() => handleAcceptPatient(patient.id)}>
                      Accept Patient
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Completion Form */}
      {isCompletingDelivery && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Complete Delivery
            </CardTitle>
            <CardDescription>
              Record delivery details and send notification to next of kin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="babyGender">Baby's Gender</Label>
                <Select 
                  value={deliveryForm.babyGender}
                  onValueChange={(value) => setDeliveryForm({ ...deliveryForm, babyGender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template">Message Template</Label>
                <Select 
                  value={deliveryForm.templateId}
                  onValueChange={(value) => setDeliveryForm({ ...deliveryForm, templateId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTemplates.filter(t => t.isActive).map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="deliveryNotes">Delivery Notes</Label>
              <Textarea
                id="deliveryNotes"
                value={deliveryForm.deliveryNotes}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNotes: e.target.value })}
                placeholder="Add any additional notes about the delivery..."
                rows={3}
              />
            </div>
            {deliveryForm.templateId && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Message Preview:</h4>
                <div className="text-sm text-blue-700 bg-white p-3 rounded border">
                  {messageTemplates
                    .find(t => t.id === deliveryForm.templateId)?.content
                    .replace('{{patientName}}', myPatient?.fullName || '[Patient Name]')
                    .replace('{{babyGender}}', deliveryForm.babyGender || '[Baby Gender]')
                    .replace('{{deliveryTime}}', new Date().toLocaleString())
                  }
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCompleteDelivery} className="bg-green-600 hover:bg-green-700">
                Complete Delivery & Send SMS
              </Button>
              <Button variant="outline" onClick={() => setIsCompletingDelivery(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>Patients you've helped deliver</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.filter(p => p.assignedNurseId === user?.id && p.status === 'delivered').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No completed deliveries yet.
              </div>
            ) : (
              patients
                .filter(p => p.assignedNurseId === user?.id && p.status === 'delivered')
                .map((patient) => (
                  <div key={patient.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{patient.fullName}</h3>
                      <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Baby Gender: {patient.babyGender}
                    </p>
                    <p className="text-sm text-gray-600">
                      Delivered: {patient.deliveredAt ? new Date(patient.deliveredAt).toLocaleString() : 'N/A'}
                    </p>
                    {patient.deliveryNotes && (
                      <p className="text-sm text-gray-500 mt-2">
                        Notes: {patient.deliveryNotes}
                      </p>
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

export default LaborNurseDashboard;
