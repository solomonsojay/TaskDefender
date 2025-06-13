import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Eye, 
  Globe, 
  Monitor, 
  Smartphone,
  TrendingUp,
  Zap,
  AlertCircle,
  CheckCircle,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { monitoringService, ProductivityMetrics } from '../../services/MonitoringService';
import { enhancedAIAnalyzer, PredictiveInsight, PersonalizedRecommendation } from '../../services/EnhancedAIAnalyzer';

const MonitoringDashboard: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [permissions, setPermissions] = useState(monitoringService.getPermissions());
  const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMetrics = monitoringService.calculateProductivityMetrics({
      start: today,
      end: tomorrow
    });
    
    const todaySummary = monitoringService.getActivitySummary({
      start: today,
      end: tomorrow
    });

    const latestInsights = enhancedAIAnalyzer.getLatestInsights(5);
    const activeRecommendations = enhancedAIAnalyzer.getActiveRecommendations();
    const productivityTrends = enhancedAIAnalyzer.getProductivityTrends(7);

    setMetrics(todayMetrics);
    setActivitySummary(todaySummary);
    setInsights(latestInsights);
    setRecommendations(activeRecommendations);
    setTrends(productivityTrends);
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      monitoringService.stopMonitoring();
      enhancedAIAnalyzer.stopContinuousAnalysis();
    } else {
      monitoringService.startMonitoring();
      enhancedAIAnalyzer.startContinuousAnalysis();
    }
    setIsMonitoring(!isMonitoring);
  };

  const updatePermission = (permissionKey: string, enabled: boolean) => {
    const newPermissions = { ...permissions, [permissionKey]: enabled };
    setPermissions(newPermissions);
    monitoringService.updatePermissions(newPermissions);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity_dip': return AlertCircle;
      case 'break_recommendation': return Clock;
      case 'focus_opportunity': return Zap;
      default: return Activity;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'high': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <Monitor className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Monitoring
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered productivity analysis and insights
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleMonitoring}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            isMonitoring
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isMonitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}</span>
        </button>
      </div>

      {/* Monitoring Status */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monitoring Permissions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'browserTracking', label: 'Browser Activity', icon: Globe, description: 'Track website usage' },
            { key: 'applicationTracking', label: 'Application Usage', icon: Monitor, description: 'Monitor app usage' },
            { key: 'systemMonitoring', label: 'System Activity', icon: Activity, description: 'Track system events' },
          ].map(permission => (
            <div key={permission.key} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <permission.icon className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{permission.label}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{permission.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={permissions[permission.key as keyof typeof permissions] as boolean}
                    onChange={(e) => updatePermission(permission.key, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity Metrics */}
      {metrics && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Today's Productivity Metrics
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Overall Score', value: metrics.overallScore, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
              { label: 'Focus Score', value: metrics.focusScore, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' },
              { label: 'Productivity', value: metrics.productivityScore, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
              { label: 'Time Management', value: metrics.timeManagementScore, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
              { label: 'Consistency', value: metrics.consistencyScore, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/20' },
            ].map(metric => (
              <div key={metric.label} className={`${metric.bgColor} rounded-xl p-4 text-center`}>
                <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                  {metric.value}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Summary */}
      {activitySummary && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Breakdown
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Productive Time', value: formatTime(activitySummary.productiveTime), color: 'text-green-600' },
              { label: 'Neutral Time', value: formatTime(activitySummary.neutralTime), color: 'text-blue-600' },
              { label: 'Distracting Time', value: formatTime(activitySummary.distractingTime), color: 'text-red-600' },
              { label: 'Break Time', value: formatTime(activitySummary.breakTime), color: 'text-gray-600' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className={`text-xl font-bold ${item.color} mb-1`}>
                  {item.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Top Applications */}
          {activitySummary.topApplications.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Top Applications</h4>
              <div className="space-y-2">
                {activitySummary.topApplications.slice(0, 5).map((app: any, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <span className="font-medium text-gray-900 dark:text-white">{app.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(app.time)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.category === 'productive' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                        app.category === 'distracting' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {app.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI Insights
          </h3>
          
          <div className="space-y-3">
            {insights.map(insight => {
              const Icon = getInsightIcon(insight.type);
              const colorClass = getInsightColor(insight.severity);
              
              return (
                <div key={insight.id} className={`${colorClass} rounded-xl p-4`}>
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm mb-2">{insight.description}</p>
                      <p className="text-sm font-medium">💡 {insight.recommendation}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span>Confidence: {insight.confidence}%</span>
                        <span>{insight.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Personalized Recommendations
          </h3>
          
          <div className="space-y-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                
                <div className="space-y-1 mb-3">
                  {rec.actionItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Impact: {rec.estimatedImpact}%</span>
                  <span>Time: {rec.timeToImplement} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productivity Trends */}
      {trends && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            7-Day Productivity Trends
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Average</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {trends.weekly.averageScore}%
                </span>
                <TrendingUp className={`h-4 w-4 ${
                  trends.weekly.trend === 'improving' ? 'text-green-500' :
                  trends.weekly.trend === 'declining' ? 'text-red-500' :
                  'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${
                  trends.weekly.trend === 'improving' ? 'text-green-600' :
                  trends.weekly.trend === 'declining' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {trends.weekly.trend}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {trends.daily.map((day: any, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${day.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                  {day.score}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                  {day.focusTime}m focus
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;