export class FocusTrackingService {
  private static instance: FocusTrackingService;
  private isTracking = false;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private totalPausedTime: number = 0;
  private distractionCount: number = 0;
  private currentSessionId: string | null = null;
  private visibilityChangeHandler: () => void;
  private beforeUnloadHandler: () => void;

  private constructor() {
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
    this.beforeUnloadHandler = this.handleBeforeUnload.bind(this);
  }

  static getInstance(): FocusTrackingService {
    if (!FocusTrackingService.instance) {
      FocusTrackingService.instance = new FocusTrackingService();
    }
    return FocusTrackingService.instance;
  }

  startTracking(sessionId: string) {
    this.currentSessionId = sessionId;
    this.isTracking = true;
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.totalPausedTime = 0;
    this.distractionCount = 0;

    // Add event listeners
    document.addEventListener('visibilitychange', this.visibilityChangeHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    window.addEventListener('focus', this.handleWindowFocus.bind(this));

    console.log('🎯 Focus tracking started for session:', sessionId);
  }

  stopTracking(): { 
    duration: number; 
    distractions: number; 
    focusTime: number; 
    distractionTime: number;
  } {
    if (!this.isTracking) {
      return { duration: 0, distractions: 0, focusTime: 0, distractionTime: 0 };
    }

    // If currently paused, add the current pause time
    if (this.pausedTime > 0) {
      this.totalPausedTime += Date.now() - this.pausedTime;
    }

    const totalDuration = Date.now() - this.startTime;
    const focusTime = totalDuration - this.totalPausedTime;
    const distractionTime = this.totalPausedTime;

    // Remove event listeners
    document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.removeEventListener('blur', this.handleWindowBlur.bind(this));
    window.removeEventListener('focus', this.handleWindowFocus.bind(this));

    // Save session data
    this.saveFocusSession({
      sessionId: this.currentSessionId!,
      totalDuration,
      focusTime,
      distractionTime,
      distractionCount: this.distractionCount,
      endTime: new Date()
    });

    this.isTracking = false;
    this.currentSessionId = null;

    console.log('🎯 Focus tracking stopped:', {
      duration: totalDuration,
      focusTime,
      distractionTime,
      distractions: this.distractionCount
    });

    return {
      duration: Math.round(totalDuration / 1000), // Convert to seconds
      distractions: this.distractionCount,
      focusTime: Math.round(focusTime / 1000),
      distractionTime: Math.round(distractionTime / 1000)
    };
  }

  private handleVisibilityChange() {
    if (!this.isTracking) return;

    if (document.hidden) {
      // Page became hidden - start pause timer
      this.pausedTime = Date.now();
      this.distractionCount++;
      console.log('📱 Distraction detected: Page hidden');
    } else {
      // Page became visible - end pause timer
      if (this.pausedTime > 0) {
        this.totalPausedTime += Date.now() - this.pausedTime;
        this.pausedTime = 0;
        console.log('🎯 Focus resumed: Page visible');
      }
    }
  }

  private handleWindowBlur() {
    if (!this.isTracking || document.hidden) return;

    // Window lost focus but page is still visible
    this.pausedTime = Date.now();
    this.distractionCount++;
    console.log('📱 Distraction detected: Window blur');
  }

  private handleWindowFocus() {
    if (!this.isTracking) return;

    // Window regained focus
    if (this.pausedTime > 0) {
      this.totalPausedTime += Date.now() - this.pausedTime;
      this.pausedTime = 0;
      console.log('🎯 Focus resumed: Window focus');
    }
  }

  private handleBeforeUnload() {
    if (this.isTracking) {
      // Save current session state before page unload
      this.stopTracking();
    }
  }

  private saveFocusSession(sessionData: any) {
    const sessions = this.getFocusSessions();
    sessions.push(sessionData);
    
    // Keep only last 100 sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    localStorage.setItem('taskdefender_focus_sessions', JSON.stringify(sessions));
  }

  private getFocusSessions(): any[] {
    const saved = localStorage.getItem('taskdefender_focus_sessions');
    if (!saved) return [];
    
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Failed to load focus sessions:', error);
      return [];
    }
  }

  getCurrentStats() {
    if (!this.isTracking) {
      return { duration: 0, distractions: 0, focusTime: 0, isPaused: false };
    }

    const currentTime = Date.now();
    const totalDuration = currentTime - this.startTime;
    const currentPauseTime = this.pausedTime > 0 ? currentTime - this.pausedTime : 0;
    const totalPausedTime = this.totalPausedTime + currentPauseTime;
    const focusTime = totalDuration - totalPausedTime;

    return {
      duration: Math.round(totalDuration / 1000),
      distractions: this.distractionCount,
      focusTime: Math.round(focusTime / 1000),
      isPaused: this.pausedTime > 0
    };
  }

  getFocusAnalytics() {
    const sessions = this.getFocusSessions();
    const last30Days = sessions.filter((session: any) => 
      new Date(session.endTime) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const totalFocusTime = last30Days.reduce((sum: number, session: any) => sum + session.focusTime, 0);
    const totalDistractions = last30Days.reduce((sum: number, session: any) => sum + session.distractionCount, 0);
    const averageFocusRatio = last30Days.length > 0 ? 
      last30Days.reduce((sum: number, session: any) => 
        sum + (session.focusTime / session.totalDuration), 0) / last30Days.length : 0;

    return {
      totalSessions: last30Days.length,
      totalFocusTime: Math.round(totalFocusTime / 1000 / 60), // Convert to minutes
      totalDistractions,
      averageFocusRatio: Math.round(averageFocusRatio * 100),
      averageSessionLength: last30Days.length > 0 ? 
        Math.round(last30Days.reduce((sum: number, session: any) => 
          sum + session.totalDuration, 0) / last30Days.length / 1000 / 60) : 0
    };
  }
}

export const focusTrackingService = FocusTrackingService.getInstance();