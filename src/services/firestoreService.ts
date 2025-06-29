import { Task, Team, FocusSession } from '../types';
import { generateSecureId, validateTaskData } from '../utils/validation';

export class FirestoreService {
  // Tasks
  static async createTask(userId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>): Promise<Task> {
    try {
      const task: Task = {
        ...taskData,
        id: generateSecureId(),
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Validate task data
      const validation = validateTaskData(task);
      if (!validation.isValid) {
        throw new Error(`Invalid task data: ${validation.errors.join(', ')}`);
      }

      // Save to localStorage
      this.saveTaskToLocal(userId, task);
      
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  static async updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      // Update in localStorage
      this.updateTaskInLocal(userId, taskId, updatedData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(userId: string, taskId: string): Promise<void> {
    try {
      // Delete from localStorage
      this.deleteTaskFromLocal(userId, taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  static async getUserTasks(userId: string): Promise<Task[]> {
    try {
      // Get from localStorage
      return this.getTasksFromLocal(userId);
    } catch (error) {
      console.error('Error getting user tasks:', error);
      return [];
    }
  }

  // Teams
  static async createTeam(teamData: Omit<Team, 'id' | 'createdAt'>): Promise<Team> {
    try {
      const team: Team = {
        ...teamData,
        id: generateSecureId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to localStorage
      const teams = this.getTeamsFromLocal();
      teams.push(team);
      localStorage.setItem('taskdefender_teams', JSON.stringify(teams));
      
      // Also save to all teams for discovery
      const allTeams = JSON.parse(localStorage.getItem('taskdefender_all_teams') || '[]');
      allTeams.push(team);
      localStorage.setItem('taskdefender_all_teams', JSON.stringify(allTeams));

      return team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  static async getUserTeams(userId: string): Promise<Team[]> {
    try {
      // Get from localStorage
      return this.getTeamsFromLocal().filter(team => 
        team.members.some(member => member.userId === userId)
      );
    } catch (error) {
      console.error('Error getting user teams:', error);
      return [];
    }
  }

  // Focus Sessions
  static async createFocusSession(sessionData: FocusSession): Promise<FocusSession> {
    try {
      // Save to localStorage
      const sessions = this.getFocusSessionsFromLocal();
      sessions.push(sessionData);
      localStorage.setItem('taskdefender_focus_sessions', JSON.stringify(sessions));

      return sessionData;
    } catch (error) {
      console.error('Error creating focus session:', error);
      throw error;
    }
  }

  // Local storage helpers
  private static saveTaskToLocal(userId: string, task: Task): void {
    try {
      const tasks = this.getTasksFromLocal(userId);
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        tasks[existingIndex] = task;
      } else {
        tasks.push(task);
      }
      
      localStorage.setItem(`taskdefender_tasks_${userId}`, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving task to localStorage:', error);
    }
  }

  private static updateTaskInLocal(userId: string, taskId: string, updates: Partial<Task>): void {
    try {
      const tasks = this.getTasksFromLocal(userId);
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex >= 0) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        localStorage.setItem(`taskdefender_tasks_${userId}`, JSON.stringify(tasks));
      }
    } catch (error) {
      console.error('Error updating task in localStorage:', error);
    }
  }

  private static deleteTaskFromLocal(userId: string, taskId: string): void {
    try {
      const tasks = this.getTasksFromLocal(userId);
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem(`taskdefender_tasks_${userId}`, JSON.stringify(filteredTasks));
    } catch (error) {
      console.error('Error deleting task from localStorage:', error);
    }
  }

  private static getTasksFromLocal(userId: string): Task[] {
    try {
      const saved = localStorage.getItem(`taskdefender_tasks_${userId}`);
      if (!saved) return [];
      
      return JSON.parse(saved).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  private static getTeamsFromLocal(): Team[] {
    try {
      const saved = localStorage.getItem('taskdefender_teams');
      if (!saved) return [];
      
      return JSON.parse(saved).map((team: any) => ({
        ...team,
        createdAt: new Date(team.createdAt),
        updatedAt: team.updatedAt ? new Date(team.updatedAt) : undefined,
        members: team.members.map((member: any) => ({
          ...member,
          joinedAt: new Date(member.joinedAt)
        }))
      }));
    } catch (error) {
      console.error('Error loading teams from localStorage:', error);
      return [];
    }
  }

  private static getFocusSessionsFromLocal(): FocusSession[] {
    try {
      const saved = localStorage.getItem('taskdefender_focus_sessions');
      if (!saved) return [];
      
      return JSON.parse(saved).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: session.updatedAt ? new Date(session.updatedAt) : undefined,
        startTime: session.startTime ? new Date(session.startTime) : undefined,
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }));
    } catch (error) {
      console.error('Error loading focus sessions from localStorage:', error);
      return [];
    }
  }

  // Batch operations
  static async batchUpdateTasks(userId: string, updates: Array<{ id: string; data: Partial<Task> }>): Promise<void> {
    try {
      // Update localStorage
      updates.forEach(({ id, data }) => {
        this.updateTaskInLocal(userId, id, data);
      });
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }
}