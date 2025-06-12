/**
 * External Monitoring Service
 * 
 * This service provides a framework for external app activity monitoring
 * with user permission controls and privacy-first design.
 * 
 * IMPORTANT: This is a simulation/framework. In production, this would require:
 * - Browser extensions for web activity monitoring
 * - System-level permissions for application tracking
 * - Calendar API integrations
 * - Email API access (with proper OAuth)
 */

export interface MonitoringPermission {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isEnabled: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  dataRetention: string;
}

export interface ActivityData {
  timestamp: Date;
  type: 'browser' | 'application' | 'calendar' | 'communication';
  category: 'productive' | 'neutral' | 'distracting';
  duration: number; // minutes
  application?: string;
  website?: string;
  title?: string;
  metadata?: Record<string, any>;
}

export interface ProductivityInsight {
  type: 'pattern' | 'suggestion' | 'warning' | 'achievement';
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number; // 0-100
  actionable: boolean;
}

export class ExternalMonitoringService {
  private permissions: Map<string, MonitoringPermission> = new Map();
  private activityData: ActivityData[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    this.loadPermissions();
    this.loadActivityData();
  }

  /**
   * Initialize monitoring permissions
   */
  private loadPermissions(): void {
    const defaultPermissions: MonitoringPermission[] = [
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

    // Load saved permissions
    const saved = localStorage.getItem('taskdefender_external_monitoring');
    if (saved) {
      try {
        const savedPermissions = JSON.parse(saved);
        defaultPermissions.forEach(permission => {
          const savedPerm = savedPermissions.find((p: any) => p.id === permission.id);
          if (savedPerm) {
            permission.isEnabled = savedPerm.isEnabled;
          }
          this.permissions.set(permission.id, permission);
        });
      } catch (error) {
        console.error('Failed to load external monitoring permissions:', error);
      }
    } else {
      defaultPermissions.forEach(permission => {
        this.permissions.set(permission.id, permission);
      });
    }
  }

  /**
   * Load existing activity data
   */
  private loadActivityData(): void {
    const saved = localStorage.getItem('taskdefender_activity_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.activityData = data.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch (error) {
        console.error('Failed to load activity data:', error);
      }
    }
  }

  /**
   * Save permissions to localStorage
   */
  private savePermissions(): void {
    const permissionsArray = Array.from(this.permissions.values());
    localStorage.setItem('taskdefender_external_monitoring', JSON.stringify(
      permissionsArray.map(p => ({ id: p.id, isEnabled: p.isEnabled }))
    ));
  }

  /**
   * Save activity data to localStorage
   */
  private saveActivityData(): void {
    // Only keep data within retention periods
    const now = new Date();
    const filteredData = this.activityData.filter(activity => {
      const permission = this.permissions.get(this.getPermissionIdForActivity(activity));
      if (!permission) return false;
      
      const retentionDays = parseInt(permission.dataRetention.split(' ')[0]);
      const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
      
      return (now.getTime() - activity.timestamp.getTime()) < retentionMs;
    });

    this.activityData = filteredData;
    localStorage.setItem('taskdefender_activity_data', JSON.stringify(this.activityData));
  }

  /**
   * Get permission ID for activity type
   */
  private getPermissionIdForActivity(activity: ActivityData): string {
    switch (activity.type) {
      case 'browser': return 'browser-activity';
      case 'application': return 'system-activity';
      case 'calendar': return 'calendar-integration';
      case 'communication': return 'communication-patterns';
      default: return 'browser-activity';
    }
  }

  /**
   * Enable or disable a monitoring permission
   */
  public setPermission(permissionId: string, enabled: boolean): boolean {
    const permission = this.permissions.get(permissionId);
    if (!permission) return false;

    permission.isEnabled = enabled;
    this.savePermissions();

    // Start or stop monitoring based on enabled permissions
    this.updateMonitoringState();

    return true;
  }

