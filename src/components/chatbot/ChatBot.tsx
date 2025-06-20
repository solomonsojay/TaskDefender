import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Minimize2,
  Maximize2,
  RotateCcw,
  Lightbulb,
  HelpCircle,
  Settings,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const { user, tasks } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: `🥷 Hey ${user?.name || 'there'}! I'm Ninja, your TaskDefender Assistant! I'm here to help you master productivity and navigate the app like a true ninja warrior!\n\nI can help you with:\n• 🎯 Understanding app features\n• 🚀 Getting started guides\n• 🔧 Troubleshooting issues\n• 💡 Tips and best practices\n• ⚡ Quick actions and shortcuts\n• 🏆 Achievement system guidance\n• 📞 Voice call setup\n• 📅 Scheduler configuration\n\nWhat would you like to know, productivity warrior?`,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const response = await processMessage(messageText);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const processMessage = async (message: string): Promise<ChatMessage> => {
    const lowerMessage = message.toLowerCase();
    let response = '';

    // Getting Started
    if (lowerMessage.includes('getting started') || lowerMessage.includes('get started')) {
      response = `🥷 **Ninja's Quick Start Guide**\n\n1. **Create Your First Task**: Use Quick Capture on dashboard\n2. **Set Priorities**: Choose from low, medium, high, or urgent\n3. **Start Focusing**: Click the play button to begin a focus session\n4. **Track Progress**: View your analytics in the Analytics tab\n5. **Stay Honest**: Use honesty checkpoints when completing tasks\n6. **Earn Achievements**: Complete tasks to unlock badges\n7. **Schedule Reminders**: Use the Scheduler for task notifications\n8. **Voice Calls**: Set up motivational voice calls in Settings\n\nReady to become a productivity ninja? 🥷⚡`;
    }
    // Features Overview
    else if (lowerMessage.includes('features') || lowerMessage.includes('what can') || lowerMessage.includes('what does')) {
      response = `🥷 **Ninja's Feature Arsenal**\n\n🎯 **Task Management**: Create, prioritize, and track tasks with honesty checkpoints\n⏰ **Focus Mode**: Pomodoro-style work sessions with distraction tracking\n📊 **Analytics**: Weekly, monthly, yearly insights with social sharing\n👥 **Teams**: Collaborate with team members (admin feature)\n📞 **Voice Calls**: Character-based motivational interventions\n🏆 **Achievement System**: Earn badges for productivity milestones\n📅 **Scheduler**: Smart notification scheduling with custom prompts\n🤖 **AI Defense**: Contextual productivity interventions\n🔒 **Privacy First**: All data stored locally on your device\n\nWhich ninja skill interests you most? 🥷`;
    }
    // Task Management
    else if (lowerMessage.includes('task') || lowerMessage.includes('create') || lowerMessage.includes('manage')) {
      response = `🥷 **Ninja Task Mastery**\n\nTaskDefender helps you organize and complete tasks like a true ninja:\n\n• **Create**: Quick capture with smart suggestions\n• **Prioritize**: 4-level priority system with colors\n• **Focus**: Start focus sessions on any task\n• **Track**: Monitor time spent and progress\n• **Complete**: Honesty checkpoints for integrity\n• **Schedule**: Set due dates and expected completion times\n• **Defend**: AI-powered procrastination defense\n\n**Honesty System**: Only honestly completed tasks move to "Done" status. This maintains your integrity score and builds real productivity habits.\n\nWhat ninja skill would you like to master first? 🥷`;
    }
    // Achievement System
    else if (lowerMessage.includes('achievement') || lowerMessage.includes('badge') || lowerMessage.includes('trophy') || lowerMessage.includes('reward')) {
      response = `🥷 **Ninja Achievement System**\n\n**Available Badges**:\n• **I Did a Thing Today**: Complete at least one task\n• **Streak Warrior**: 7-day productivity streak\n• **Task Terminator**: Complete 50 tasks total\n• **Perfectionist**: Maintain 95%+ integrity score\n• **Consistency Champion**: 30 consecutive days\n• **Last Minute Larry**: Complete tasks near deadline\n• **Captain Excuse**: Master of procrastination (ironic badge)\n• **TaskDefender Legend**: Achieve all badges\n\n**How to Earn**: Complete tasks honestly, maintain streaks, and stay consistent. Each badge tells a story of your productivity journey!\n\nReady to collect them all? 🥷🏆`;
    }
    // Voice Calls
    else if (lowerMessage.includes('voice') || lowerMessage.includes('call') || lowerMessage.includes('speak')) {
      response = `🥷 **Ninja Voice Call Arsenal**\n\n**Available Characters**:\n• **TaskDefender AI**: Your witty productivity assistant\n• **Concerned Mom**: Loving but disappointed maternal figure\n• **Motivational Coach**: Intense motivational speaker\n• **Custom Assistant**: Create your own with custom prompts and voice\n\n**Voice Options**:\n• American English (Male/Female)\n• British English (Male/Female)\n• Australian English (Male/Female)\n• South African English (Male/Female)\n\n**Custom Assistant**: Upload text prompts separated by commas and record your own voice for truly personalized motivation!\n\n**Setup**: Configure in Settings > Voice Calls to set intervals and character preferences! 🥷📞`;
    }
    // Scheduler
    else if (lowerMessage.includes('scheduler') || lowerMessage.includes('schedule') || lowerMessage.includes('notification') || lowerMessage.includes('reminder')) {
      response = `🥷 **Ninja Scheduler Mastery**\n\n**Smart Notifications**:\n• **Task Reminders**: Get notified about upcoming deadlines\n• **Custom Prompts**: Set personalized motivational messages\n• **Character Integration**: Use your favorite voice character\n• **Recurring Schedules**: Daily, weekly, or custom intervals\n• **Context Awareness**: Smart timing based on your patterns\n\n**Setup Process**:\n1. Go to Settings > Scheduler\n2. Create custom notification schedules\n3. Choose your character and voice\n4. Set intervals and triggers\n5. Let TaskDefender defend your productivity!\n\n**Pro Tip**: Combine with voice calls for maximum motivation impact! 🥷📅`;
    }
    // Analytics
    else if (lowerMessage.includes('analytics') || lowerMessage.includes('progress') || lowerMessage.includes('stats') || lowerMessage.includes('streak')) {
      response = `🥷 **Ninja Analytics Mastery**\n\n**Access**: Analytics tab for detailed insights\n\n**Views Available**:\n• **Weekly**: 7-day overview, consistency tracking\n• **Monthly**: Long-term trends, growth patterns\n• **Yearly**: Annual productivity patterns\n\n**Key Metrics**:\n• Tasks completed with honesty tracking\n• Focus time and session quality\n• Productivity percentage\n• Consistency score\n• Integrity score (honesty-based)\n• Achievement progress\n\n**Social Sharing**: Share your progress on social media to inspire others and stay accountable!\n\nTrack your ninja progress! 🥷📊`;
    }
    // Teams
    else if (lowerMessage.includes('team') || lowerMessage.includes('collaborate') || lowerMessage.includes('admin')) {
      if (user?.role === 'admin') {
        response = `🥷 **Ninja Team Leadership** (Admin)\n\n**Creating Teams**:\n1. Go to Teams tab\n2. Click "Create Team"\n3. Enter team name and description\n4. Share invite code with members\n\n**Team Features**:\n• Team productivity tracking\n• Member management with roles\n• Collaborative goal setting\n• Shared achievement celebrations\n• Team analytics and insights\n\n**Leadership Tips**: Set a good example with your own productivity to inspire your team!\n\nLead your team to productivity victory! 🥷👥`;
      } else {
        response = `🥷 **Ninja Team Collaboration**\n\n**Joining a Team**:\n1. Get invite code from team admin\n2. Go to Teams tab\n3. Click "Join Team"\n4. Enter the code\n\n**Team Features**:\n• Shared productivity goals\n• Team analytics and progress\n• Collaborative motivation\n• Group achievements\n\n*Note: Team creation requires admin privileges*\n\nJoin forces with fellow productivity ninjas! 🥷👥`;
      }
    }
    // Default response
    else {
      response = `🥷 **Ninja Assistance Available**\n\nI'm here to help you master TaskDefender - Your Last Line of Defense Against Procrastination! I can assist with:\n\n• **Task Management**: Creating, organizing, and honestly completing tasks\n• **Focus Mode**: Pomodoro-style productivity sessions\n• **Achievement System**: Earning badges and tracking milestones\n• **Analytics**: Tracking your progress and achievements\n• **Voice Calls**: Character-based motivational calls\n• **Scheduler**: Smart notification and reminder setup\n• **Teams**: Collaborating with others (admin feature)\n• **Settings**: Customizing your productivity experience\n• **Troubleshooting**: Solving common issues\n\nTry asking about any of these topics, or be more specific about what you need help with, fellow ninja! 🥷⚡`;
    }

    return {
      id: Date.now().toString(),
      text: response,
      sender: 'bot',
      timestamp: new Date()
    };
  };

  const clearChat = () => {
    setMessages([]);
    initializeChat();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 z-50 animate-bounce"
        title="Open TaskDefender Assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
      isMinimized ? 'w-72 h-16' : 'w-72 h-[400px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">TaskDefender Assistant</h3>
            {!isMinimized && (
              <p className="text-xs text-blue-100">Your productivity guide</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {!isMinimized && (
            <button
              onClick={clearChat}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
              title="Clear chat"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
          
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </button>
          
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors duration-200"
            title="Close chat"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 h-[240px]">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[85%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`p-1.5 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-3 w-3" />
                    ) : (
                      <Bot className="h-3 w-3 text-blue-500" />
                    )}
                  </div>
                  
                  <div className={`p-2.5 rounded-xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <div className="whitespace-pre-wrap text-xs">{message.text}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Bot className="h-3 w-3 text-blue-500" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-xl">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-3 pb-2">
            <div className="flex flex-wrap gap-1">
              {[
                { icon: Lightbulb, label: 'Features', message: 'What features does TaskDefender have?' },
                { icon: HelpCircle, label: 'Help', message: 'How do I get started?' },
                { icon: Zap, label: 'Focus', message: 'How does focus mode work?' }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(action.message)}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 text-xs"
                >
                  <action.icon className="h-2.5 w-2.5" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 text-xs"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="p-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;