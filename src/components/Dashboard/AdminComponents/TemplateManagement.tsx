
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useHospital } from '@/contexts/HospitalContext';
import { Plus, Edit2, Eye } from 'lucide-react';

const TemplateManagement: React.FC = () => {
  const { messageTemplates, addMessageTemplate, updateMessageTemplate } = useHospital();
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    isActive: true,
    createdBy: 'admin'
  });

  const handleAddTemplate = () => {
    addMessageTemplate(newTemplate);
    setIsAddingTemplate(false);
    setNewTemplate({ name: '', content: '', isActive: true, createdBy: 'admin' });
  };

  const toggleTemplateStatus = (id: string, currentStatus: boolean) => {
    updateMessageTemplate(id, { isActive: !currentStatus });
  };

  const templateVariables = [
    '{{patientName}} - Patient\'s full name',
    '{{nextOfKinName}} - Next of kin\'s name',
    '{{nextOfKinPhone}} - Next of kin\'s phone number',
    '{{babyGender}} - Baby\'s gender (male/female)',
    '{{deliveryTime}} - Time of delivery'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Manage SMS notification templates with dynamic patient data
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddingTemplate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingTemplate && (
            <Card className="mb-6 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Create New Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="templateContent">Message Content</Label>
                  <Textarea
                    id="templateContent"
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder="Hello {{nextOfKinName}}, we wanted to inform you that {{patientName}} has delivered a healthy {{babyGender}} baby at {{deliveryTime}}. Please contact us for more details."
                    rows={4}
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Available Variables:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {templateVariables.map((variable, index) => (
                      <li key={index} className="font-mono">• {variable}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">
                    Variables will be automatically replaced with actual patient data when messages are sent.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTemplate}>Create Template</Button>
                  <Button variant="outline" onClick={() => setIsAddingTemplate(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {messageTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{template.name}</h3>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleTemplateStatus(template.id, template.isActive)}
                    >
                      {template.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {template.content}
                </div>
              </CardContent>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

export default TemplateManagement;
