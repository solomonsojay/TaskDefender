import { Task } from '../types';
import { monitoringService, ExternalActivity, ProductivityMetrics } from './MonitoringService';
import { workPatternAnalyzer, TaskAnalysis } from './WorkPatternAnalyzer';

export interface PredictiveInsight {
  id: string;
  type: 'productivity_dip' | 'deadline_risk' | 'optimal_timing' | 'break_recommendation' | 'focus_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  confidence: number; // 0-100
  timeframe: string;
  relatedTaskIds?: string[];
  createdAt: Date;
}

export interface ContextualState {
  currentActivity: 'productive' | 'neutral' | 'distracting' | 'idle';
  focusLevel: number; // 0-100
  energyLevel: number; // 0-100 (estimated)
  distractionRisk: number; // 0-100
  optimalTaskType: 'creative' | 'analytical' | 'administrative' | 'communication';
  recommendedBreakIn: number; // minutes
  lastBreak: Date | null;
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'task_scheduling' | 'break_timing' | 'focus_enhancement' | 'productivity_boost';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number; // 0-100
  timeToImplement: number; // minutes
  validUntil: Date;
}

export class EnhancedAIAnalyzer {
  private insights: PredictiveInsight[] = [];
  private recommendations: PersonalizedRecommendation[] = [];
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadStoredData();
    this.startContinuousAnalysis();
  }

  // Continuous Analysis
  public startContinuousAnalysis(): void {
    if (this.analysisInterval) return;
    
    this.analysisInterval = setInterval(() => {
      this.performAnalysis();
    }, 5 * 60 * 1000); // Analyze every 5 minutes
    
    console.log('🧠 Enhanced AI Analysis started');
  }

  public stopContinuousAnalysis(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  // Main Analysis Engine
  private async performAnalysis(): Promise<void> {
    try {
      // Get current context
      const context = await this.getCurrentContext();
      
      // Generate insights
      const newInsights = await this.generatePredictiveInsights(context);
      this.insights.push(...newInsights);
      
      // Generate recommendations
      const newRecommendations = await this.generatePersonalizedRecommendations(context);
      this.recommendations.push(...newRecommendations);
      
      // Cleanup old data
      this.cleanupOldData();
      
      // Save to storage
      this.saveData();
      
    } catch (error) {
      console.error('Analysis error:', error);
    }
  }

  // Context Analysis
  public async getCurrentContext(): Promise<ContextualState> {
    const now = new Date();
    const last30Minutes = new Date(now.getTime() - 30 * 60 * 1000);
    
    // Get recent activities
    const recentActivities = monitoringService.getActivities({
      start: last30Minutes,
      end: now
    });

    // Determine current activity
    const currentActivity = this.determineCurrentActivity(recentActivities);
    
    // Calculate focus level
    const focusLevel = this.calculateCurrentFocusLevel(recentActivities);
    
    // Estimate energy level (based on time of day and activity patterns)
    const energyLevel = this.estimateEnergyLevel(now, recentActivities);
    
    // Calculate distraction risk
    const distractionRisk = this.calculateDistractionRisk(recentActivities);
    
    // Determine optimal task type
    const optimalTaskType = this.determineOptimalTaskType(now, recentActivities);
    
    // Calculate recommended break timing
    const { recommendedBreakIn, lastBreak } = this.calculateBreakTiming(recentActivities);

    return {
      currentActivity,
      focusLevel,
      energyLevel,
      distractionRisk,
      optimalTaskType,
      recommendedBreakIn,
      lastBreak
    };
  }

  private determineCurrentActivity(activities: ExternalActivity[]): 'productive' | 'neutral' | 'distracting' | 'idle' {
    if (activities.length === 0) return 'idle';
    
    const recent = activities[0]; // Most recent activity
    return recent.category === 'break' ? 'idle' : recent.category;
  }

  private calculateCurrentFocusLevel(activities: ExternalActivity[]): number {
    if (activities.length === 0) return 50;
    
    const productiveTime = activities
      .filter(a => a.category === 'productive')
      .reduce((sum, a) => sum + a.duration, 0);
    
    const totalTime = activities.reduce((sum, a) => sum + a.duration, 0);
    
    return totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 50;
  }

  private estimateEnergyLevel(now: Date, activities: ExternalActivity[]): number {
    const hour = now.getHours();
    
    // Base energy on time of day (circadian rhythm)
    let baseEnergy = 50;
    if (hour >= 9 && hour <= 11) baseEnergy = 80; // Morning peak
    else if (hour >= 14 && hour <= 16) baseEnergy = 70; // Afternoon peak
    else if (hour >= 20 || hour <= 6) baseEnergy = 30; // Low energy times
    
    // Adjust based on recent activity
    const recentProductiveTime = activities
      .filter(a => a.category === 'productive')
      .reduce((sum, a) => sum + a.duration, 0);
    
    // Fatigue factor (more work = lower energy)
    const fatigueFactor = Math.max(0, 100 - (recentProductiveTime / 60)); // 1 hour = -1 energy
    
    return Math.max(10, Math.min(100, Math.round(baseEnergy * (fatigueFactor / 100))));
  }

  private calculateDistractionRisk(activities: ExternalActivity[]): number {
    const distractingTime = activities
      .filter(a => a.category === 'distracting')
      .reduce((sum, a) => sum + a.duration, 0);
    
    const totalTime = activities.reduce((sum, a) => sum + a.duration, 0);
    
    if (totalTime === 0) return 30; // Default moderate risk
    
    const distractionRatio = distractingTime / totalTime;
    return Math.round(distractionRatio * 100);
  }

  private determineOptimalTaskType(now: Date, activities: ExternalActivity[]): 'creative' | 'analytical' | 'administrative' | 'communication' {
    const hour = now.getHours();
    
    // Time-based recommendations
    if (hour >= 9 && hour <= 11) return 'creative'; // Morning creativity
    if (hour >= 14 && hour <= 16) return 'analytical'; // Afternoon analysis
    if (hour >= 11 && hour <= 13) return 'communication'; // Pre-lunch communication
    return 'administrative'; // Default for other times
  }

  private calculateBreakTiming(activities: ExternalActivity[]): { recommendedBreakIn: number; lastBreak: Date | null } {
    const breakActivities = activities.filter(a => a.category === 'break');
    const lastBreak = breakActivities.length > 0 ? breakActivities[0].timestamp : null;
    
    const productiveActivities = activities.filter(a => a.category === 'productive');
    const continuousWorkTime = productiveActivities.reduce((sum, a) => sum + a.duration, 0);
    
    // Recommend break after 45-60 minutes of continuous work
    const recommendedBreakIn = Math.max(0, 45 * 60 - continuousWorkTime); // seconds
    
    return {
      recommendedBreakIn: Math.round(recommendedBreakIn / 60), // convert to minutes
      lastBreak
    };
  }

  // Predictive Insights Generation
  private async generatePredictiveInsights(context: ContextualState): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = [];
    const now = new Date();

    // Productivity Dip Prediction
    if (context.energyLevel < 40 && context.focusLevel < 50) {
      insights.push({
        id: `productivity_dip_${Date.now()}`,
        type: 'productivity_dip',
        severity: 'medium',
        title: 'Productivity Dip Detected',
        description: 'Your energy and focus levels are declining. Consider taking a break or switching to lighter tasks.',
        recommendation: 'Take a 10-15 minute break or switch to administrative tasks.',
        confidence: 75,
        timeframe: 'Next 30 minutes',
        createdAt: now
      });
    }

    // Break Recommendation
    if (context.recommendedBreakIn <= 5) {
      insights.push({
        id: `break_rec_${Date.now()}`,
        type: 'break_recommendation',
        severity: 'low',
        title: 'Break Time Approaching',
        description: 'You\'ve been working continuously. A short break will help maintain your productivity.',
        recommendation: 'Take a 5-10 minute break to recharge.',
        confidence: 85,
        timeframe: 'Now',
        createdAt: now
      });
    }

    // Focus Opportunity
    if (context.energyLevel > 70 && context.distractionRisk < 30) {
      insights.push({
        id: `focus_opp_${Date.now()}`,
        type: 'focus_opportunity',
        severity: 'low',
        title: 'Optimal Focus Window',
        description: 'Your energy is high and distraction risk is low. Perfect time for deep work.',
        recommendation: `Focus on ${context.optimalTaskType} tasks for maximum productivity.`,
        confidence: 90,
        timeframe: 'Next 60 minutes',
        createdAt: now
      });
    }

    return insights;
  }

  // Personalized Recommendations
  private async generatePersonalizedRecommendations(context: ContextualState): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    const now = new Date();

    // Task Scheduling Recommendation
    if (context.energyLevel > 60) {
      recommendations.push({
        id: `task_sched_${Date.now()}`,
        type: 'task_scheduling',
        priority: 'medium',
        title: 'Optimize Your Task Schedule',
        description: 'Based on your current energy level, now is a great time for challenging tasks.',
        actionItems: [
          `Work on ${context.optimalTaskType} tasks`,
          'Tackle your most important task first',
          'Set a 45-minute focus timer'
        ],
        estimatedImpact: 80,
        timeToImplement: 2,
        validUntil: new Date(now.getTime() + 60 * 60 * 1000) // 1 hour
      });
    }

    // Focus Enhancement
    if (context.distractionRisk > 50) {
      recommendations.push({
        id: `focus_enh_${Date.now()}`,
        type: 'focus_enhancement',
        priority: 'high',
        title: 'Reduce Distractions',
        description: 'High distraction risk detected. Take steps to improve your focus environment.',
        actionItems: [
          'Close unnecessary browser tabs',
          'Put phone in another room',
          'Use website blocker for social media',
          'Enable focus mode'
        ],
        estimatedImpact: 70,
        timeToImplement: 5,
        validUntil: new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours
      });
    }

    return recommendations;
  }

  // Public API Methods
  public getLatestInsights(limit: number = 10): PredictiveInsight[] {
    return this.insights
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  public getActiveRecommendations(): PersonalizedRecommendation[] {
    const now = new Date();
    return this.recommendations
      .filter(rec => rec.validUntil > now)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  public getProductivityTrends(days: number = 7): {
    daily: Array<{ date: string; score: number; focusTime: number; productiveTime: number }>;
    weekly: { averageScore: number; trend: 'improving' | 'declining' | 'stable' };
  } {
    const trends = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const metrics = monitoringService.calculateProductivityMetrics({
        start: date,
        end: endDate
      });
      
      const summary = monitoringService.getActivitySummary({
        start: date,
        end: endDate
      });
      
      trends.push({
        date: date.toISOString().split('T')[0],
        score: metrics.overallScore,
        focusTime: Math.round(summary.productiveTime / 60), // minutes
        productiveTime: Math.round(summary.productiveTime / 60)
      });
    }
    
    // Calculate trend
    const scores = trends.map(t => t.score);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (secondAvg > firstAvg + 5) trend = 'improving';
    else if (secondAvg < firstAvg - 5) trend = 'declining';
    
    return {
      daily: trends,
      weekly: {
        averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
        trend
      }
    };
  }

  // Data Management
  private cleanupOldData(): void {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    this.insights = this.insights.filter(insight => insight.createdAt >= threeDaysAgo);
    
    const now = new Date();
    this.recommendations = this.recommendations.filter(rec => rec.validUntil >= now);
  }

  private loadStoredData(): void {
    try {
      const savedInsights = localStorage.getItem('taskdefender_ai_insights');
      if (savedInsights) {
        this.insights = JSON.parse(savedInsights).map((insight: any) => ({
          ...insight,
          createdAt: new Date(insight.createdAt)
        }));
      }

      const savedRecommendations = localStorage.getItem('taskdefender_ai_recommendations');
      if (savedRecommendations) {
        this.recommendations = JSON.parse(savedRecommendations).map((rec: any) => ({
          ...rec,
          validUntil: new Date(rec.validUntil)
        }));
      }
    } catch (error) {
      console.error('Failed to load AI data:', error);
    }
  }

  private saveData(): void {
    localStorage.setItem('taskdefender_ai_insights', JSON.stringify(this.insights));
    localStorage.setItem('taskdefender_ai_recommendations', JSON.stringify(this.recommendations));
  }

  public destroy(): void {
    this.stopContinuousAnalysis();
  }
}

export const enhancedAIAnalyzer = new EnhancedAIAnalyzer();