  /**
   * Get all permissions
   */
  public getPermissions(): MonitoringPermission[] {
    return Array.from(this.permissions.values());
  }

  /**
   * Get enabled permissions
   */
  public getEnabledPermissions(): MonitoringPermission[] {
    return Array.from(this.permissions.values()).filter(p => p.isEnabled);
  }

  /**
   * Update monitoring state based on enabled permissions
   */
  private updateMonitoringState(): void {
    const hasEnabledPermissions = Array.from(this.permissions.values()).some(p => p.isEnabled);
    
    if (hasEnabledPermissions && !this.isMonitoring) {
      this.startMonitoring();
    } else if (!hasEnabledPermissions && this.isMonitoring) {
      this.stopMonitoring();
    }
  }

  /**
   * Start monitoring (simulation)
   */
  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🔍 External monitoring started');

    // Simulate activity monitoring every 5 minutes
    this.monitoringInterval = setInterval(() => {
      this.simulateActivityCapture();
    }, 5 * 60 * 1000);

    // Initial capture
    this.simulateActivityCapture();
  }

  /**
   * Stop monitoring
   */
  private stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    console.log('🛑 External monitoring stopped');
  }

  /**
   * Simulate activity capture (for demo purposes)
   */
  private simulateActivityCapture(): void {
    const enabledPermissions = this.getEnabledPermissions();
    
    enabledPermissions.forEach(permission => {
      // Generate simulated activity data
      const activities = this.generateSimulatedActivity(permission.id);
      activities.forEach(activity => {
        this.recordActivity(activity);
      });
    });
  }

  /**
   * Generate simulated activity data
   */
  private generateSimulatedActivity(permissionId: string): ActivityData[] {
    const now = new Date();
    const activities: ActivityData[] = [];

    switch (permissionId) {
      case 'browser-activity':
        activities.push({
          timestamp: now,
          type: 'browser',
          category: Math.random() > 0.6 ? 'productive' : 'distracting',
          duration: Math.floor(Math.random() * 30) + 5,
          website: Math.random() > 0.5 ? 'github.com' : 'youtube.com',
          title: 'Web browsing activity'
        });
        break;

      case 'system-activity':
        activities.push({
          timestamp: now,
          type: 'application',
          category: Math.random() > 0.7 ? 'productive' : 'neutral',
          duration: Math.floor(Math.random() * 45) + 10,
          application: Math.random() > 0.5 ? 'VS Code' : 'Slack',
          title: 'Application usage'
        });
        break;

      case 'calendar-integration':
        if (Math.random() > 0.8) { // 20% chance of calendar event
          activities.push({
            timestamp: now,
            type: 'calendar',
            category: 'productive',
            duration: 60,
            title: 'Team Meeting',
            metadata: { eventType: 'meeting', attendees: 5 }
          });
        }
        break;

      case 'communication-patterns':
        activities.push({
          timestamp: now,
          type: 'communication',
          category: 'neutral',
          duration: Math.floor(Math.random() * 15) + 2,
          title: 'Email activity',
          metadata: { 
            emailsReceived: Math.floor(Math.random() * 10),
            emailsSent: Math.floor(Math.random() * 5)
          }
        });
        break;
    }

    return activities;
  }

  /**
   * Record activity data
   */
  private recordActivity(activity: ActivityData): void {
    const permissionId = this.getPermissionIdForActivity(activity);
    const permission = this.permissions.get(permissionId);
    
    if (!permission || !permission.isEnabled) return;

    this.activityData.push(activity);
    this.saveActivityData();
  }

  /**
   * Get activity data for analysis
   */
  public getActivityData(
    startDate?: Date, 
    endDate?: Date, 
    type?: ActivityData['type']
  ): ActivityData[] {
    let filtered = this.activityData;

    if (startDate) {
      filtered = filtered.filter(activity => activity.timestamp >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(activity => activity.timestamp <= endDate);
    }

    if (type) {
      filtered = filtered.filter(activity => activity.type === type);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Generate productivity insights from activity data
   */
  public generateInsights(): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    const recentData = this.getActivityData(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    if (recentData.length === 0) return insights;

    // Analyze productive vs distracting time
    const productiveTime = recentData
      .filter(a => a.category === 'productive')
      .reduce((sum, a) => sum + a.duration, 0);
    
    const distractingTime = recentData
      .filter(a => a.category === 'distracting')
      .reduce((sum, a) => sum + a.duration, 0);

    const totalTime = productiveTime + distractingTime;
    const productivityRatio = totalTime > 0 ? (productiveTime / totalTime) * 100 : 0;

    if (productivityRatio < 60) {
      insights.push({
        type: 'warning',
        title: 'High Distraction Detected',
        description: `You spent ${Math.round(distractingTime)} minutes on distracting activities this week (${Math.round(100 - productivityRatio)}% of tracked time).`,
        data: { productivityRatio, distractingTime, productiveTime },
        confidence: 85,
        actionable: true
      });
    } else if (productivityRatio > 80) {
      insights.push({
        type: 'achievement',
        title: 'Excellent Focus!',
        description: `You maintained ${Math.round(productivityRatio)}% productive time this week. Keep it up!`,
        data: { productivityRatio, productiveTime },
        confidence: 90,
        actionable: false
      });
    }

    // Analyze peak productivity hours
    const hourlyActivity = new Map<number, number>();
    recentData.filter(a => a.category === 'productive').forEach(activity => {
      const hour = activity.timestamp.getHours();
      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + activity.duration);
    });

    if (hourlyActivity.size > 0) {
      const peakHour = Array.from(hourlyActivity.entries())
        .sort((a, b) => b[1] - a[1])[0][0];
      
      insights.push({
        type: 'pattern',
        title: 'Peak Productivity Hour Identified',
        description: `You're most productive around ${peakHour}:00. Consider scheduling important tasks during this time.`,
        data: { peakHour, hourlyActivity: Object.fromEntries(hourlyActivity) },
        confidence: 75,
        actionable: true
      });
    }

    // Application usage patterns
    const appUsage = new Map<string, number>();
    recentData.filter(a => a.application).forEach(activity => {
      const app = activity.application!;
      appUsage.set(app, (appUsage.get(app) || 0) + activity.duration);
    });

    if (appUsage.size > 0) {
      const topApp = Array.from(appUsage.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      insights.push({
        type: 'pattern',
        title: 'Top Application Usage',
        description: `You spent ${Math.round(topApp[1])} minutes in ${topApp[0]} this week.`,
        data: { topApp: topApp[0], duration: topApp[1], allApps: Object.fromEntries(appUsage) },
        confidence: 95,
        actionable: false
      });
    }

    return insights;
  }

  /**
   * Get monitoring status
   */
  public getMonitoringStatus(): {
    isActive: boolean;
    enabledPermissions: number;
    totalDataPoints: number;
    lastActivity?: Date;
  } {
    const enabledPermissions = this.getEnabledPermissions().length;
    const lastActivity = this.activityData.length > 0 
      ? this.activityData[this.activityData.length - 1].timestamp 
      : undefined;

    return {
      isActive: this.isMonitoring,
      enabledPermissions,
      totalDataPoints: this.activityData.length,
      lastActivity
    };
  }

  /**
   * Clear all activity data
   */
  public clearActivityData(): void {
    this.activityData = [];
    localStorage.removeItem('taskdefender_activity_data');
  }

  /**
   * Export activity data
   */
  public exportActivityData(): string {
    return JSON.stringify({
      permissions: Array.from(this.permissions.values()),
      activityData: this.activityData,
      insights: this.generateInsights(),
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }
}

// Singleton instance
export const externalMonitoringService = new ExternalMonitoringService();