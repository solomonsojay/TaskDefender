import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Calendar, Play, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TaskList: React.FC = () => {
  const { tasks, updateTask, deleteTask, startFocusSession } = useApp();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const toggleTaskStatus = (taskId: string, currentStatus: string) => {
    if (currentStatus === 'done') {
      updateTask(taskId, { status: 'todo', completedAt: undefined });
    } else {
      updateTask(taskId, { 
        status: 'done', 
        completedAt: new Date(),
        honestlyCompleted: true 
      });
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'todo', label: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
    { value: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length },
    { value: 'done', label: 'Done', count: tasks.filter(t => t.status === 'done').length },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Your Tasks
      </h2>

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
            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600">
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
                ? 'Add your first task to get started' 
                : `All your ${filter.replace('-', ' ')} tasks will appear here`
              }
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 p-4">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.status === 'done' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors duration-200" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className={`font-medium transition-all duration-200 ${
                      task.status === 'done' 
                        ? 'text-gray-500 dark:text-gray-400 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2 ml-2">
                      {task.status !== 'done' && (
                        <button
                          onClick={() => startFocusSession(task.id)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          title="Start focus session"
                        >
                          <Play className="h-4 w-4 text-gray-500 hover:text-orange-500" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-1 rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      task.status === 'in-progress' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                    
                    <span className="capitalize">{task.priority}</span>
                    
                    {task.estimatedTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedTime}min</span>
                      </div>
                    )}
                    
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag, index) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;