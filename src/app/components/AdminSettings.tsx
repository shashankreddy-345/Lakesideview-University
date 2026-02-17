import { Settings, Bell, Database, Users, Shield, Mail } from "lucide-react";
import { useState } from "react";

export default function AdminSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoApproval, setAutoApproval] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="p-6 md:p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system preferences and administrative options
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl">General Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-2">University Name</label>
            <input
              type="text"
              value="Lakeside View University"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm mb-2">System Timezone</label>
            <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>UTC-6 (Central Time)</option>
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC-7 (Mountain Time)</option>
              <option>UTC-8 (Pacific Time)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Maximum Booking Duration (hours)</label>
            <input
              type="number"
              defaultValue={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Advance Booking Period (days)</label>
            <input
              type="number"
              defaultValue={14}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-xl">Notification Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div>
              <h3 className="text-sm mb-1">Email Notifications</h3>
              <p className="text-xs text-muted-foreground">Send email updates to administrators</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-6 rounded-full transition-colors ${
                emailNotifications ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div>
              <h3 className="text-sm mb-1">Push Notifications</h3>
              <p className="text-xs text-muted-foreground">Enable browser push notifications</p>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`w-12 h-6 rounded-full transition-colors ${
                pushNotifications ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div>
              <h3 className="text-sm mb-1">Auto-Approval for Bookings</h3>
              <p className="text-xs text-muted-foreground">Automatically approve all booking requests</p>
            </div>
            <button
              onClick={() => setAutoApproval(!autoApproval)}
              className={`w-12 h-6 rounded-full transition-colors ${
                autoApproval ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                autoApproval ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl">User Management</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm">Total Students</h3>
              <span className="text-2xl">15,247</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Active in last 7 days</span>
              <span>12,854</span>
            </div>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm">Admin Users</h3>
              <span className="text-2xl">5</span>
            </div>
            <button className="text-sm text-primary hover:underline">Manage Administrators</button>
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-xl">System Maintenance</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
            <div>
              <h3 className="text-sm mb-1">Maintenance Mode</h3>
              <p className="text-xs text-muted-foreground">Temporarily disable student access</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <h3 className="text-sm mb-2">Database Backup</h3>
            <p className="text-xs text-muted-foreground mb-3">Last backup: February 16, 2026 at 2:00 AM</p>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Backup Now
            </button>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <h3 className="text-sm mb-2">Clear Cache</h3>
            <p className="text-xs text-muted-foreground mb-3">Improve performance by clearing system cache</p>
            <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-border mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl">Security Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="text-sm mb-2">Two-Factor Authentication</h3>
            <p className="text-xs text-muted-foreground mb-3">Status: Enabled</p>
            <button className="text-sm text-primary hover:underline">Configure 2FA</button>
          </div>

          <div className="p-4 border border-border rounded-lg">
            <h3 className="text-sm mb-2">Session Timeout</h3>
            <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-2">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option selected>1 hour</option>
              <option>2 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
          Cancel
        </button>
        <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
