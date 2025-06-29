import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  arrayContains
} from 'firebase/firestore';
import { db, checkFirebaseAvailability } from '../config/firebase';
import { Task, Team, FocusSession, User } from '../types';
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

      if (checkFirebaseAvailability() && db) {
        // Save to Firestore
        const docRef = await addDoc(collection(db, 'tasks'), {
          ...task,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          completedAt: task.completedAt ? task.completedAt.toISOString() : null
        });
        
        task.id = docRef.id;
        console.log('✅ Task created in Firestore:', task.id);
      }

      // Also save to localStorage as backup
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

      if (checkFirebaseAvailability() && db) {
        // Update in Firestore
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          ...updatedData,
          updatedAt: serverTimestamp(),
          dueDate: updatedData.dueDate ? updatedData.dueDate.toISOString() : null,
          completedAt: updatedData.completedAt ? updatedData.completedAt.toISOString() : null
        });
        
        console.log('✅ Task updated in Firestore:', taskId);
      }

      // Also update in localStorage
      this.updateTaskInLocal(userId, taskId, updatedData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(userId: string, taskId: string): Promise<void> {
    try {
      if (checkFirebaseAvailability() && db) {
        // Delete from Firestore
        await deleteDoc(doc(db, 'tasks', taskId));
        console.log('✅ Task deleted from Firestore:', taskId);
      }

      // Also delete from localStorage
      this.deleteTaskFromLocal(userId, taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  static async getUserTasks(userId: string): Promise<Task[]> {
    try {
      if (checkFirebaseAvailability() && db) {
        // Get from Firestore
        const tasksRef = collection(db, 'tasks');
        const q = query(
          tasksRef, 
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const tasks: Task[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            completedAt: data.completedAt ? new Date(data.completedAt) : undefined
          } as Task);
        });
        
        // Also save to localStorage as backup
        localStorage.setItem(`taskdefender_tasks_${userId}`, JSON.stringify(tasks));
        
        console.log('✅ Tasks loaded from Firestore:', tasks.length);
        return tasks;
      }

      // Fallback to localStorage
      return this.getTasksFromLocal(userId);
    } catch (error) {
      console.error('Error getting user tasks:', error);
      // Fallback to localStorage on error
      return this.getTasksFromLocal(userId);
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

      if (checkFirebaseAvailability() && db) {
        // Save to Firestore
        const docRef = await addDoc(collection(db, 'teams'), {
          ...team,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          members: team.members.map(member => ({
            ...member,
            joinedAt: member.joinedAt.toISOString()
          }))
        });
        
        team.id = docRef.id;
        console.log('✅ Team created in Firestore:', team.id);
      }

      return team;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  static async getUserTeams(userId: string): Promise<Team[]> {
    try {
      if (checkFirebaseAvailability() && db) {
        // Get teams where user is a member
        const teamsRef = collection(db, 'teams');
        const q = query(
          teamsRef,
          where('members', 'array-contains', { userId: userId })
        );
        
        const querySnapshot = await getDocs(q);
        const teams: Team[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          teams.push({
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            members: data.members.map((member: any) => ({
              ...member,
              joinedAt: new Date(member.joinedAt)
            }))
          } as Team);
        });
        
        console.log('✅ Teams loaded from Firestore:', teams.length);
        return teams;
      }

      return [];
    } catch (error) {
      console.error('Error getting user teams:', error);
      return [];
    }
  }

  // Focus Sessions
  static async createFocusSession(sessionData: Omit<FocusSession, 'id' | 'createdAt'>): Promise<FocusSession> {
    try {
      const session: FocusSession = {
        ...sessionData,
        id: generateSecureId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (checkFirebaseAvailability() && db) {
        // Save to Firestore
        await addDoc(collection(db, 'focus_sessions'), {
          ...session,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          startTime: session.startTime ? session.startTime.toISOString() : null,
          endTime: session.endTime ? session.endTime.toISOString() : null
        });
        
        console.log('✅ Focus session created in Firestore:', session.id);
      }

      return session;
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

  // Batch operations
  static async batchUpdateTasks(userId: string, updates: Array<{ id: string; data: Partial<Task> }>): Promise<void> {
    try {
      if (checkFirebaseAvailability() && db) {
        const batch = writeBatch(db);
        
        updates.forEach(({ id, data }) => {
          const taskRef = doc(db, 'tasks', id);
          batch.update(taskRef, {
            ...data,
            updatedAt: serverTimestamp()
          });
        });
        
        await batch.commit();
        console.log('✅ Batch update completed in Firestore');
      }

      // Also update localStorage
      updates.forEach(({ id, data }) => {
        this.updateTaskInLocal(userId, id, data);
      });
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }
}