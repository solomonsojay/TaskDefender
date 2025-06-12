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

export class ExternalMonitoringService {
  private permissions: Map<string, MonitoringPermission> = new Map();
  private activityData: ActivityData[] = [];
  private isMonitoring: boolean = false;

  constructor() {
    this.loadPermissions();
  }

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
      }
    ];

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  public setPermission(permissionId: string, enabled: boolean): boolean {
    const permission = this.permissions.get(permissionId);
    if (!permission) return false;

    permission.isEnabled = enabled;
    return true;
  }

  public getPermissions(): MonitoringPermission[] {
    return Array.from(this.permissions.values());
  }

  public getEnabledPermissions(): MonitoringPermission[] {
    return Array.from(this.permissions.values()).filter(p => p.isEnabled);
  }
}

export const externalMonitoringService = new ExternalMonitoringService();