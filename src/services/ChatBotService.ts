import { User, Task } from '../types';
import { 
  HelpCircle, 
  Settings, 
  Target, 
  Clock, 
  Users, 
  TrendingUp,
  Zap,
  MessageCircle,
  Shield,
  Bell,
  Monitor,
  Brain,
  PhoneCall,
  Award,
  Calendar,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  actions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  message: string;
  icon: React.ComponentType<any>;
  category: 'help' | 'action' | 'navigation';
}

export interface ChatContext {
  user: User | null;
  tasks: Task[];
  currentContext: string;
}

export class ChatBotService {
  private knowledgeBase: Map<string, any> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase() {
    // App Features Knowledge
    this.knowledgeBase.set('features', {
      'task management': {
        description: 'Create, organize, and track tasks with priorities, deadlines, and time estimates',
        howTo: 'Use the Quick Task Capture on the dashboard or go to the Tasks tab to manage your tasks',
        features: ['Priority levels (low, medium, high, urgent)', 'Due dates and time estimates', 'Tags and categories', 'Honesty checkpoints', 'Progress tracking']
      },
      'focus mode': {
        description: 'Pomodoro-style focus sessions with customizable work and break intervals',
        howTo: 'Click the focus button on any task or go to Focus Mode tab',
        features: ['Customizable work/break durations', 'Distraction tracking', 'Session statistics', 'Auto-start options']
      },
      'analytics': {
        description: 'Comprehensive productivity tracking with daily, weekly, and monthly insights',
        howTo: 'Click on your streak in the header or go to Analytics tab',
        features: ['Progress visualization', 'Productivity metrics', 'Social media sharing', 'Data export']
      },
      'team management': {
        description: 'Create and manage productivity teams (admin feature)',
        howTo: 'Click the Users icon in the header (admin only)',
        features: ['Team creation', 'Member invitations', 'Productivity tracking', 'Role management']
      },
      'sarcasm engine': {
        description: 'AI-powered motivational prompts with different personality types',
        howTo: 'Configure in Settings > Sarcasm Engine',
        features: ['Multiple personas (Gordon Ramsay, Mom, HR, etc.)', 'Contextual prompts', 'Customizable severity']
      },
      'voice calls': {
        description: 'Character-based voice interventions for motivation',
        howTo: 'Enable in Settings > Voice Calls',
        features: ['Multiple characters', 'Automated calls', 'Customizable frequency', 'Test calls']
      },
      'monitoring': {
        description: 'Advanced productivity monitoring and AI insights',
        howTo: 'Configure in Settings > Advanced Monitoring',
        features: ['Browser tracking', 'Application monitoring', 'AI insights', 'Productivity scoring']
      },
      'notifications': {
        description: 'Smart notification scheduling and reminders',
        howTo: 'Set up in Settings > Notifications',
        features: ['Custom schedules', 'Multiple personas', 'Recurring reminders', 'Task-specific alerts']
      }
    });

    // Settings Knowledge
    this.knowledgeBase.set('settings', {
      'profile': 'Manage your personal information, theme preferences, and work style',
      'social media': 'Connect Twitter, LinkedIn, and Facebook for sharing achievements',
      'sarcasm engine': 'Customize your AI motivational assistant personality',
      'advanced monitoring': 'Configure external activity tracking and insights',
      'ai interventions': 'Set up smart productivity interventions and nudges',
      'voice calls': 'Configure character-based voice motivation calls',
      'data & privacy': 'Control data collection and privacy settings',
      'wallet': 'Connect Algorand wallet for blockchain features',
      'notifications': 'Manage notification preferences and schedules',
      'security': 'View integrity score and security settings'
    });

    // Common Questions & Answers
    this.knowledgeBase.set('faq', {
      'how to create task': 'You can create tasks using the Quick Task Capture on the dashboard or by going to the Tasks tab and clicking the add button.',
      'how to start focus session': 'Click the play button next to any task or go to Focus Mode and select a task to focus on.',
      'how to view analytics': 'Click on your streak display in the header or navigate to the Analytics tab to see detailed productivity insights.',
      'how to join team': 'Ask your team admin for an invite code, then click the Users icon in the header and select "Join Team".',
      'how to change theme': 'Go to Settings > Profile and select your preferred theme (light or dark).',
      'how to export data': 'Go to Settings > Data & Privacy and click "Export All Data" to download your information.',
      'how to connect social media': 'Go to Settings > Social Media to connect your Twitter, LinkedIn, and Facebook accounts.',
      'how to customize sarcasm': 'Go to Settings > Sarcasm Engine to choose your preferred AI personality and test different styles.',
      'what is integrity score': 'Your integrity score reflects how honestly you complete tasks. It\'s calculated based on your honesty checkpoints.',
      'how to maintain streak': 'Complete at least one task each day to maintain your productivity streak.',
      'how to enable voice calls': 'Go to Settings > Voice Calls to enable character-based motivational calls.',
      'how to set up monitoring': 'Go to Settings > Advanced Monitoring to configure external activity tracking.',
      'how to schedule notifications': 'Go to Settings > Notifications to set up custom reminders and alerts.',
      'how to share progress': 'Go to Analytics and click the Share button to post your achievements on social media.'
    });

    // Troubleshooting
    this.knowledgeBase.set('troubleshooting', {
      'tasks not saving': 'Tasks are saved automatically to your browser\'s local storage. Make sure you\'re not in incognito mode.',
      'focus mode not working': 'Ensure you have a task selected and try refreshing the page if issues persist.',
      'notifications not showing': 'Check your browser notification permissions and ensure notifications are enabled in Settings.',
      'social sharing not working': 'Make sure you\'ve connected your social media accounts in Settings > Social Media.',
      'voice calls not playing': 'Check your browser\'s audio permissions and ensure voice calls are enabled in settings.',
      'data not syncing': 'TaskDefender stores data locally. For backup, use the export feature in Settings > Data & Privacy.',
      'theme not changing': 'Try refreshing the page after changing themes in Settings > Profile.',
      'streak not updating': 'Streaks update when you complete tasks. Make sure to mark tasks as done honestly.'
    });
  }

