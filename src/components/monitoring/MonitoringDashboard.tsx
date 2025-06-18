import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import { monitoringService, ExternalActivity, ProductivityMetrics } from '../../services/MonitoringService';

const MonitoringDashboard: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [permissions, setPermissions] = useState({
    browserTracking: false,
    applicationTracking: false,
    calendarIntegration: false,
    communicationAnalysis: false,
    systemMonitoring: false,
    lastUpdated: new Date()
  });
  const [activities, setActivities] = useState<ExternalActivity[]>([]);
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [showSettings, setShowSettings] = useState(false);

  // Load initial state
  useEffect(() => {
    const currentPermissions = monitoringService.getPermissions();
    setPermissions(currentPermissions);
    
    const status = monitoringService.getMonitoringStatus();
    setIsMonitoring(status.isActive);
    
    loadData();
  }, []);

  // Listen for permission changes
  useEffect(() => {
    const unsubscribe = monitoringService.onPermissionChange((newPermissions) => {
      setPermissions(newPermissions);
      const status = monitoringService.getMonitoringStatus();
      setIsMonitoring(status.isActive);
    });

    return unsubscribe;
  }, []);

  const loadData = () => {
    const now = new Date();
    let start: Date;
    
    switch (timeRange) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        break;
    }

    const recentActivities = monitoringService.getActivities({ start, end: now });
    setActivities(recentActivities);
    
    const productivityMetrics = monitoringService.calculateProductivityMetrics({ start, end: now });
    setMetrics(productivityMetrics);
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const handlePermissionChange = (permission: string, enabled: boolean) => {
    monitoringService.updatePermissions({
      [permission]: enabled
    });
  };

  const getActivitySummary = () => {
    const now = new Date();
    let start: Date;
    
    switch (timeRange) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        break;
    }

    return monitoringService.getActivitySummary({ start, end: now });
  };

  const summary = getActivitySummary();

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPermissionIcon = (enabled: boolean) => {
    if (enabled) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getPermissionDescription = (permission: string) => {
    switch (permission) {
      case 'browserTracking':
        return 'Track time spent on websites and browser activity';
      case 'applicationTracking':
        return 'Monitor application usage and switching patterns';
      case 'calendarIntegration':
        return 'Access calendar events for better scheduling insights';
      case 'communicationAnalysis':
        return 'Analyze email and messaging patterns (metadata only)';
      case 'systemMonitoring':
        return 'Track system-level activity and idle time';
      default:
        return 'Unknown permission';
    }
  };

  const getPermissionRisk = (permission: string): 'low' | 'medium' | 'high' => {
    switch (permission) {
      case 'browserTracking': return 'medium';
      case 'applicationTracking': return 'high';
      case 'calendarIntegration': return 'low';
      case 'communicationAnalysis': return 'medium';
      case 'systemMonitoring': return 'high';
      default: return 'low';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/20 p-3 rounded-xl">
            <Monitor className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Monitoring
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track external activity and productivity patterns
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            isMonitoring 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isMonitoring ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Settings className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monitoring Permissions
          </h3>
          
          <div className="space-y-4">
            {Object.entries(permissions).map(([key, value]) => {
              if (key === 'lastUpdated') return null;
              
              const risk = getPermissionRisk(key);
              
              return (
                <div key={key} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getPermissionIcon(value as boolean)}
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk)}`}>
                        {risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getPermissionDescription(key)}
                    </p>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={value as boolean}
                      onChange={(e) => handlePermissionChange(key, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                  Privacy Notice
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  All monitoring data is stored locally on your device. No data is sent to external servers. 
                  You can disable any permission at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Range Selector */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'today', label: 'Today' },
          { id: 'week', label: 'Week' },
          { id: 'month', label: 'Month' }
        ].map(range => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              timeRange === range.id
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.overallScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.focusScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Focus Score</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.productivityScore}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Productivity</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(summary.totalTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Time Distribution
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Productive</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTime(summary.productiveTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summary.totalTime > 0 ? (summary.productiveTime / summary.totalTime) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Distracting</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTime(summary.distractingTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summary.totalTime > 0 ? (summary.distractingTime / summary.totalTime) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Neutral</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTime(summary.neutralTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summary.totalTime > 0 ? (summary.neutralTime / summary.totalTime) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Break</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTime(summary.breakTime)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summary.totalTime > 0 ? (summary.breakTime / summary.totalTime) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Applications
          </h3>
          
          <div className="space-y-3">
            {summary.topApplications.slice(0, 5).map((app) => (
              <div key={app.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    app.category === 'productive' ? 'bg-green-500' :
                    app.category === 'distracting' ? 'bg-red-500' :
                    app.category === 'neutral' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {app.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatTime(app.time)}
                </span>
              </div>
            ))}
            
            {summary.topApplications.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                No application data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        
        <div className="space-y-3">
          {activities.slice(0, 10).map(activity => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  activity.category === 'productive' ? 'bg-green-500' :
                  activity.category === 'distracting' ? 'bg-red-500' :
                  activity.category === 'neutral' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {activity.title || activity.application || activity.website || 'Unknown Activity'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.type} • {activity.category}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatTime(activity.duration)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No activity data available. Enable monitoring permissions to start tracking.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;