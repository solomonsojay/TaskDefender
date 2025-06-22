import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, Team, FocusSession } from '../types';

export class FirestoreService {
  // Tasks
  static async addTask(task: Omit<Task, 'id'>, userId: string) {
    try {
      const taskData = {
        ...task,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        completedAt: task.completedAt ? Timestamp.fromDate(task.completedAt) : null,
        expectedCompletionTime: task.expectedCompletionTime ? Timestamp.fromDate(task.expectedCompletionTime) : null,
        scheduledTime: task.scheduledTime ? Timestamp.fromDate(task.scheduledTime) : null
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      return docRef.id;
    } catch (error: any) {
      console.error('Add task error:', error);
      throw new Error('Failed to add task. Please try again.');
    }
  }
  
  static async updateTask(taskId: string, updates: Partial<Task>) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const updateData = { ...updates };
      
      // Convert dates to Timestamps
      if (updateData.dueDate) {
        updateData.dueDate = Timestamp.fromDate(updateData.dueDate) as any;
      }
      if (updateData.completedAt) {
        updateData.completedAt = Timestamp.fromDate(updateData.completedAt) as any;
      }
      if (updateData.expectedCompletionTime) {
        updateData.expectedCompletionTime = Timestamp.fromDate(updateData.expectedCompletionTime) as any;
      }
      if (updateData.scheduledTime) {
        updateData.scheduledTime = Timestamp.fromDate(updateData.scheduledTime) as any;
      }
      
      // Add update timestamp
      updateData.updatedAt = serverTimestamp() as any;
      
      await updateDoc(taskRef, updateData);
    } catch (error: any) {
      console.error('Update task error:', error);
      throw new Error('Failed to update task. Please try again.');
    }
  }
  
  static async deleteTask(taskId: string) {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error: any) {
      console.error('Delete task error:', error);
      throw new Error('Failed to delete task. Please try again.');
    }
  }
  
  static async getUserTasks(userId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, 'tasks'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || undefined,
          completedAt: data.completedAt?.toDate() || undefined,
          expectedCompletionTime: data.expectedCompletionTime?.toDate() || undefined,
          scheduledTime: data.scheduledTime?.toDate() || undefined
        } as Task;
      });
    } catch (error: any) {
      console.error('Get user tasks error:', error);
      throw new Error('Failed to load tasks. Please try again.');
    }
  }
  
  static subscribeToUserTasks(userId: string, callback: (tasks: Task[]) => void) {
    const q = query(
      collection(db, 'tasks'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const tasks = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            dueDate: data.dueDate?.toDate() || undefined,
            completedAt: data.completedAt?.toDate() || undefined,
            expectedCompletionTime: data.expectedCompletionTime?.toDate() || undefined,
            scheduledTime: data.scheduledTime?.toDate() || undefined
          } as Task;
        });
        callback(tasks);
      },
      (error) => {
        console.error('Tasks subscription error:', error);
        // Optionally call callback with empty array or handle error
        callback([]);
      }
    );
  }
  
  // Teams
  static async createTeam(team: Omit<Team, 'id'>) {
    try {
      const teamData = {
        ...team,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        members: team.members.map(member => ({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        }))
      };
      
      const docRef = await addDoc(collection(db, 'teams'), teamData);
      return docRef.id;
    } catch (error: any) {
      console.error('Create team error:', error);
      throw new Error('Failed to create team. Please try again.');
    }
  }
  
  static async getUserTeams(userId: string): Promise<Team[]> {
    try {
      // Query teams where user is admin or member
      const q = query(
        collection(db, 'teams'),
        where('adminId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      const teams = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          members: data.members?.map((member: any) => ({
            ...member,
            joinedAt: member.joinedAt?.toDate() || new Date()
          })) || []
        } as Team;
      });
      
      return teams;
    } catch (error: any) {
      console.error('Get user teams error:', error);
      throw new Error('Failed to load teams. Please try again.');
    }
  }
  
  // Focus Sessions
  static async addFocusSession(session: Omit<FocusSession, 'id'>) {
    try {
      const sessionData = {
        ...session,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'focusSessions'), sessionData);
      return docRef.id;
    } catch (error: any) {
      console.error('Add focus session error:', error);
      throw new Error('Failed to start focus session. Please try again.');
    }
  }
  
  static async updateFocusSession(sessionId: string, updates: Partial<FocusSession>) {
    try {
      const sessionRef = doc(db, 'focusSessions', sessionId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(sessionRef, updateData);
    } catch (error: any) {
      console.error('Update focus session error:', error);
      throw new Error('Failed to update focus session. Please try again.');
    }
  }
  
  static async getUserFocusSessions(userId: string): Promise<FocusSession[]> {
    try {
      const q = query(
        collection(db, 'focusSessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as FocusSession;
      });
    } catch (error: any) {
      console.error('Get user focus sessions error:', error);
      throw new Error('Failed to load focus sessions. Please try again.');
    }
  }
  
  // Batch operations
  static async batchUpdateTasks(updates: Array<{ id: string; data: Partial<Task> }>) {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, data }) => {
        const taskRef = doc(db, 'tasks', id);
        const updateData = { ...data, updatedAt: serverTimestamp() };
        
        // Convert dates to Timestamps
        if (updateData.dueDate) {
          updateData.dueDate = Timestamp.fromDate(updateData.dueDate) as any;
        }
        if (updateData.completedAt) {
          updateData.completedAt = Timestamp.fromDate(updateData.completedAt) as any;
        }
        
        batch.update(taskRef, updateData);
      });
      
      await batch.commit();
    } catch (error: any) {
      console.error('Batch update tasks error:', error);
      throw new Error('Failed to update tasks. Please try again.');
    }
  }
}