  public getWelcomeMessage(user: User | null): ChatMessage {
    const userName = user?.name || 'there';
    return {
      id: 'welcome',
      text: `👋 Hi ${userName}! I'm your TaskDefender Assistant. I'm here to help you navigate the app and boost your productivity!\n\nI can help you with:\n• Understanding app features\n• Getting started guides\n• Troubleshooting issues\n• Tips and best practices\n\nWhat would you like to know?`,
      sender: 'bot',
      timestamp: new Date(),
      actions: [
        { id: 'getting-started', label: '🚀 Getting Started', message: 'How do I get started with TaskDefender?', icon: Lightbulb, category: 'help' },
        { id: 'features-overview', label: '✨ Features Overview', message: 'What features does TaskDefender have?', icon: HelpCircle, category: 'help' },
        { id: 'create-task', label: '📝 Create Task', message: 'How do I create a new task?', icon: Target, category: 'action' }
      ]
    };
  }

  public getQuickActions(): QuickAction[] {
    return [
      { id: 'help-tasks', label: 'Task Help', message: 'How do I manage tasks?', icon: Target, category: 'help' },
      { id: 'help-focus', label: 'Focus Mode', message: 'How does focus mode work?', icon: Clock, category: 'help' },
      { id: 'help-analytics', label: 'Analytics', message: 'How do I view my analytics?', icon: TrendingUp, category: 'help' },
      { id: 'help-settings', label: 'Settings', message: 'How do I change settings?', icon: Settings, category: 'help' }
    ];
  }

  public getContextualQuickActions(lastMessage: string): QuickAction[] {
    const message = lastMessage.toLowerCase();
    
    if (message.includes('task')) {
      return [
        { id: 'create-task', label: 'Create Task', message: 'How do I create a task?', icon: Target, category: 'action' },
        { id: 'focus-task', label: 'Focus Mode', message: 'How do I start a focus session?', icon: Clock, category: 'action' },
        { id: 'task-priority', label: 'Set Priority', message: 'How do I set task priorities?', icon: AlertCircle, category: 'help' }
      ];
    }
    
    if (message.includes('focus')) {
      return [
        { id: 'focus-settings', label: 'Focus Settings', message: 'How do I customize focus mode?', icon: Settings, category: 'help' },
        { id: 'pomodoro', label: 'Pomodoro Timer', message: 'How does the Pomodoro timer work?', icon: Clock, category: 'help' }
      ];
    }
    
    if (message.includes('team')) {
      return [
        { id: 'create-team', label: 'Create Team', message: 'How do I create a team?', icon: Users, category: 'action' },
        { id: 'join-team', label: 'Join Team', message: 'How do I join a team?', icon: Users, category: 'action' }
      ];
    }
    
    if (message.includes('analytics') || message.includes('progress')) {
      return [
        { id: 'view-analytics', label: 'View Analytics', message: 'How do I view my analytics?', icon: TrendingUp, category: 'navigation' },
        { id: 'share-progress', label: 'Share Progress', message: 'How do I share my progress?', icon: MessageCircle, category: 'action' }
      ];
    }
    
    return [
      { id: 'more-help', label: 'More Help', message: 'What else can you help me with?', icon: HelpCircle, category: 'help' },
      { id: 'features', label: 'All Features', message: 'Show me all features', icon: Lightbulb, category: 'help' }
    ];
  }

