import React, { useState, useMemo, useCallback } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  Play,
  Trash2,
  AlertTriangle,
  Zap,
  Shield,
  Plus,
  Edit3,
  Bell,
  Volume2,
  ArrowRight,
  Settings,
  Save,
  X,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { smartInterventionService } from '../services/SmartInterventionService';
import { reminderToneService } from '../services/ReminderToneService';
import { TaskReminderSettings } from '../types';

// Define types for better type safety
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

const TaskList: React.FC = () => {
  const { tasks, updateTask, deleteTask, startFocusSession, addTask, moveTaskToInProgress, setTaskReminder } = useApp();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done' | 'critical' | 'at-risk'>('all');
  const [showHonestyCheck, setShowHonestyCheck] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    dueDate: '',
    estimatedTime: 30,
    tags: [] as string[]
  });

  // Memoize critical and at-risk tasks to prevent recalculation on every render
  const { criticalTasks, atRiskTasks, overdueTasks } = useMemo(() => {
    const critical = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const createdDate = new Date(task.createdAt);
      const totalTimespan = dueDate.getTime() - createdDate.getTime();
      const elapsedTime = now.getTime() - createdDate.getTime();
      const timeProgress = elapsedTime / totalTimespan;
      
      return timeProgress >= 0.5 && timeProgress < 0.85;
    });

    const atRisk = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      const createdDate = new Date(task.createdAt);
      const totalTimespan = dueDate.getTime() - createdDate.getTime();
      const elapsedTime = now.getTime() - createdDate.getTime();
      const timeProgress = elapsedTime / totalTimespan;
      
      return timeProgress >= 0.85;
    });

    const overdue = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      return new Date(task.dueDate) < new Date();
    });

    return { criticalTasks: critical, atRiskTasks: atRisk, overdueTasks: overdue };
  }, [tasks]);

  // Memoize filtered tasks to prevent unnecessary recalculations
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filter === 'all') return true;
      if (filter === 'critical') {
        return criticalTasks.includes(task);
      }
      if (filter === 'at-risk') {
        return atRiskTasks.includes(task);
      }
      return task.status === filter;
    });
  }, [tasks, filter, criticalTasks, atRiskTasks]);

  const handleHonestyCheck = useCallback(async (taskId: string, honestlyCompleted: boolean) => {
    try {
      setIsSubmitting(true);
      if (honestlyCompleted) {
        await updateTask(taskId, {
          status: 'done',
          completedAt: new Date(),
          honestlyCompleted: true,
          isDefenseActive: false
        });
        
        // Clear any active interventions for this task
        smartInterventionService.clearInterventionForTask(taskId);
      } else {
        // If not honestly completed, keep as in-progress and activate defense
        const task = tasks.find(t => t.id === taskId);
        await updateTask(taskId, {
          status: 'in-progress',
          honestlyCompleted: false,
          isDefenseActive: true,
          defenseLevel: 'medium',
          procrastinationCount: (task?.procrastinationCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error handling honesty check:', error);
    } finally {
      setIsSubmitting(false);
      setShowHonestyCheck(null);
    }
  }, [updateTask, tasks]);

  const toggleTaskStatus = useCallback(async (taskId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'done') {
        await updateTask(taskId, { 
          status: 'todo', 
          completedAt: undefined, 
          honestlyCompleted: undefined,
          isDefenseActive: false 
        });
      } else {
        // Show honesty check before completing
        setShowHonestyCheck(taskId);
      }
    } catch (error) {
      console.error('Error toggling task status:', error);
    }
  }, [updateTask]);

  const handleAddTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.dueDate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addTask({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        status: 'todo',
        tags: newTask.tags,
        dueDate: new Date(newTask.dueDate),
        estimatedTime: newTask.estimatedTime,
        isDefenseActive: true,
        defenseLevel: newTask.priority === 'urgent' ? 'critical' : 
                     newTask.priority === 'high' ? 'high' : 'medium',
        procrastinationCount: 0
      });

      // Reset form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        estimatedTime: 30,
        tags: []
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [newTask, addTask, isSubmitting]);

  const handleEditTask = useCallback((task: any) => {
    setEditingTask(task.id);
    setEditingTaskData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      estimatedTime: task.estimatedTime || 30
    });
  }, []);

  const handleSaveEdit = useCallback(async (taskId: string) => {
    if (!editingTaskData || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateTask(taskId, {
        title: editingTaskData.title.trim(),
        description: editingTaskData.description.trim(),
        priority: editingTaskData.priority,
        dueDate: editingTaskData.dueDate ? new Date(editingTaskData.dueDate) : undefined,
        estimatedTime: editingTaskData.estimatedTime
      });

      setEditingTask(null);
      setEditingTaskData(null);
    } catch (error) {
      console.error('Error saving task edit:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingTaskData, updateTask, isSubmitting]);

  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
    setEditingTaskData(null);
  }, []);

  const handleMoveToInProgress = useCallback(async (taskId: string) => {
    try {
      await moveTaskToInProgress(taskId);
    } catch (error) {
      console.error('Error moving task to in-progress:', error);
    }
  }, [moveTaskToInProgress]);

  const handleSetReminder = useCallback((taskId: string, settings: TaskReminderSettings) => {
    try {
      setTaskReminder(taskId, settings);
      setShowReminderModal(null);
    } catch (error) {
      console.error('Error setting task reminder:', error);
    }
  }, [setTaskReminder]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, [deleteTask]);

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'critical', label: 'Critical', count: criticalTasks.length },
    { value: 'at-risk', label: 'At Risk', count: atRiskTasks.length },
    { value: 'todo', label: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { value: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { value: 'done', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ];

  const isOverdue = useCallback((task: any) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  }, []);

  const isCritical = useCallback((task: any) => {
    return criticalTasks.includes(task);
  }, [criticalTasks]);

  const isAtRisk = useCallback((task: any) => {
    return atRiskTasks.includes(task);
  }, [atRiskTasks]);

  const getTaskProgress = useCallback((task: any) => {
    if (!task.dueDate || task.status === 'done') return 0;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    const totalTime = dueDate.getTime() - createdDate.getTime();
    const elapsedTime = now.getTime() - createdDate.getTime();
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Tasks
          </h2>
          <p className="text-orange-600 dark:text-orange-400 font-medium">
            🛡️ TaskDefender is actively monitoring your progress
          </p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add New Task
              </h3>
              
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    placeholder="What needs to be done?"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 resize-none"
                    rows={3}
                    placeholder="Task description (optional)"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Time (min)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={newTask.estimatedTime}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Required for TaskDefender's smart intervention system
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newTask.title.trim() || !newTask.dueDate || isSubmitting}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>{isSubmitting ? 'Adding...' : 'Add Task'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Settings Modal */}
      {showReminderModal && (
        <ReminderSettingsModal
          taskId={showReminderModal}
          task={tasks.find(t => t.id === showReminderModal)!}
          onSave={handleSetReminder}
          onClose={() => setShowReminderModal(null)}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as any)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === option.value
                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {option.label}
            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
              option.value === 'critical' ? 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300' :
              option.value === 'at-risk' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300' :
              option.value === 'done' ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300' :
              'bg-gray-200 dark:bg-gray-600'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No tasks yet' : `No ${filter.replace('-', ' ')} tasks`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? 'Add your first task to get started with TaskDefender protection' 
                : `All your ${filter.replace('-', ' ')} tasks will appear here`
              }
            </p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const progress = getTaskProgress(task);
            const isEditing = editingTask === task.id;
            const isCompleted = task.status === 'done';
            
            return (
              <div key={task.id} className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 ${
                isCompleted ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10' :
                task.isDefenseActive ? 'border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/10' : 
                'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className="mt-1 flex-shrink-0"
                    disabled={isSubmitting}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors duration-200" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingTaskData?.title || ''}
                              onChange={(e) => setEditingTaskData(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              disabled={isSubmitting}
                            />
                            <textarea
                              value={editingTaskData?.description || ''}
                              onChange={(e) => setEditingTaskData(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                              rows={2}
                              disabled={isSubmitting}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <select
                                value={editingTaskData?.priority || 'medium'}
                                onChange={(e) => setEditingTaskData(prev => ({ ...prev, priority: e.target.value }))}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                disabled={isSubmitting}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                              <input
                                type="number"
                                min="5"
                                value={editingTaskData?.estimatedTime || 30}
                                onChange={(e) => setEditingTaskData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 30 }))}
                                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                disabled={isSubmitting}
                              />
                            </div>
                            <input
                              type="datetime-local"
                              value={editingTaskData?.dueDate || ''}
                              onChange={(e) => setEditingTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              disabled={isSubmitting}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveEdit(task.id)}
                                disabled={isSubmitting}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm disabled:opacity-50"
                              >
                                {isSubmitting ? (
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                                <span>Save</span>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                              >
                                <X className="h-3 w-3" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className={`font-medium transition-all duration-200 ${
                              isCompleted 
                                ? 'text-green-700 dark:text-green-400 line-through' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {task.title}
                              {isCompleted && (
                                <span title="Completed" className="ml-2">
                                  <Check className="inline h-4 w-4 text-green-500" aria-label="Completed" />
                                </span>
                              )}
                              {task.isDefenseActive && !isCompleted && (
                                <span title="Defense Active" className="ml-2">
                                  <Shield className="inline h-4 w-4 text-orange-500" aria-label="Defense Active" />
                                </span>
                              )}
                            </h3>
                            
                            {task.description && (
                              <p className={`text-sm mt-1 ${
                                isCompleted 
                                  ? 'text-green-600/70 dark:text-green-400/70' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {task.description}
                              </p>
                            )}
                            
                            {task.procrastinationCount && task.procrastinationCount > 0 && !isCompleted && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                ⚠️ Procrastination detected {task.procrastinationCount} time(s)
                              </p>
                            )}

                            {/* Progress Bar for Active Tasks */}
                            {!isCompleted && task.dueDate && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600 dark:text-gray-400">Progress to deadline</span>
                                  <span className={`font-medium ${
                                    progress >= 85 ? 'text-red-500' :
                                    progress >= 50 ? 'text-yellow-500' :
                                    'text-green-500'
                                  }`}>
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      progress >= 85 ? 'bg-red-500' :
                                      progress >= 50 ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, progress)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {!isEditing && (
                        <div className="flex items-center space-x-2 ml-2">
                          {isOverdue(task) && !isCompleted && (
                            <span title="Overdue">
                              <AlertTriangle className="h-4 w-4 text-red-500" aria-label="Overdue" />
                            </span>
                          )}
                          
                          {isAtRisk(task) && !isCompleted && (
                            <span title="At Risk">
                              <Zap className="h-4 w-4 text-yellow-500 animate-pulse" aria-label="At Risk" />
                            </span>
                          )}
                          
                          {isCritical(task) && !isAtRisk(task) && !isCompleted && (
                            <span title="Critical">
                              <AlertTriangle className="h-4 w-4 text-orange-500" aria-label="Critical" />
                            </span>
                          )}

                          {task.status === 'todo' && (
                            <button
                              onClick={() => handleMoveToInProgress(task.id)}
                              disabled={isSubmitting}
                              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                              title="Move to In Progress"
                            >
                              <ArrowRight className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                            </button>
                          )}

                          {!isCompleted && (
                            <>
                              <button
                                onClick={() => setShowReminderModal(task.id)}
                                disabled={isSubmitting}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                                title="Set reminder"
                              >
                                <Bell className="h-4 w-4 text-gray-500 hover:text-purple-500" />
                              </button>

                              <button
                                onClick={() => startFocusSession(task.id)}
                                disabled={isSubmitting}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                                title="Start focus session"
                              >
                                <Play className="h-4 w-4 text-gray-500 hover:text-orange-500" aria-label="Start focus session" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleEditTask(task)}
                            disabled={isSubmitting}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                            title="Edit task"
                          >
                            <Edit3 className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={isSubmitting}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
                            title="Delete task"
                          >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" aria-label="Delete task" />
                          </button>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full ${
                          isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                          task.status === 'in-progress' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {task.priority}
                        </span>
                        
                        {task.estimatedTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedTime}min</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className={`flex items-center space-x-1 ${
                            isOverdue(task) && !isCompleted ? 'text-red-500' :
                            isAtRisk(task) && !isCompleted ? 'text-yellow-500' :
                            isCritical(task) && !isCompleted ? 'text-orange-500' : ''
                          }`}>
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            {isOverdue(task) && !isCompleted && <span className="text-red-500 font-medium">Overdue!</span>}
                            {isAtRisk(task) && !isCompleted && <span className="text-yellow-500 font-medium">At Risk!</span>}
                            {isCritical(task) && !isAtRisk(task) && !isCompleted && <span className="text-orange-500 font-medium">Critical!</span>}
                          </div>
                        )}

                        {task.reminderSettings?.enabled && (
                          <div className="flex items-center space-x-1 text-purple-500">
                            <Bell className="h-3 w-3" />
                            <span>Reminder: {task.reminderSettings.interval}m</span>
                          </div>
                        )}
                        
                        {isCompleted && task.completedAt && (
                          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!isEditing && task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Honesty Check Modal */}
      {showHonestyCheck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-4">
                <Shield className="h-10 w-10 text-orange-500 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Honesty Checkpoint
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Did you really complete this task honestly and thoroughly?
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                Your Last Line of Defense Against Procrastination
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleHonestyCheck(showHonestyCheck, true)}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>✅ Yes, I completed it honestly</>
                )}
              </button>
              
              <button
                onClick={() => handleHonestyCheck(showHonestyCheck, false)}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50"
              >
                🛡️ I need TaskDefender's help
              </button>
              
              <button
                onClick={() => setShowHonestyCheck(null)}
                disabled={isSubmitting}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Reminder Settings Modal Component
const ReminderSettingsModal: React.FC<{
  taskId: string;
  task: any;
  onSave: (taskId: string, settings: TaskReminderSettings) => void;
  onClose: () => void;
}> = ({ taskId, task, onSave, onClose }) => {
  const [settings, setSettings] = useState<TaskReminderSettings>({
    enabled: task.reminderSettings?.enabled || false,
    interval: task.reminderSettings?.interval || 30,
    useVoice: task.reminderSettings?.useVoice || false,
    useTone: task.reminderSettings?.useTone || true,
    selectedTone: task.reminderSettings?.selectedTone || 'gentle-bell',
    character: task.reminderSettings?.character || 'default',
    snoozeOptions: task.reminderSettings?.snoozeOptions || [5, 10, 15]
  });

  const availableTones = reminderToneService.getAvailableTones();

  const handleSave = () => {
    onSave(taskId, settings);
  };

  const testTone = () => {
    if (settings.selectedTone) {
      reminderToneService.testTone(settings.selectedTone);
    }
  };

  const testVoice = () => {
    if ('speechSynthesis' in window) {
      const message = `This is a test reminder for your task: ${task.title}`;
      const utterance = new SpeechSynthesisUtterance(message);
      
      // Character-specific voice adjustments
      switch (settings.character) {
        case 'mom':
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          break;
        case 'coach':
          utterance.rate = 1.2;
          utterance.pitch = 0.9;
          utterance.volume = 1.0;
          break;
        default:
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Task Reminder Settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Configure voice and tone reminders for: <strong>{task.title}</strong>
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Smart Reminders
              </label>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
            </div>

            {settings.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reminder Interval (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.interval}
                    onChange={(e) => setSettings(prev => ({ ...prev, interval: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Continuous reminders every minute until you respond
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useVoice"
                      checked={settings.useVoice}
                      onChange={(e) => setSettings(prev => ({ ...prev, useVoice: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="useVoice" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use Voice Reminders
                    </label>
                    {settings.useVoice && (
                      <button
                        type="button"
                        onClick={testVoice}
                        className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-200"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Test</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="useTone"
                      checked={settings.useTone}
                      onChange={(e) => setSettings(prev => ({ ...prev, useTone: e.target.checked }))}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="useTone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use Tone Reminders
                    </label>
                    {settings.useTone && (
                      <button
                        type="button"
                        onClick={testTone}
                        className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-xs hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors duration-200"
                      >
                        <Volume2 className="h-3 w-3" />
                        <span>Test</span>
                      </button>
                    )}
                  </div>
                </div>

                {settings.useVoice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Voice Character
                    </label>
                    <select
                      value={settings.character}
                      onChange={(e) => setSettings(prev => ({ ...prev, character: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="default">TaskDefender AI</option>
                      <option value="mom">Concerned Mom</option>
                      <option value="coach">Motivational Coach</option>
                      <option value="custom">Custom Assistant</option>
                    </select>
                  </div>
                )}

                {settings.useTone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reminder Tone
                    </label>
                    <select
                      value={settings.selectedTone}
                      onChange={(e) => setSettings(prev => ({ ...prev, selectedTone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {availableTones.map(tone => (
                        <option key={tone.id} value={tone.id}>
                          {tone.name} - {tone.description}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Snooze Options (minutes)
                  </label>
                  <div className="flex space-x-2">
                    {[5, 10, 15, 30, 60].map(minutes => (
                      <label key={minutes} className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.snoozeOptions.includes(minutes)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings(prev => ({
                                ...prev,
                                snoozeOptions: [...prev.snoozeOptions, minutes].sort((a, b) => a - b)
                              }));
                            } else {
                              setSettings(prev => ({
                                ...prev,
                                snoozeOptions: prev.snoozeOptions.filter(m => m !== minutes)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{minutes}m</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
            >
              Save Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;