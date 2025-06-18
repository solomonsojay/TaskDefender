export interface ExternalActivity {
  id: string;
  timestamp: Date;
  type: 'browser' | 'application' | 'calendar' | 'communication' | 'system';
  category: 'productive' | 'neutral' | 'distracting' | 'break';
  application?: string;
  website?: string;
  title?: string;
  duration: number; // seconds
  url?: string;
  metadata?: Record<string, any>;
  userId: string;
}

export interface ProductivityMetrics {
  focusScore: number; // 0-100
  productivityScore: number; // 0-100
  timeManagementScore: number; // 0-100
  consistencyScore: number; // 0-100
  overallScore: number; // 0-100
  calculatedAt: Date;
  period: 'daily' | 'weekly' | 'monthly';
}

export interface MonitoringPermissions {
  browserTracking: boolean;
  applicationTracking: boolean;
  calendarIntegration: boolean;
  communicationAnalysis: boolean;
  systemMonitoring: boolean;
  lastUpdated: Date;
}

export class MonitoringService {
  private activities: ExternalActivity[] = [];
  private permissions: MonitoringPermissions;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private permissionChangeCallbacks: ((permissions: MonitoringPermissions) => void)[] = [];

  constructor() {
    this.permissions = this.loadPermissions();
    this.loadActivities();
    
    // Auto-start monitoring if permissions exist
    if (this.hasAnyPermission()) {
      this.startMonitoring();
    }
  }

  // Permission Management with immediate feedback
  public updatePermissions(newPermissions: Partial<MonitoringPermissions>): void {
    this.permissions = {
      ...this.permissions,
      ...newPermissions,
      lastUpdated: new Date()
    };
    
    // Save immediately
    this.savePermissions();
    
    // Notify callbacks immediately
    this.permissionChangeCallbacks.forEach(callback => {
      try {
        callback(this.permissions);
      } catch (error) {
        console.error('Permission callback error:', error);
      }
    });
    
    // Update monitoring state
    if (this.hasAnyPermission() && !this.isMonitoring) {
      this.startMonitoring();
    } else if (!this.hasAnyPermission() && this.isMonitoring) {
      this.stopMonitoring();
    }
    
    console.log('Permissions updated:', {
      new: this.permissions,
      monitoring: this.isMonitoring
    });
  }

