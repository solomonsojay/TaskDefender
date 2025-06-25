import { User, Task, ValidationResult } from '../types';

// Fixed Error #19: Secure ID generation
export const generateSecureId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const extraRandom = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${extraRandom}`;
};

// Fixed Error #20: Input validation functions
export const validateUserData = (user: Partial<User>): ValidationResult => {
  const errors: string[] = [];

  if (!user.name || user.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!user.email || !isValidEmail(user.email)) {
    errors.push('Valid email address is required');
  }

  if (!user.username || user.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (user.username && !/^[a-zA-Z0-9_]+$/.test(user.username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  if (!user.role || !['user', 'admin'].includes(user.role)) {
    errors.push('Valid role is required');
  }

  if (!user.workStyle || !['focused', 'flexible', 'collaborative'].includes(user.workStyle)) {
    errors.push('Valid work style is required');
  }

  if (user.integrityScore !== undefined && (user.integrityScore < 0 || user.integrityScore > 100)) {
    errors.push('Integrity score must be between 0 and 100');
  }

  if (user.streak !== undefined && user.streak < 0) {
    errors.push('Streak cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTaskData = (task: Partial<Task>): ValidationResult => {
  const errors: string[] = [];

  if (!task.title || task.title.trim().length < 1) {
    errors.push('Task title is required');
  }

  if (task.title && task.title.length > 200) {
    errors.push('Task title must be less than 200 characters');
  }

  if (!task.priority || !['low', 'medium', 'high', 'urgent'].includes(task.priority)) {
    errors.push('Valid priority is required');
  }

  if (!task.status || !['todo', 'in-progress', 'done'].includes(task.status)) {
    errors.push('Valid status is required');
  }

  if (task.estimatedTime !== undefined && (task.estimatedTime < 1 || task.estimatedTime > 1440)) {
    errors.push('Estimated time must be between 1 and 1440 minutes');
  }

  if (task.actualTime !== undefined && task.actualTime < 0) {
    errors.push('Actual time cannot be negative');
  }

  if (task.dueDate && task.dueDate < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    // Allow due dates up to 24 hours in the past to account for timezone issues
    errors.push('Due date cannot be more than 24 hours in the past');
  }

  if (!task.userId || task.userId.trim().length === 0) {
    errors.push('User ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTeamData = (team: any): ValidationResult => {
  const errors: string[] = [];

  if (!team.name || team.name.trim().length < 2) {
    errors.push('Team name must be at least 2 characters long');
  }

  if (team.name && team.name.length > 100) {
    errors.push('Team name must be less than 100 characters');
  }

  if (!team.adminId || team.adminId.trim().length === 0) {
    errors.push('Admin ID is required');
  }

  if (!Array.isArray(team.members)) {
    errors.push('Members must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateNotificationData = (notification: any): ValidationResult => {
  const errors: string[] = [];

  if (!notification.title || notification.title.trim().length < 1) {
    errors.push('Notification title is required');
  }

  if (!notification.scheduledFor || !(notification.scheduledFor instanceof Date)) {
    errors.push('Valid scheduled date is required');
  }

  if (notification.scheduledFor && notification.scheduledFor < new Date()) {
    errors.push('Scheduled date must be in the future');
  }

  if (!notification.type || !['reminder', 'nudge', 'deadline', 'celebration', 'defense', 'emergency'].includes(notification.type)) {
    errors.push('Valid notification type is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};