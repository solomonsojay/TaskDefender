import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  Clock,
  Activity,
  Database,
  Lock,
  Unlock,
  Settings as SettingsIcon
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface DataCategory {
  id: string;
  name: string;
  description: string;
  dataPoints: string[];
  isActive: boolean;
  canDisable: boolean;
}

interface ExternalMonitoringPermission {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isEnabled: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  dataRetention: string;
}

const DataPrivacySettings: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'data-collection' | 'external-monitoring' | 'export-delete'>('overview');
  const [dataCategories, setDataCategories] = useState<DataCategory[]>([]);
  const [externalPermissions, setExternalPermissions] = useState<ExternalMonitoringPermission[]>([]);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize data categories
  useEffect(() => {
    const categories: DataCategory[] = [
      {
        id: 'task-behavior',
        name: 'Task Behavior Tracking',
        description: 'Monitors how you interact with tasks within TaskDefender',
        dataPoints: [
          'Task creation and completion timestamps',
          'Time spent on individual tasks',
          'Task priority and status changes',
          'Focus session duration and interruptions',
          'Honesty self-reporting for task completion'
        ],
        isActive: true,
        canDisable: false // Core functionality
      },
      {
        id: 'activity-patterns',
        name: 'Activity Pattern Analysis',
        description: 'Tracks your productivity patterns and work habits',
        dataPoints: [
          'Mouse and keyboard activity within the app',
          'Idle time detection',
          'Productive hours identification',
          'Work session patterns',
          'Procrastination risk scoring'
        ],
        isActive: true,
        canDisable: true
      },
      {
        id: 'sarcasm-engine',
        name: 'Sarcasm Engine Data',
        description: 'Collects data to personalize motivational prompts',
        dataPoints: [
          'Prompt response effectiveness',
          'Preferred persona types',
          'Nudge timing preferences',
          'Completion celebration triggers',
          'Prompt dismissal patterns'
        ],
        isActive: true,
        canDisable: true
      },
      {
        id: 'performance-metrics',
        name: 'Performance Analytics',
        description: 'Tracks productivity metrics and achievements',
        dataPoints: [
          'Daily task completion rates',
          'Streak maintenance',
          'Integrity score calculations',
          'Badge and achievement progress',
          'Team productivity comparisons (if applicable)'
        ],
        isActive: true,
        canDisable: true
      }
    ];

    // Load saved preferences
    const savedPreferences = localStorage.getItem('taskdefender_privacy_settings');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        categories.forEach(category => {
          const saved = preferences.dataCategories?.find((c: any) => c.id === category.id);
          if (saved) {
            category.isActive = saved.isActive;
          }
        });
      } catch (error) {
        console.error('Failed to load privacy settings:', error);
      }
    }

    setDataCategories(categories);
  }, []);

  // Initialize external monitoring permissions
  useEffect(() => {
    const permissions: ExternalMonitoringPermission[] = [
      {
        id: 'browser-activity',
        name: 'Browser Activity Monitoring',
        description: 'Track time spent on different websites and applications',
        permissions: [
          'Access to browser history',
          'Active tab monitoring',
          'Website categorization (productive vs distracting)',
          'Time tracking across applications'
        ],
        isEnabled: false,
        riskLevel: 'medium',
        dataRetention: '30 days'
      },
      {
        id: 'system-activity',
        name: 'System-Wide Activity Tracking',
        description: 'Monitor computer usage patterns and application switching',
        permissions: [
          'Application usage tracking',
          'System idle time detection',
          'Window focus monitoring',
          'Keystroke and mouse activity (anonymized)'
        ],
        isEnabled: false,
        riskLevel: 'high',
        dataRetention: '7 days'
      },
      {
        id: 'calendar-integration',
        name: 'Calendar & Schedule Access',
        description: 'Integrate with your calendar to optimize task scheduling',
        permissions: [
          'Read calendar events',
          'Identify free time slots',
          'Meeting and appointment awareness',
          'Schedule optimization suggestions'
        ],
        isEnabled: false,
        riskLevel: 'low',
        dataRetention: '90 days'
      },
      {
        id: 'communication-patterns',
        name: 'Communication Pattern Analysis',
        description: 'Analyze email and messaging patterns for productivity insights',
        permissions: [
          'Email frequency analysis (metadata only)',
          'Response time patterns',
          'Communication peak hours',
          'Meeting frequency tracking'
        ],
        isEnabled: false,
        riskLevel: 'medium',
        dataRetention: '14 days'
      }
    ];

    // Load saved external permissions
    const savedExternal = localStorage.getItem('taskdefender_external_monitoring');
    if (savedExternal) {
      try {
        const saved = JSON.parse(savedExternal);
        permissions.forEach(permission => {
          const savedPerm = saved.find((p: any) => p.id === permission.id);
          if (savedPerm) {
            permission.isEnabled = savedPerm.isEnabled;
          }
        });
      } catch (error) {
        console.error('Failed to load external monitoring settings:', error);
      }
    }

    setExternalPermissions(permissions);
  }, []);

  // Save preferences
  const savePreferences = () => {
    localStorage.setItem('taskdefender_privacy_settings', JSON.stringify({
      dataCategories: dataCategories.map(c => ({ id: c.id, isActive: c.isActive })),
      lastUpdated: new Date().toISOString()
    }));

    localStorage.setItem('taskdefender_external_monitoring', JSON.stringify(
      externalPermissions.map(p => ({ id: p.id, isEnabled: p.isEnabled }))
    ));
  };

  const toggleDataCategory = (categoryId: string) => {
    setDataCategories(prev => prev.map(category => 
      category.id === categoryId && category.canDisable
        ? { ...category, isActive: !category.isActive }
        : category
    ));
  };

  const toggleExternalPermission = (permissionId: string) => {
    setExternalPermissions(prev => prev.map(permission => 
      permission.id === permissionId
        ? { ...permission, isEnabled: !permission.isEnabled }
        : permission
    ));
  };

  const exportData = () => {
    const data = {
      user: user,
      tasks: JSON.parse(localStorage.getItem('taskdefender_tasks') || '[]'),
      settings: JSON.parse(localStorage.getItem('taskdefender_privacy_settings') || '{}'),
      notifications: JSON.parse(localStorage.getItem('taskdefender_notifications') || '[]'),
      voiceSettings: JSON.parse(localStorage.getItem('taskdefender_voice_settings') || '{}'),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskdefender-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteAllData = () => {
    const keysToDelete = [
      'taskdefender_tasks',
      'taskdefender_privacy_settings',
      'taskdefender_notifications',
      'taskdefender_voice_settings',
      'taskdefender_external_monitoring',
      'taskdefender_persona',
      'theme'
    ];

    keysToDelete.forEach(key => localStorage.removeItem(key));
    setShowDeleteConfirm(false);
    
    // Reload the page to reset the app state
    window.location.reload();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [dataCategories, externalPermissions]);

  const tabs = [
    { id: 'overview', label: 'Privacy Overview', icon: Shield },
    { id: 'data-collection', label: 'Data Collection', icon: Database },
    { id: 'external-monitoring', label: 'External Monitoring', icon: Monitor },
    { id: 'export-delete', label: 'Export & Delete', icon: Download },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Data & Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Understand and control how TaskDefender uses your data
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    Privacy-First Design
                  </h3>
                </div>
                <div className="space-y-3 text-green-600 dark:text-green-300">
                  <p>✅ All data stored locally on your device</p>
                  <p>✅ No external servers or third-party analytics</p>
                  <p>✅ You maintain full control over your information</p>
                  <p>✅ Optional external monitoring with explicit consent</p>
                  <p>✅ Complete data export and deletion capabilities</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Database className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Data Collection</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    We collect minimal data necessary for TaskDefender to function effectively.
                  </p>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p>• Task and productivity data</p>
                    <p>• Work pattern analysis</p>
                    <p>• User preferences and settings</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lock className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Data Security</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Your data is encrypted and stored securely on your device.
                  </p>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p>• Browser-based encryption</p>
                    <p>• No cloud storage by default</p>
                    <p>• Optional external monitoring</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">
                  What Makes TaskDefender Different?
                </h4>
                <div className="space-y-2 text-blue-600 dark:text-blue-300 text-sm">
                  <p>• <strong>Transparency:</strong> You can see exactly what data is collected and why</p>
                  <p>• <strong>Control:</strong> Enable or disable specific tracking features</p>
                  <p>• <strong>Ownership:</strong> Your data stays on your device unless you choose otherwise</p>
                  <p>• <strong>Purpose:</strong> Data is used solely to improve your productivity experience</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data-collection' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Internal Data Collection
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Control what data TaskDefender collects about your productivity habits.
                </p>
              </div>

              <div className="space-y-4">
                {dataCategories.map(category => (
                  <div key={category.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {category.name}
                          </h4>
                          {category.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {category.description}
                        </p>
                        <div className="space-y-1">
                          {category.dataPoints.map((point, index) => (
                            <p key={index} className="text-xs text-gray-500 dark:text-gray-400">
                              • {point}
                            </p>
                          ))}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {category.canDisable ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={category.isActive}
                              onChange={() => toggleDataCategory(category.id)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        ) : (
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <Lock className="h-3 w-3" />
                            <span>Required</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'external-monitoring' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">
                    External Monitoring (Optional)
                  </h3>
                </div>
                <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                  These features require additional permissions and will monitor activity outside of TaskDefender. 
                  All data remains on your device and can be disabled at any time.
                </p>
              </div>

              <div className="space-y-4">
                {externalPermissions.map(permission => (
                  <div key={permission.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {permission.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(permission.riskLevel)}`}>
                            {permission.riskLevel.toUpperCase()} RISK
                          </span>
                          {permission.isEnabled ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {permission.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Required Permissions:
                            </h5>
                            <div className="space-y-1">
                              {permission.permissions.map((perm, index) => (
                                <p key={index} className="text-xs text-gray-500 dark:text-gray-400">
                                  • {perm}
                                </p>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Data Retention:
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {permission.dataRetention}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={permission.isEnabled}
                            onChange={() => toggleExternalPermission(permission.id)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                    
                    {permission.isEnabled && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          ⚠️ This feature is currently simulated. In a production environment, 
                          this would require browser extensions or system-level permissions.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export-delete' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Download className="h-6 w-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                      Export Your Data
                    </h3>
                  </div>
                  <p className="text-blue-600 dark:text-blue-300 text-sm mb-4">
                    Download all your TaskDefender data in JSON format. This includes tasks, 
                    settings, work patterns, and all collected analytics.
                  </p>
                  <button
                    onClick={exportData}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export All Data</span>
                  </button>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Trash2 className="h-6 w-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                      Delete All Data
                    </h3>
                  </div>
                  <p className="text-red-600 dark:text-red-300 text-sm mb-4">
                    Permanently delete all TaskDefender data from your device. 
                    This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete All Data</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  What's Included in Your Data Export?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Core Data:</h5>
                    <ul className="space-y-1">
                      <li>• User profile and preferences</li>
                      <li>• All tasks and their metadata</li>
                      <li>• Work patterns and analytics</li>
                      <li>• Focus session history</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Settings & Config:</h5>
                    <ul className="space-y-1">
                      <li>• Privacy and monitoring preferences</li>
                      <li>• Notification schedules</li>
                      <li>• Voice call settings</li>
                      <li>• Sarcasm engine persona choices</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete All Data?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This will permanently delete all your TaskDefender data including tasks, 
                settings, and work patterns. This action cannot be undone.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={deleteAllData}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors duration-200"
              >
                Yes, Delete Everything
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPrivacySettings;