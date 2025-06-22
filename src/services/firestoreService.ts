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
  Timestamp
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
        createdAt: Timestamp.fromDate(task.createdAt),
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        completedAt: task.completedAt ? Timestamp.fromDate(task.completedAt) : null,
        expectedCompletionTime: task.expectedCompletionTime ? Timestamp.fromDate(task.expectedCompletionTime) : null,
        scheduledTime: task.scheduledTime ? Timestamp.fromDate(task.scheduledTime) : null
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
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
      
      await updateDoc(taskRef, updateData);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  static async deleteTask(taskId: string) {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error: any) {
      throw new Error(error.message);
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
          dueDate: data.dueDate?.toDate() || undefined,
          completedAt: data.completedAt?.toDate() || undefined,
          expectedCompletionTime: data.expectedCompletionTime?.toDate() || undefined,
          scheduledTime: data.scheduledTime?.toDate() || undefined
        } as Task;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  static subscribeToUserTasks(userId: string, callback: (tasks: Task[]) => void) {
    const q = query(
      collection(db, 'tasks'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || undefined,
          completedAt: data.completedAt?.toDate() || undefined,
          expectedCompletionTime: data.expectedCompletionTime?.toDate() || undefined,
          scheduledTime: data.scheduledTime?.toDate() || undefined
        } as Task;
      });
      callback(tasks);
    });
  }
  
  // Teams
  static async createTeam(team: Omit<Team, 'id'>) {
    try {
      const teamData = {
        ...team,
        createdAt: Timestamp.fromDate(team.createdAt),
        members: team.members.map(member => ({
          ...member,
          joinedAt: Timestamp.fromDate(member.joinedAt)
        }))
      };
      
      const docRef = await addDoc(collection(db, 'teams'), teamData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  static async getUserTeams(userId: string): Promise<Team[]> {
    try {
      const q = query(
        collection(db, 'teams'),
        where('members', 'array-contains-any', [{ userId }])
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          members: data.members?.map((member: any) => ({
            ...member,
            joinedAt: member.joinedAt?.toDate() || new Date()
          })) || []
        } as Team;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
  
  // Focus Sessions
  static async addFocusSession(session: Omit<FocusSession, 'id'>) {
    try {
      const sessionData = {
        ...session,
        createdAt: Timestamp.fromDate(session.createdAt)
      };
      
      const docRef = await addDoc(collection(db, 'focusSessions'), sessionData);
      return docRef.id;
    } catch (error: any) {
      throw new Error(error.message);
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
          createdAt: data.createdAt?.toDate() || new Date()
        } as FocusSession;
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}