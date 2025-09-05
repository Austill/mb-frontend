import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Download, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast"; 
import { 
  getCurrentUser, 
  // The following are placeholders for functions you'll need to create
  // updateProfile, 
  // updateSettings, 
  // changePassword, 
  // exportData, 
  // deleteAccount 
} from "@/services/authService";
import api from "@/services/authService"; // Keep for now, but aim to replace direct `api` calls

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
}

interface UserSettings {
  notifications: {
    moodReminders: boolean;
    journalReminders: boolean;
    crisisAlerts: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
  };
}

export default function Settings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      moodReminders: true,
      journalReminders: true,
      crisisAlerts: true,
      weeklyReports: false
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      crashReports: true
    },
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'UTC'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      // Load user profile
      const userProfile = await getCurrentUser();
      setProfile(userProfile);

      // TODO: Create a `getSettings` function in authService.ts and use it here
      const settingsResponse = await api.get('/api/user/settings');
      if (settingsResponse.data) {
        setSettings(settingsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    try {
      setIsSaving(true);
      // TODO: Create an `updateProfile` function in authService.ts and use it here
      await api.put('/api/user/profile', updatedProfile);
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsUpdate = async (updatedSettings: Partial<UserSettings>) => {
    try {
      setIsSaving(true);
      const newSettings = { ...settings, ...updatedSettings };
      // TODO: Create an `updateSettings` function in authService.ts and use it here
      await api.put('/api/user/settings', newSettings);
      setSettings(newSettings);
      toast({
        title: "Success",
        description: "Settings updated successfully"
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      // TODO: Create a `changePassword` function in authService.ts and use it here
      await api.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: "Success",
        description: "Password changed successfully"
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataExport = async () => {
    try {
      // TODO: Create an `exportData` function in authService.ts and use it here
      const response = await api.get('/api/user/export-data', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `serenity-tree-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Your data has been exported successfully"
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const handleAccountDeletion = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted."
    );
    
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      "This is your final warning. Deleting your account will permanently remove all your mood entries, journal entries, and personal data. Type 'DELETE' to confirm."
    );
    
    if (!doubleConfirm) return;

    try {
      // TODO: Create a `deleteAccount` function in authService.ts and use it here
      await api.delete('/api/user/account');
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted"
      });
      // Redirect to login or home page
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--wellness-primary))]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="w-6 h-6 text-[hsl(var(--wellness-primary))]" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-5 h-5 text-[hsl(var(--wellness-primary))]" />
              <h2 className="text-lg font-semibold">Profile Information</h2>
            </div>

            {profile && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>

                <Button 
                  onClick={() => handleProfileUpdate(profile)}
                  disabled={isSaving}
                  className="bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </Card>

          {/* Password Change */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-5 h-5 text-[hsl(var(--wellness-primary))]" />
              <h2 className="text-lg font-semibold">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handlePasswordChange}
                disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}
                className="bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))] text-white"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isSaving ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Bell className="w-5 h-5 text-[hsl(var(--wellness-primary))]" />
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Mood Check-in Reminders</div>
                  <div className="text-sm text-muted-foreground">
                    Get daily reminders to log your mood
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.moodReminders}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({
                      notifications: { ...settings.notifications, moodReminders: checked }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Journal Reminders</div>
                  <div className="text-sm text-muted-foreground">
                    Gentle reminders to write in your journal
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.journalReminders}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({
                      notifications: { ...settings.notifications, journalReminders: checked }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Crisis Support Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Important notifications about crisis resources
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.crisisAlerts}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({
                      notifications: { ...settings.notifications, crisisAlerts: checked }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Weekly Progress Reports</div>
                  <div className="text-sm text-muted-foreground">
                    Weekly summaries of your mental health journey
                  </div>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({
                      notifications: { ...settings.notifications, weeklyReports: checked }
                    })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="w-5 h-5 text-[hsl(var(--wellness-primary))]" />
              <h2 className="text-lg font-semibold">Privacy & Data</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Data Sharing</div>
                  <div className="text-sm text-muted-foreground">
                    Share anonymized data to help improve mental health research
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({
                      privacy: { ...settings.privacy, dataSharing: checked }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Analytics</div>
                  <div className="text-sm text-muted-foreground">
                    Help us improve the app by sharing usage analytics
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.analytics}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({
                      privacy: { ...settings.privacy, analytics: checked }
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Crash Reports</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically send crash reports to help fix bugs
                  </div>
                </div>
                <Switch
                  checked={settings.privacy.crashReports}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({
                      privacy: { ...settings.privacy, crashReports: checked }
                    })
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Database className="w-5 h-5 text-[hsl(var(--wellness-primary))]" />
              <h2 className="text-lg font-semibold">Data Management</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <div className="text-base font-medium">Export Your Data</div>
                  <div className="text-sm text-muted-foreground">
                    Download all your data in JSON format
                  </div>
                </div>
                <Button 
                  onClick={handleDataExport}
                  variant="outline"
                  className="border-[hsl(var(--wellness-primary))] text-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary)/0.1)]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These actions are permanent and cannot be undone. Please proceed with caution.
            </AlertDescription>
          </Alert>

          <Card className="p-6 border-destructive">
            <div className="flex items-center space-x-3 mb-6">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                <div className="space-y-2 mb-4">
                  <div className="text-base font-medium">Delete Account</div>
                  <div className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </div>
                </div>
                <Button 
                  onClick={handleAccountDeletion}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
