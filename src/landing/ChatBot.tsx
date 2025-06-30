import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const ChatBot: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "👋 Hi there! I'm Ninja, the TaskDefender assistant. How can I help you today?",
      sender: 'bot'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot'
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('do')) {
      return "TaskDefender offers several powerful features:\n\n🎯 Task Management: Create, prioritize, and track tasks with honesty checkpoints\n⏰ Focus Mode: Pomodoro-style work sessions with distraction tracking\n🤖 AI Sarcasm Engine: Multiple personality types for motivation\n📞 Voice Call Interventions: Character-based motivational calls\n📊 Analytics: Track your productivity with detailed insights\n🏆 Achievement System: Earn badges for productivity milestones\n\nWhat feature would you like to know more about?";
    }
    
    if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
      return "TaskDefender's task management system helps you stay organized and accountable:\n\n• Create tasks with priorities (low, medium, high, urgent)\n• Set deadlines and estimated completion times\n• Track progress with visual indicators\n• Complete tasks with honesty checkpoints\n• Filter by status, priority, or deadline\n• Smart detection of critical and at-risk tasks\n\nThe honesty system is key - it maintains your integrity score and builds real productivity habits!";
    }
    
    if (lowerMessage.includes('focus') || lowerMessage.includes('pomodoro')) {
      return "The Focus Mode in TaskDefender uses the Pomodoro technique with smart enhancements:\n\n• Customizable work/break intervals\n• Automatic distraction detection when you switch tabs\n• Focus statistics and session tracking\n• Visual timer with progress indication\n• Focus ratio calculation\n• Session history in analytics\n\nIt's designed to help you maintain deep focus and track your actual productive time!";
    }
    
    if (lowerMessage.includes('voice') || lowerMessage.includes('call')) {
      return "Voice Call Interventions are one of TaskDefender's unique features:\n\n• Choose from different character personalities (TaskDefender AI, Concerned Mom, Motivational Coach)\n• Customize voice types and accents\n• Set call frequency and intervals\n• Receive motivational calls when tasks approach deadlines\n• Emergency interventions for critical tasks\n\nThese voice calls serve as your last line of defense against procrastination!";
    }
    
    if (lowerMessage.includes('team') || lowerMessage.includes('collaborate')) {
      return "Team Management features (for admin users):\n\n• Create teams with custom names and descriptions\n• Generate invite codes for team members\n• Track team-wide productivity metrics\n• Assign tasks to team members\n• Monitor team progress and achievements\n• Collaborate on shared goals\n\nTeam features help maintain accountability across groups!";
    }
    
    if (lowerMessage.includes('achievement') || lowerMessage.includes('badge')) {
      return "The Achievement System gamifies your productivity:\n\n• I Did a Thing Today: Complete at least one task\n• Streak Warrior: Maintain a 7-day streak\n• Task Terminator: Complete 50 tasks total\n• Perfectionist: Maintain 95%+ integrity score\n• Consistency Champion: 30 consecutive days\n• Last Minute Larry: Complete tasks near deadline\n• TaskDefender Legend: Achieve all badges\n\nEach badge represents a milestone in your productivity journey!";
    }
    
    if (lowerMessage.includes('analytics') || lowerMessage.includes('stats')) {
      return "TaskDefender's Analytics provide insights into your productivity:\n\n• Daily, weekly, and monthly views\n• Task completion rates and trends\n• Focus session statistics\n• Integrity score tracking\n• Procrastination patterns\n• Streak monitoring\n• Social media sharing of achievements\n\nThese insights help you understand your productivity patterns and improve over time.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('ticket')) {
      return "Need help with TaskDefender? I'm here to assist!\n\nFor technical support, please provide:\n1. What issue you're experiencing\n2. Which browser you're using\n3. Any error messages you see\n\nFor feature requests or feedback, please describe what you'd like to see improved.\n\nYou can also email support@taskdefender.online for direct assistance.";
    }
    
    if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('how to')) {
      return "Getting started with TaskDefender is easy:\n\n1. Click the big 'Go to App' button on this page\n2. Create an account with your email\n3. Complete the quick onboarding to set your work style\n4. Add your first task using the Quick Task Capture\n5. Start a focus session by clicking the play button\n6. Track your progress in the Analytics section\n\nThe app will guide you through each step with helpful tips!";
    }
    
    if (lowerMessage.includes('escalation') || lowerMessage.includes('phase') || lowerMessage.includes('consequence')) {
      return "TaskDefender's 4-Phase Escalation System (Coming Soon):\n\n1. 🎭 Sarcastic Nudges: Humorous but cutting notifications\n2. 🗣️ AI Voice Intervention: 'Future You' calls with warnings\n3. 📱 Public Accountability: Social media exposure of procrastination\n4. 💰 Financial Consequences: Automatic donations to causes you hate\n\nThis escalating system ensures you can't ignore your responsibilities!";
    }
    
    if (lowerMessage.includes('behavioral') || lowerMessage.includes('psychology') || lowerMessage.includes('pattern')) {
      return "TaskDefender uses advanced behavioral psychology:\n\n• Behavioral Science Backed: Proven negative reinforcement techniques\n• Personalized Shame: Learns your specific procrastination patterns\n• No Easy Opt-Out: Consequences are locked in when you set tasks\n• Dark Humor: Makes productivity fun through savage honesty\n\nIt's designed by procrastinators, for procrastinators!";
    }
    
    if (lowerMessage.includes('premium') || lowerMessage.includes('payment') || lowerMessage.includes('blockchain')) {
      return "Upcoming Premium Features:\n\n• 🎙️ ElevenLabs AI for personalized voice shaming\n• 💰 Algorand blockchain for enforceable financial stakes\n• 👁️ Smart activity monitoring to detect real procrastination\n• 🔒 Premium team management features\n• 📊 Advanced analytics and insights\n\nThese features will take TaskDefender to the next level!";
    }
    
    return "Thanks for your message! TaskDefender is your last line of defense against procrastination, featuring task management, focus sessions, voice interventions, and more. How can I help you learn more about a specific feature?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 z-50 animate-bounce ${isChatOpen ? 'hidden' : 'flex'}`}
        title="Chat with Ninja"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 w-80 md:w-96 overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Ninja Assistant</h3>
                <p className="text-xs text-orange-100">TaskDefender Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`p-1.5 rounded-full ${
                    message.sender === 'user' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-xl ${
                    message.sender === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                    <Bot className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about TaskDefender..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Ask about features, support, or how to get started
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;