  public async processMessage(message: string, context: ChatContext): Promise<ChatMessage> {
    const lowerMessage = message.toLowerCase();
    let response = '';
    let actions: QuickAction[] = [];

    // Getting Started
    if (lowerMessage.includes('getting started') || lowerMessage.includes('get started')) {
      response = `🚀 **Getting Started with TaskDefender**\n\n1. **Create Your First Task**: Use the Quick Task Capture on the dashboard\n2. **Set Priorities**: Choose from low, medium, high, or urgent\n3. **Start Focusing**: Click the play button to begin a focus session\n4. **Track Progress**: View your analytics by clicking your streak\n5. **Stay Honest**: Use honesty checkpoints when completing tasks\n\nWould you like detailed help with any of these steps?`;
      actions = [
        { id: 'task-help', label: 'Task Creation', message: 'How do I create and manage tasks?', icon: Target, category: 'help' },
        { id: 'focus-help', label: 'Focus Sessions', message: 'Tell me about focus mode', icon: Clock, category: 'help' }
      ];
    }
    
    // Features Overview
    else if (lowerMessage.includes('features') || lowerMessage.includes('what can') || lowerMessage.includes('what does')) {
      response = `✨ **TaskDefender Features**\n\n🎯 **Task Management**: Create, prioritize, and track tasks\n⏰ **Focus Mode**: Pomodoro-style work sessions\n📊 **Analytics**: Daily, weekly, monthly insights\n👥 **Teams**: Collaborate with team members (admin)\n🤖 **AI Assistant**: Sarcastic motivational prompts\n📞 **Voice Calls**: Character-based interventions\n📱 **Social Sharing**: Share progress on social media\n🔒 **Privacy First**: All data stored locally\n\nWhich feature interests you most?`;
      actions = [
        { id: 'task-features', label: 'Task Features', message: 'Tell me about task management', icon: Target, category: 'help' },
        { id: 'ai-features', label: 'AI Features', message: 'What AI features are available?', icon: Brain, category: 'help' }
      ];
    }
    
    // Task Management
    else if (lowerMessage.includes('task') || lowerMessage.includes('create') || lowerMessage.includes('manage')) {
      if (lowerMessage.includes('create') || lowerMessage.includes('new') || lowerMessage.includes('add')) {
        response = `📝 **Creating Tasks**\n\n**Quick Method**: Use the Quick Task Capture on your dashboard\n1. Enter task title\n2. Set priority (low/medium/high/urgent)\n3. Add estimated time\n4. Click "Add Task"\n\n**Detailed Method**: Go to Tasks tab\n1. Click the add button\n2. Fill in all details (description, due date, tags)\n3. Save your task\n\n**Pro Tips**:\n• Use clear, actionable titles\n• Set realistic time estimates\n• Add relevant tags for organization`;
      } else if (lowerMessage.includes('priority') || lowerMessage.includes('urgent')) {
        response = `🚨 **Task Priorities**\n\n**Low**: Nice to have, no rush\n**Medium**: Important but not urgent\n**High**: Important and time-sensitive\n**Urgent**: Critical, needs immediate attention\n\n**Color Coding**:\n• Blue: Low priority\n• Yellow: Medium priority\n• Orange: High priority\n• Red: Urgent priority\n\nTasks are automatically sorted by priority in your task list.`;
      } else {
        response = `🎯 **Task Management**\n\nTaskDefender helps you organize and complete tasks efficiently:\n\n• **Create**: Quick capture or detailed forms\n• **Prioritize**: 4-level priority system\n• **Focus**: Start focus sessions on any task\n• **Track**: Monitor time spent and progress\n• **Complete**: Honesty checkpoints for integrity\n\nWhat specific aspect would you like to learn about?`;
        actions = [
          { id: 'create-task-help', label: 'Creating Tasks', message: 'How do I create a new task?', icon: Target, category: 'help' },
          { id: 'priority-help', label: 'Setting Priorities', message: 'How do task priorities work?', icon: AlertCircle, category: 'help' }
        ];
      }
    }
    
    // Focus Mode
    else if (lowerMessage.includes('focus') || lowerMessage.includes('pomodoro') || lowerMessage.includes('timer')) {
      response = `⏰ **Focus Mode**\n\nPomodoro-style productivity sessions:\n\n**How to Start**:\n1. Click play button next to any task\n2. Or go to Focus Mode tab\n3. Select your task and begin\n\n**Default Settings**:\n• 25 minutes work\n• 5 minutes short break\n• 15 minutes long break (every 4 sessions)\n\n**Features**:\n• Customizable durations\n• Distraction tracking\n• Auto-start options\n• Session statistics\n\n**Pro Tip**: Use the distraction button to track interruptions!`;
      actions = [
        { id: 'focus-settings', label: 'Customize Focus', message: 'How do I change focus settings?', icon: Settings, category: 'help' },
        { id: 'focus-tips', label: 'Focus Tips', message: 'Give me focus productivity tips', icon: Lightbulb, category: 'help' }
      ];
    }
    
    // Analytics
    else if (lowerMessage.includes('analytics') || lowerMessage.includes('progress') || lowerMessage.includes('stats') || lowerMessage.includes('streak')) {
      response = `📊 **Analytics & Progress**\n\n**Access**: Click your streak in the header or go to Analytics tab\n\n**Views Available**:\n• **Daily**: Today's tasks, focus time, productivity\n• **Weekly**: 7-day overview, consistency, top day\n• **Monthly**: Long-term trends, growth, achievements\n\n**Key Metrics**:\n• Tasks completed\n• Focus time\n• Productivity percentage\n• Consistency score\n• Integrity score\n\n**Sharing**: Export data or share on social media!`;
      actions = [
        { id: 'view-analytics', label: 'View Analytics', message: 'Take me to analytics', icon: TrendingUp, category: 'navigation' },
        { id: 'share-help', label: 'Social Sharing', message: 'How do I share my progress?', icon: MessageCircle, category: 'help' }
      ];
    }
    
    // Teams
    else if (lowerMessage.includes('team') || lowerMessage.includes('collaborate') || lowerMessage.includes('admin')) {
      if (context.user?.role === 'admin') {
        response = `👥 **Team Management** (Admin)\n\n**Creating Teams**:\n1. Click Users icon in header\n2. Go to "Create Team" tab\n3. Enter team name and description\n4. Click "Create Team"\n\n**Inviting Members**:\n• Share the 6-character invite code\n• Or send email invitations\n• Members join using the code\n\n**Features**:\n• Team productivity tracking\n• Member management\n• Role assignments\n• Shared goals`;
      } else {
        response = `👥 **Teams**\n\n**Joining a Team**:\n1. Get invite code from team admin\n2. Click Users icon in header\n3. Go to "Join Team" tab\n4. Enter the 6-character code\n5. Click "Join Team"\n\n**Team Features**:\n• Shared productivity goals\n• Team analytics\n• Collaborative motivation\n• Member progress tracking\n\n*Note: Team creation requires admin privileges*`;
      }
      actions = [
        { id: 'team-help', label: 'Team Features', message: 'What can I do with teams?', icon: Users, category: 'help' }
      ];
    }
    
    // Settings
    else if (lowerMessage.includes('settings') || lowerMessage.includes('configure') || lowerMessage.includes('customize')) {
      response = `⚙️ **Settings & Customization**\n\n**Access**: Click the gear icon in the header\n\n**Available Settings**:\n• **Profile**: Personal info, theme, work style\n• **Social Media**: Connect Twitter, LinkedIn, Facebook\n• **Sarcasm Engine**: AI personality customization\n• **Advanced Monitoring**: Activity tracking\n• **AI Interventions**: Smart productivity nudges\n• **Voice Calls**: Character-based motivation\n• **Data & Privacy**: Privacy controls, data export\n• **Notifications**: Custom reminders\n\nWhat would you like to configure?`;
      actions = [
        { id: 'sarcasm-settings', label: 'AI Personality', message: 'How do I customize the sarcasm engine?', icon: MessageCircle, category: 'help' },
        { id: 'privacy-settings', label: 'Privacy Settings', message: 'How do I control my data?', icon: Shield, category: 'help' }
      ];
    }
    
    // AI Features
    else if (lowerMessage.includes('ai') || lowerMessage.includes('sarcasm') || lowerMessage.includes('personality') || lowerMessage.includes('gordon') || lowerMessage.includes('mom')) {
      response = `🤖 **AI Features**\n\n**Sarcasm Engine**:\n• Multiple personalities (Gordon Ramsay, Mom, HR, etc.)\n• Contextual motivational prompts\n• Customizable severity levels\n• Smart nudging based on behavior\n\n**AI Interventions**:\n• Productivity dip detection\n• Break recommendations\n• Focus opportunity alerts\n• Emergency deadline warnings\n\n**Voice Calls**:\n• Character-based voice motivation\n• Automated intervention calls\n• Customizable frequency\n\n**Setup**: Go to Settings > Sarcasm Engine to customize!`;
      actions = [
        { id: 'ai-setup', label: 'Setup AI', message: 'How do I set up the AI features?', icon: Brain, category: 'help' },
        { id: 'voice-setup', label: 'Voice Calls', message: 'How do voice calls work?', icon: PhoneCall, category: 'help' }
      ];
    }
    
    // Social Media
    else if (lowerMessage.includes('social') || lowerMessage.includes('share') || lowerMessage.includes('twitter') || lowerMessage.includes('linkedin') || lowerMessage.includes('facebook')) {
      response = `📱 **Social Media Integration**\n\n**Supported Platforms**:\n• Twitter/X\n• LinkedIn\n• Facebook\n\n**Setup**:\n1. Go to Settings > Social Media\n2. Click "Connect" for each platform\n3. Authorize the connection\n\n**Sharing**:\n• Go to Analytics tab\n• Click "Share" button\n• Choose your platform\n• Auto-generated content with your stats\n\n**Privacy**: Connections stored locally, we never post without permission!`;
      actions = [
        { id: 'connect-social', label: 'Connect Accounts', message: 'How do I connect social media?', icon: MessageCircle, category: 'action' }
      ];
    }
    
    // Troubleshooting
    else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('not working') || lowerMessage.includes('broken') || lowerMessage.includes('help')) {
      response = `🔧 **Troubleshooting**\n\n**Common Issues**:\n\n**Tasks not saving**: Check if you're in incognito mode\n**Focus mode issues**: Refresh page, ensure task is selected\n**Notifications not showing**: Check browser permissions\n**Theme not changing**: Try refreshing after theme change\n**Data not syncing**: Data is stored locally (use export for backup)\n\n**Still having issues?** Try:\n1. Refresh the page\n2. Clear browser cache\n3. Check browser permissions\n\nWhat specific problem are you experiencing?`;
      actions = [
        { id: 'data-help', label: 'Data Issues', message: 'My data is not saving properly', icon: AlertCircle, category: 'help' },
        { id: 'permission-help', label: 'Permissions', message: 'How do I fix permission issues?', icon: Shield, category: 'help' }
      ];
    }
    
