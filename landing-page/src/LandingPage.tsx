import React, { useState } from 'react';
import { Shield, ArrowRight, MessageCircle, X, Send, User, Bot, Zap, Target, Brain, DollarSign, Eye, Mic } from 'lucide-react';
import ReactTypingEffect from 'react-typing-effect';
import Logo from './components/Logo';

const LandingPage: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'bot', id: string}[]>([
    {
      id: '1',
      text: "👋 Hi there! I'm Ninja, the TaskDefender assistant. How can I help you today?",
      sender: 'bot'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user' as const
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
    
    if (lowerMessage.includes('escalation') || lowerMessage.includes('phase') || lowerMessage.includes('consequence')) {
      return "TaskDefender's 4-Phase Escalation System (Coming Soon):\n\n1. 🎭 Sarcastic Nudges: Humorous but cutting notifications\n2. 🗣️ AI Voice Intervention: 'Future You' calls with warnings\n3. 📱 Public Accountability: Social media exposure of procrastination\n4. 💰 Financial Consequences: Automatic donations to causes you hate\n\nThis escalating system ensures you can't ignore your responsibilities!";
    }
    
    if (lowerMessage.includes('behavioral') || lowerMessage.includes('psychology') || lowerMessage.includes('pattern')) {
      return "TaskDefender uses advanced behavioral psychology:\n\n• Behavioral Science Backed: Proven negative reinforcement techniques\n• Personalized Shame: Learns your specific procrastination patterns\n• No Easy Opt-Out: Consequences are locked in when you set tasks\n• Dark Humor: Makes productivity fun through savage honesty\n\nIt's designed by procrastinators, for procrastinators!";
    }
    
    if (lowerMessage.includes('premium') || lowerMessage.includes('payment') || lowerMessage.includes('blockchain')) {
      return "Upcoming Premium Features:\n\n• 🎙️ ElevenLabs AI for personalized voice shaming\n• 💰 Algorand blockchain for enforceable financial stakes\n• 👁️ Smart activity monitoring to detect real procrastination\n• 🔒 Premium team management features\n• 📊 Advanced analytics and insights\n\nThese features will take TaskDefender to the next level!";
    }
    
    if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('how to')) {
      return "Getting started with TaskDefender is easy:\n\n1. Click the 'Go to App' button to access the application\n2. Create an account with your email\n3. Complete the quick onboarding to set your work style\n4. Add your first task using the Quick Task Capture\n5. Start a focus session by clicking the play button\n6. Track your progress in the Analytics section\n\nThe app will guide you through each step with helpful tips!";
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500/20 p-2 rounded-lg shadow-lg">
                <Logo size="sm" className="text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  TaskDefender
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your Last Line of Defense Against Procrastination
                </p>
              </div>
            </div>
            
            <div>
              <a 
                href="https://app.taskdefender.online" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                Go to App
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-orange-500/20 p-6 rounded-full w-32 h-32 mx-auto mb-8 shadow-lg flex items-center justify-center">
            <Logo size="lg" className="text-orange-500" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            TaskDefender
          </h1>
          
          <div className="h-12 mb-8">
            <ReactTypingEffect
              text={[
                "Your Last Line of Defense Against Procrastination",
                "AI-Powered Productivity Assistant",
                "Smart Task Management with Integrity",
                "Focus Sessions with Distraction Tracking",
                "Voice Call Interventions When You Need Them Most"
              ]}
              speed={70}
              eraseSpeed={50}
              typingDelay={1000}
              eraseDelay={2000}
              className="text-2xl font-semibold text-orange-600 dark:text-orange-400"
            />
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            A comprehensive productivity application that helps you overcome procrastination with 
            AI-powered motivation, smart interventions, and secure local storage.
          </p>
          
          <a 
            href="https://app.taskdefender.online" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <span>Go to TaskDefender</span>
            <ArrowRight className="h-6 w-6" />
          </a>
        </div>
      </section>

      {/* Our Inspiration Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Our Inspiration
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* The Problem */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                The Problem No One Wants to Admit
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We all know that feeling: staring at a blank document while guiltily scrolling through social media, 
                promising ourselves we'll start "in just 5 more minutes."
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Traditional productivity apps fail because they're very passive and designed for people who are already motivated. 
                But what about the rest of us - the chronic procrastinators who need more than gentle reminders and pretty interfaces?
              </p>
            </div>

            {/* The Solution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                A Radical New Approach
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                TaskDefender is the accountability partner that fights fire with fire and shame with more shame. 
                Designed by procrastinators for procrastinators, it uses behavioral psychology and escalating consequences 
                to shock users into action.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                This isn't another to-do list app - it's a smart intervention app to help you be more productive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Current Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Task Management",
                description: "Create, organize, and track tasks with priorities and deadlines. Smart task capture with AI suggestions and honesty checkpoints.",
                icon: "🎯"
              },
              {
                title: "Focus Mode",
                description: "Pomodoro-style timer with customizable intervals. Distraction tracking and reporting with session statistics.",
                icon: "⏰"
              },
              {
                title: "AI Sarcasm Engine",
                description: "Multiple personality types for motivation. Contextual prompts based on your behavior and customizable severity levels.",
                icon: "🤖"
              },
              {
                title: "Voice Call Interventions",
                description: "Character-based voice calls for motivation. Integrated with Sarcasm Engine personas and multiple voice options.",
                icon: "📞"
              },
              {
                title: "Analytics & Insights",
                description: "Daily, weekly, and monthly productivity tracking. Streak tracking and integrity scoring with social media sharing.",
                icon: "📊"
              },
              {
                title: "Achievement System",
                description: "Earn badges for productivity milestones. Track streaks and consistency with gamified motivation system.",
                icon: "🏆"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Next Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What's Next for TaskDefender
          </h2>
          
          {/* 4-Phase Escalation System */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-orange-600 dark:text-orange-400 mb-8">
              4-Phase Escalation System
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  phase: "Phase 1",
                  title: "Sarcastic Nudges",
                  description: "Humorous but cutting notifications call out your avoidance.",
                  icon: <Zap className="h-8 w-8" />,
                  color: "bg-yellow-500"
                },
                {
                  phase: "Phase 2",
                  title: "AI Voice Intervention",
                  description: "'Future You' calls to warn about impending consequences.",
                  icon: <Mic className="h-8 w-8" />,
                  color: "bg-orange-500"
                },
                {
                  phase: "Phase 3",
                  title: "Public Accountability",
                  description: "Auto-posts to social media exposing your procrastination.",
                  icon: <Eye className="h-8 w-8" />,
                  color: "bg-red-500"
                },
                {
                  phase: "Phase 4",
                  title: "Financial Consequences",
                  description: "Automatic donations to causes you hate when you slack.",
                  icon: <DollarSign className="h-8 w-8" />,
                  color: "bg-red-700"
                }
              ].map((phase, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                  <div className={`${phase.color} text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                    {phase.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {phase.phase}
                  </h4>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {phase.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Behavioral Pattern Analysis */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl text-white p-8 mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">
              Behavioral Pattern Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Behavioral Science Backed",
                  description: "Uses proven negative reinforcement techniques."
                },
                {
                  title: "Personalized Shame",
                  description: "Learns your specific procrastination patterns."
                },
                {
                  title: "No Easy Opt-Out",
                  description: "Consequences are locked in when you set tasks."
                },
                {
                  title: "Dark Humor",
                  description: "Makes productivity fun through savage honesty."
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white/20 p-3 rounded-lg mb-3">
                    <Brain className="h-6 w-6 mx-auto" />
                  </div>
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-purple-100">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="bg-blue-500 text-white p-3 rounded-full w-12 h-12 mb-4 flex items-center justify-center">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                More Personalized Voice System
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                ElevenLabs AI for personalized voice shaming with custom voice cloning and advanced speech synthesis.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="bg-green-500 text-white p-3 rounded-full w-12 h-12 mb-4 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Payment System for Premium Users
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Algorand blockchain for enforceable financial stakes for premium users who opt-in to financial consequences.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="bg-purple-500 text-white p-3 rounded-full w-12 h-12 mb-4 flex items-center justify-center">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Real-Time System Activity Monitoring
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Smart activity monitoring to detect real procrastination patterns and trigger appropriate interventions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-green-500 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Defend Against Procrastination?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of users who have improved their productivity with TaskDefender.
          </p>
          <a 
            href="https://app.taskdefender.online" 
            className="bg-white text-orange-600 px-8 py-4 rounded-xl text-xl font-semibold hover:bg-gray-100 transition-all duration-200 inline-flex items-center space-x-2 shadow-lg"
          >
            <span>Start Using TaskDefender Now</span>
            <ArrowRight className="h-6 w-6" />
          </a>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Company Logo */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img 
                src="/openart-image_r8J6dat0_1748532422291_raw.png" 
                alt="NoCode Ninjas Solutions" 
                className="h-32 w-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Team
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                NOCODE NINJAS SOLUTIONS
              </span>
              <br />
              Crafting productivity tools with expertise and passion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Solomon Burutu - CTO and Co-founder */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                <img 
                  src="/a 9.png" 
                  alt="Solomon Burutu" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Solomon Burutu
              </h3>
              <p className="text-orange-600 dark:text-orange-400 mb-3">CTO and Co-founder</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Visionary technology leader driving innovation at NoCode Ninjas Solutions. 
                Expert in building scalable productivity solutions and leading technical strategy.
              </p>
            </div>

            {/* Placeholder team members */}
            {[1, 2].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Team Member
                </h3>
                <p className="text-orange-600 dark:text-orange-400 mb-3">Position</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Team member details will be provided later.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <Logo size="sm" className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">TaskDefender</h3>
                  <p className="text-sm text-gray-400">
                    Your Last Line of Defense Against Procrastination
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mt-4 max-w-md">
                TaskDefender is a productivity application designed to help you overcome procrastination
                and achieve your goals with AI-powered motivation.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <a 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block transition-transform duration-200 hover:scale-110"
              >
                <img
                  src="/white_circle_360x360.png"
                  alt="Powered by Bolt.new"
                  className="w-24 h-24 rounded-full"
                />
              </a>
              <p className="text-sm text-gray-400 mt-2">Powered by Bolt.new</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} NOCODE NINJAS SOLUTIONS. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="https://app.taskdefender.online" className="text-gray-400 hover:text-white transition-colors duration-200">
                App
              </a>
              <a href="#team" className="text-gray-400 hover:text-white transition-colors duration-200">
                Team
              </a>
              <a href="#" onClick={() => setIsChatOpen(true)} className="text-gray-400 hover:text-white transition-colors duration-200">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Bot */}
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
    </div>
  );
};

export default LandingPage;