  public onPermissionChange(callback: (permissions: MonitoringPermissions) => void): () => void {
    this.permissionChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.permissionChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.permissionChangeCallbacks.splice(index, 1);
      }
    };
  }

  public getPermissions(): MonitoringPermissions {
    return { ...this.permissions };
  }

  private hasAnyPermission(): boolean {
    return Object.entries(this.permissions).some(([key, value]) => 
      key !== 'lastUpdated' && typeof value === 'boolean' && value
    );
  }

  // Monitoring Control with better error handling
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('Monitoring already active');
      return;
    }
    
    if (!this.hasAnyPermission()) {
      console.log('No permissions granted, cannot start monitoring');
      return;
    }
    
    this.isMonitoring = true;
    
    // Request notification permission if needed
    this.requestNotificationPermission();
    
    this.monitoringInterval = setInterval(() => {
      this.collectActivityData();
    }, 30000); // Collect every 30 seconds
    
    console.log('🔍 Monitoring started with permissions:', this.permissions);
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('⏹️ Monitoring stopped');
  }

  public getMonitoringStatus(): { isActive: boolean; hasPermissions: boolean } {
    return {
      isActive: this.isMonitoring,
      hasPermissions: this.hasAnyPermission()
    };
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  }

  // Data Collection (Enhanced mock implementations)
  private async collectActivityData(): Promise<void> {
    if (!this.isMonitoring) return;
    
    const activities: ExternalActivity[] = [];

    try {
      // Browser Activity (Mock with permission check)
      if (this.permissions.browserTracking) {
        const browserActivity = await this.mockBrowserActivity();
        if (browserActivity) activities.push(browserActivity);
      }

      // Application Activity (Mock with permission check)
      if (this.permissions.applicationTracking) {
        const appActivity = await this.mockApplicationActivity();
        if (appActivity) activities.push(appActivity);
      }

      // System Activity (Mock with permission check)
      if (this.permissions.systemMonitoring) {
        const systemActivity = await this.mockSystemActivity();
        if (systemActivity) activities.push(systemActivity);
      }

      // Store activities
      activities.forEach(activity => this.addActivity(activity));
      
      if (activities.length > 0) {
        console.log(`Collected ${activities.length} activities`);
      }
    } catch (error) {
      console.error('Error collecting activity data:', error);
    }
  }

  // Enhanced Mock Data Generators
  private async mockBrowserActivity(): Promise<ExternalActivity | null> {
    const websites = [
      { url: 'github.com', category: 'productive' as const, title: 'GitHub - Code Repository' },
      { url: 'stackoverflow.com', category: 'productive' as const, title: 'Stack Overflow - Programming Q&A' },
      { url: 'youtube.com', category: 'distracting' as const, title: 'YouTube - Video Platform' },
      { url: 'twitter.com', category: 'distracting' as const, title: 'Twitter - Social Media' },
      { url: 'docs.google.com', category: 'productive' as const, title: 'Google Docs - Document' },
      { url: 'slack.com', category: 'neutral' as const, title: 'Slack - Team Communication' },
      { url: 'notion.so', category: 'productive' as const, title: 'Notion - Workspace' },
      { url: 'reddit.com', category: 'distracting' as const, title: 'Reddit - Social News' },
    ];

    const randomSite = websites[Math.floor(Math.random() * websites.length)];
    
    return {
      id: `browser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'browser',
      category: randomSite.category,
      website: randomSite.url,
      title: randomSite.title,
      url: `https://${randomSite.url}`,
      duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
      userId: 'current-user'
    };
  }

  private async mockApplicationActivity(): Promise<ExternalActivity | null> {
    const applications = [
      { name: 'VS Code', category: 'productive' as const, title: 'Visual Studio Code' },
      { name: 'Slack', category: 'neutral' as const, title: 'Slack - Team Communication' },
      { name: 'Spotify', category: 'neutral' as const, title: 'Spotify - Music' },
      { name: 'Discord', category: 'distracting' as const, title: 'Discord - Gaming Chat' },
      { name: 'Figma', category: 'productive' as const, title: 'Figma - Design Tool' },
      { name: 'Chrome', category: 'neutral' as const, title: 'Google Chrome' },
      { name: 'Terminal', category: 'productive' as const, title: 'Terminal' },
      { name: 'Photoshop', category: 'productive' as const, title: 'Adobe Photoshop' },
    ];

    const randomApp = applications[Math.floor(Math.random() * applications.length)];
    
    return {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'application',
      category: randomApp.category,
      application: randomApp.name,
      title: randomApp.title,
      duration: Math.floor(Math.random() * 600) + 60, // 1-11 minutes
      userId: 'current-user'
    };
  }

  private async mockSystemActivity(): Promise<ExternalActivity | null> {
    const activities = [
      { type: 'idle', category: 'break' as const, title: 'System Idle' },
      { type: 'active', category: 'neutral' as const, title: 'System Active' },
      { type: 'locked', category: 'break' as const, title: 'System Locked' },
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    return {
      id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'system',
      category: randomActivity.category,
      title: randomActivity.title,
      duration: Math.floor(Math.random() * 180) + 30, // 30 seconds - 3 minutes
      userId: 'current-user'
    };
  }

  // Activity Management with better error handling
  public addActivity(activity: ExternalActivity): void {
    try {
      this.activities.push(activity);
      this.saveActivities();
    } catch (error) {
      console.error('Failed to add activity:', error);
    }
  }

  public getActivities(timeRange?: { start: Date; end: Date }): ExternalActivity[] {
    try {
      let filtered = [...this.activities];
      
      if (timeRange) {
        filtered = filtered.filter(activity => 
          activity.timestamp >= timeRange.start && activity.timestamp <= timeRange.end
        );
      }
      
      return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get activities:', error);
      return [];
    }
  }

  public getActivitySummary(timeRange?: { start: Date; end: Date }): {
    totalTime: number;
    productiveTime: number;
    distractingTime: number;
    neutralTime: number;
    breakTime: number;
    topApplications: Array<{ name: string; time: number; category: string }>;
    topWebsites: Array<{ name: string; time: number; category: string }>;
  } {
    try {
      const activities = this.getActivities(timeRange);
      
      const summary = {
        totalTime: 0,
        productiveTime: 0,
        distractingTime: 0,
        neutralTime: 0,
        breakTime: 0,
        topApplications: [] as Array<{ name: string; time: number; category: string }>,
        topWebsites: [] as Array<{ name: string; time: number; category: string }>
      };

      const appTimes = new Map<string, { time: number; category: string }>();
      const websiteTimes = new Map<string, { time: number; category: string }>();

      activities.forEach(activity => {
        summary.totalTime += activity.duration;
        
        switch (activity.category) {
          case 'productive':
            summary.productiveTime += activity.duration;
            break;
          case 'distracting':
            summary.distractingTime += activity.duration;
            break;
          case 'neutral':
            summary.neutralTime += activity.duration;
            break;
          case 'break':
            summary.breakTime += activity.duration;
            break;
        }

        // Track applications
        if (activity.application) {
          const current = appTimes.get(activity.application) || { time: 0, category: activity.category };
          appTimes.set(activity.application, {
            time: current.time + activity.duration,
            category: activity.category
          });
        }

        // Track websites
        if (activity.website) {
          const current = websiteTimes.get(activity.website) || { time: 0, category: activity.category };
          websiteTimes.set(activity.website, {
            time: current.time + activity.duration,
            category: activity.category
          });
        }
      });

      // Convert to sorted arrays
      summary.topApplications = Array.from(appTimes.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 10);

      summary.topWebsites = Array.from(websiteTimes.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.time - a.time)
        .slice(0, 10);

      return summary;
    } catch (error) {
      console.error('Failed to get activity summary:', error);
      return {
        totalTime: 0,
        productiveTime: 0,
        distractingTime: 0,
        neutralTime: 0,
        breakTime: 0,
        topApplications: [],
        topWebsites: []
      };
    }
  }

  // Productivity Scoring with better error handling
  public calculateProductivityMetrics(timeRange?: { start: Date; end: Date }): ProductivityMetrics {
    try {
      const summary = this.getActivitySummary(timeRange);
      const activities = this.getActivities(timeRange);
      
      // Focus Score (based on session lengths and interruptions)
      const focusScore = this.calculateFocusScore(activities);
      
      // Productivity Score (based on productive vs distracting time)
      const productivityScore = summary.totalTime > 0 
        ? Math.round((summary.productiveTime / summary.totalTime) * 100)
        : 0;
      
      // Time Management Score (based on work patterns)
      const timeManagementScore = this.calculateTimeManagementScore(activities);
      
      // Consistency Score (based on regular work patterns)
      const consistencyScore = this.calculateConsistencyScore(activities);
      
      // Overall Score (weighted average)
      const overallScore = Math.round(
        (focusScore * 0.3) + 
        (productivityScore * 0.3) + 
        (timeManagementScore * 0.2) + 
        (consistencyScore * 0.2)
      );

      return {
        focusScore,
        productivityScore,
        timeManagementScore,
        consistencyScore,
        overallScore,
        calculatedAt: new Date(),
        period: 'daily'
      };
    } catch (error) {
      console.error('Failed to calculate productivity metrics:', error);
      return {
        focusScore: 0,
        productivityScore: 0,
        timeManagementScore: 0,
        consistencyScore: 0,
        overallScore: 0,
        calculatedAt: new Date(),
        period: 'daily'
      };
    }
  }

  private calculateFocusScore(activities: ExternalActivity[]): number {
    if (activities.length === 0) return 0;
    
    const productiveActivities = activities.filter(a => a.category === 'productive');
    const avgSessionLength = productiveActivities.length > 0
      ? productiveActivities.reduce((sum, a) => sum + a.duration, 0) / productiveActivities.length
      : 0;
    
    // Score based on average session length (longer sessions = better focus)
    return Math.min(100, Math.round((avgSessionLength / 1800) * 100)); // 30 minutes = 100%
  }

  private calculateTimeManagementScore(activities: ExternalActivity[]): number {
    if (activities.length === 0) return 0;
    
    const totalTime = activities.reduce((sum, a) => sum + a.duration, 0);
    const productiveTime = activities
      .filter(a => a.category === 'productive')
      .reduce((sum, a) => sum + a.duration, 0);
    
    return totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
  }

  private calculateConsistencyScore(activities: ExternalActivity[]): number {
    if (activities.length === 0) return 0;
    
    // Group activities by hour to check consistency
    const hourlyActivity = new Map<number, number>();
    
    activities.forEach(activity => {
      const hour = activity.timestamp.getHours();
      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + activity.duration);
    });
    
    // Score based on how evenly distributed the work is
    const hours = Array.from(hourlyActivity.values());
    if (hours.length === 0) return 0;
    
    const avgHourlyTime = hours.reduce((sum, time) => sum + time, 0) / hours.length;
    const variance = hours.reduce((sum, time) => sum + Math.pow(time - avgHourlyTime, 2), 0) / hours.length;
    
    // Lower variance = higher consistency
    return Math.max(0, Math.min(100, 100 - Math.round(variance / 1000)));
  }

  // Data Persistence with better error handling
  private loadPermissions(): MonitoringPermissions {
    try {
      const saved = localStorage.getItem('taskdefender_monitoring_permissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        };
      }
    } catch (error) {
      console.error('Failed to load monitoring permissions:', error);
    }
    
    return {
      browserTracking: false,
      applicationTracking: false,
      calendarIntegration: false,
      communicationAnalysis: false,
      systemMonitoring: false,
      lastUpdated: new Date()
    };
  }

  private savePermissions(): void {
    try {
      localStorage.setItem('taskdefender_monitoring_permissions', JSON.stringify(this.permissions));
    } catch (error) {
      console.error('Failed to save monitoring permissions:', error);
    }
  }

  private loadActivities(): void {
    try {
      const saved = localStorage.getItem('taskdefender_monitoring_activities');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.activities = parsed.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load monitoring activities:', error);
      this.activities = [];
    }
  }

  private saveActivities(): void {
    try {
      // Keep only last 7 days of data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivities = this.activities.filter(
        activity => activity.timestamp >= sevenDaysAgo
      );
      
      localStorage.setItem('taskdefender_monitoring_activities', JSON.stringify(recentActivities));
    } catch (error) {
      console.error('Failed to save monitoring activities:', error);
    }
  }

  // Cleanup
  public destroy(): void {
    this.stopMonitoring();
    this.permissionChangeCallbacks = [];
  }
}

export const monitoringService = new MonitoringService();