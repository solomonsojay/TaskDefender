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

  constructor() {
    this.permissions = this.loadPermissions();
    this.loadActivities();
  }

  // Permission Management
  public updatePermissions(newPermissions: Partial<MonitoringPermissions>): void {
    this.permissions = {
      ...this.permissions,
      ...newPermissions,
      lastUpdated: new Date()
    };
    this.savePermissions();
    
    if (this.hasAnyPermission()) {
      this.startMonitoring();
    } else {
      this.stopMonitoring();
    }
  }

  public getPermissions(): MonitoringPermissions {
    return { ...this.permissions };
  }

  private hasAnyPermission(): boolean {
    return Object.values(this.permissions).some(permission => 
      typeof permission === 'boolean' && permission
    );
  }

  // Monitoring Control
  public startMonitoring(): void {
    if (this.isMonitoring || !this.hasAnyPermission()) return;
    
    this.isMonitoring = true;
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

  // Data Collection (Mock implementations for demo)
  private async collectActivityData(): Promise<void> {
    const now = new Date();
    const activities: ExternalActivity[] = [];

    // Browser Activity (Mock)
    if (this.permissions.browserTracking) {
      const browserActivity = await this.mockBrowserActivity();
      if (browserActivity) activities.push(browserActivity);
    }

    // Application Activity (Mock)
    if (this.permissions.applicationTracking) {
      const appActivity = await this.mockApplicationActivity();
      if (appActivity) activities.push(appActivity);
    }

    // System Activity (Mock)
    if (this.permissions.systemMonitoring) {
      const systemActivity = await this.mockSystemActivity();
      if (systemActivity) activities.push(systemActivity);
    }

    // Store activities
    activities.forEach(activity => this.addActivity(activity));
  }

  // Mock Data Generators (Replace with real implementations)
  private async mockBrowserActivity(): Promise<ExternalActivity | null> {
    const websites = [
      { url: 'github.com', category: 'productive' as const, title: 'GitHub - Code Repository' },
      { url: 'stackoverflow.com', category: 'productive' as const, title: 'Stack Overflow - Programming Q&A' },
      { url: 'youtube.com', category: 'distracting' as const, title: 'YouTube - Video Platform' },
      { url: 'twitter.com', category: 'distracting' as const, title: 'Twitter - Social Media' },
      { url: 'docs.google.com', category: 'productive' as const, title: 'Google Docs - Document' },
    ];

    const randomSite = websites[Math.floor(Math.random() * websites.length)];
    
    return {
      id: `browser_${Date.now()}`,
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
    ];

    const randomApp = applications[Math.floor(Math.random() * applications.length)];
    
    return {
      id: `app_${Date.now()}`,
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
    ];

    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    return {
      id: `system_${Date.now()}`,
      timestamp: new Date(),
      type: 'system',
      category: randomActivity.category,
      title: randomActivity.title,
      duration: Math.floor(Math.random() * 180) + 30, // 30 seconds - 3 minutes
      userId: 'current-user'
    };
  }

  // Activity Management
  public addActivity(activity: ExternalActivity): void {
    this.activities.push(activity);
    this.saveActivities();
  }

  public getActivities(timeRange?: { start: Date; end: Date }): ExternalActivity[] {
    let filtered = [...this.activities];
    
    if (timeRange) {
      filtered = filtered.filter(activity => 
        activity.timestamp >= timeRange.start && activity.timestamp <= timeRange.end
      );
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
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
  }

  // Productivity Scoring
  public calculateProductivityMetrics(timeRange?: { start: Date; end: Date }): ProductivityMetrics {
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
    const avgHourlyTime = hours.reduce((sum, time) => sum + time, 0) / hours.length;
    const variance = hours.reduce((sum, time) => sum + Math.pow(time - avgHourlyTime, 2), 0) / hours.length;
    
    // Lower variance = higher consistency
    return Math.max(0, Math.min(100, 100 - Math.round(variance / 1000)));
  }

  // Data Persistence
  private loadPermissions(): MonitoringPermissions {
    const saved = localStorage.getItem('taskdefender_monitoring_permissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        };
      } catch (error) {
        console.error('Failed to load monitoring permissions:', error);
      }
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
    localStorage.setItem('taskdefender_monitoring_permissions', JSON.stringify(this.permissions));
  }

  private loadActivities(): void {
    const saved = localStorage.getItem('taskdefender_monitoring_activities');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.activities = parsed.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
      } catch (error) {
        console.error('Failed to load monitoring activities:', error);
      }
    }
  }

  private saveActivities(): void {
    // Keep only last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivities = this.activities.filter(
      activity => activity.timestamp >= sevenDaysAgo
    );
    
    localStorage.setItem('taskdefender_monitoring_activities', JSON.stringify(recentActivities));
  }

  // Cleanup
  public destroy(): void {
    this.stopMonitoring();
  }
}

export const monitoringService = new MonitoringService();