    // Privacy & Data
    else if (lowerMessage.includes('privacy') || lowerMessage.includes('data') || lowerMessage.includes('export') || lowerMessage.includes('delete')) {
      response = `🔒 **Privacy & Data**\n\n**Privacy-First Design**:\n• All data stored locally on your device\n• No external servers or third-party analytics\n• You maintain full control\n\n**Data Management**:\n• **Export**: Download all your data (JSON format)\n• **Delete**: Permanently remove all data\n• **Control**: Granular privacy settings\n\n**External Monitoring** (Optional):\n• Browser activity tracking\n• Application usage monitoring\n• All data stays on your device\n\n**Access**: Settings > Data & Privacy`;
      actions = [
        { id: 'export-data', label: 'Export Data', message: 'How do I export my data?', icon: Settings, category: 'action' },
        { id: 'privacy-controls', label: 'Privacy Controls', message: 'What privacy controls are available?', icon: Shield, category: 'help' }
      ];
    }
    
    // Default response for unrecognized queries
    else {
      response = `🤔 I'm not sure about that specific question, but I can help you with:\n\n• **Task Management**: Creating, organizing, and completing tasks\n• **Focus Mode**: Pomodoro-style productivity sessions\n• **Analytics**: Tracking your progress and achievements\n• **Settings**: Customizing your TaskDefender experience\n• **Teams**: Collaborating with others (admin feature)\n• **AI Features**: Sarcasm engine and smart interventions\n• **Troubleshooting**: Solving common issues\n\nTry asking about any of these topics, or be more specific about what you need help with!`;
      actions = [
        { id: 'features-help', label: 'Show Features', message: 'What features does TaskDefender have?', icon: Lightbulb, category: 'help' },
        { id: 'getting-started', label: 'Getting Started', message: 'How do I get started?', icon: HelpCircle, category: 'help' }
      ];
    }

    return {
      id: Date.now().toString(),
      text: response,
      sender: 'bot',
      timestamp: new Date(),
      actions
    };
  }
}

export const chatBotService = new ChatBotService();