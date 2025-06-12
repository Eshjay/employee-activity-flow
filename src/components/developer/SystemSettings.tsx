
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RotateCcw, Database, Shield, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SystemSettings = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    autoReminders: true,
    dailyReportsEnabled: true,
    weeklyReportsEnabled: true,
    emailNotifications: true,
    maintenanceMode: false,
    dataRetentionDays: 90,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleResetSettings = () => {
    setSettings({
      autoReminders: true,
      dailyReportsEnabled: true,
      weeklyReportsEnabled: true,
      emailNotifications: true,
      maintenanceMode: false,
      dataRetentionDays: 90,
      sessionTimeout: 30,
      maxLoginAttempts: 5
    });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const systemHealth = [
    { name: "Database", status: "healthy", uptime: "99.9%" },
    { name: "Email Service", status: "healthy", uptime: "99.5%" },
    { name: "File Storage", status: "warning", uptime: "98.2%" },
    { name: "Authentication", status: "healthy", uptime: "100%" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            System Health
          </CardTitle>
          <CardDescription>
            Current status of system components and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemHealth.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-800">{service.name}</h3>
                  <p className="text-sm text-slate-600">Uptime: {service.uptime}</p>
                </div>
                {getStatusBadge(service.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Configure system behavior and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-reminders">Automatic Reminders</Label>
                  <p className="text-sm text-slate-600">Send automatic reminders for pending submissions</p>
                </div>
                <Switch
                  id="auto-reminders"
                  checked={settings.autoReminders}
                  onCheckedChange={(checked) => setSettings({...settings, autoReminders: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-slate-600">Enable system email notifications</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>
            </div>
          </div>

          {/* Report Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Reports
            </h3>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="daily-reports">Daily Reports</Label>
                  <p className="text-sm text-slate-600">Enable automatic daily report generation</p>
                </div>
                <Switch
                  id="daily-reports"
                  checked={settings.dailyReportsEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, dailyReportsEnabled: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-slate-600">Enable automatic weekly report generation</p>
                </div>
                <Switch
                  id="weekly-reports"
                  checked={settings.weeklyReportsEnabled}
                  onCheckedChange={(checked) => setSettings({...settings, weeklyReportsEnabled: checked})}
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </h3>
            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
                  <Input
                    id="max-login-attempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="data-retention">Data Retention (days)</Label>
                <Input
                  id="data-retention"
                  type="number"
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings({...settings, dataRetentionDays: parseInt(e.target.value)})}
                  className="max-w-xs"
                />
                <p className="text-sm text-slate-600 mt-1">How long to keep activity data before archiving</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-slate-600">Temporarily disable user access for maintenance</p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button onClick={handleSaveSettings} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleResetSettings} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
