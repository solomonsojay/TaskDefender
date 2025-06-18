import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Crown,
  Heart,
  Briefcase,
  Coffee,
  Settings,
  User,
  Mic
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useSarcasticPrompts } from '../../hooks/useSarcasticPrompts';

interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  accent: string;
  description: string;
}

interface VoiceCharacter {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  scripts: {
    greeting: string[];
    motivation: string[];
    deadline: string[];
    completion: string[];
  };
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
    preferredVoice?: string;
  };
}

const VoiceCallSystem: React.FC = () => {
  const { user, tasks } = useApp();
  const { getCriticalTasks, getProcrastinatingTasks } = useSarcasticPrompts();
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<VoiceCharacter | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [callSettings, setCallSettings] = useState({
    enableCalls: true,
    criticalTaskCalls: true,
    procrastinationCalls: true,
    celebrationCalls: true,
    callFrequency: 'normal' as 'low' | 'normal' | 'high',
    selectedVoiceId: ''
  });

  const voiceOptions: VoiceOption[] = [
    {
      id: 'voice1',
      name: 'Professional',
      gender: 'female',
      accent: 'American',
      description: 'Clear, professional female voice'
    },
    {
      id: 'voice2',
      name: 'Friendly',
      gender: 'male',
      accent: 'British',
      description: 'Warm, friendly male voice'
    },
    {
      id: 'voice3',
      name: 'Energetic',
      gender: 'female',
      accent: 'African English',
      description: 'Upbeat, energetic female voice'
    },
    {
      id: 'voice4',
      name: 'Calm',
      gender: 'male',
      accent: 'Canadian',
      description: 'Soothing, calm male voice'
    }
  ];

  const characters: VoiceCharacter[] = [
    {
      id: 'mom',
      name: 'Concerned Mom',
      description: 'Loving but disappointed maternal figure',
      icon: Heart,
      color: 'text-pink-600',
      scripts: {
        greeting: [
          "Hi sweetie, it's Mom. I noticed you haven't been working on your tasks...",
          "Honey, I'm calling because I'm worried about your productivity lately.",
          "Dear, remember what I always said about procrastination? It's like dirty laundry..."
        ],
        motivation: [
          "I know you can do better than this. You're my smart child, remember?",
          "Sweetie, I didn't raise a quitter. Now get back to work!",
          "I'm not angry, I'm just disappointed. Your tasks are waiting for you."
        ],
        deadline: [
          "Honey, your deadline is approaching and I'm getting nervous for you!",
          "Sweetie, time is ticking and Mom is worried. Please focus!",
          "Dear, you know how I feel about last-minute rushes. Get moving!"
        ],
        completion: [
          "I'm so proud of you! I knew you could do it!",
          "That's my child! You make your mother so happy when you succeed.",
          "See? I told you that you were capable of great things!"
        ]
      },
      voiceSettings: { rate: 0.9, pitch: 1.3, volume: 0.8, preferredVoice: 'female' }
    },
    {
      id: 'gordon',
      name: 'Gordon Ramsay',
      description: 'Intense chef with colorful motivation',
      icon: Crown,
      color: 'text-red-600',
      scripts: {
        greeting: [
          "RIGHT! What are you doing sitting there like a muppet?!",
          "Listen here, you donkey! Your tasks are RAW! Absolutely RAW!",
          "WHAT ARE YOU WAITING FOR?! Christmas?! GET MOVING!"
        ],
        motivation: [
          "This is absolutely PATHETIC! You call this productivity?!",
          "I've seen snails move faster than your task completion rate!",
          "GET YOUR HEAD OUT OF THE CLOUDS AND FOCUS!"
        ],
        deadline: [
          "YOUR DEADLINE IS BREATHING DOWN YOUR NECK! MOVE! MOVE! MOVE!",
          "This is a DISASTER! You're running out of time like a headless chicken!",
          "WAKE UP! Your deadline isn't going to wait for your beauty sleep!"
        ],
        completion: [
          "Finally! Some good productivity! You've redeemed yourself... barely.",
          "Well done! That's what I'm talking about! More of that!",
          "BRILLIANT! Now that's how you get things done properly!"
        ]
      },
      voiceSettings: { rate: 1.3, pitch: 0.7, volume: 0.9, preferredVoice: 'male' }
    },
    {
      id: 'hr',
      name: 'Corporate HR',
      description: 'Professional buzzword enthusiast',
      icon: Briefcase,
      color: 'text-blue-600',
      scripts: {
        greeting: [
          "Hi there! This is a courtesy call regarding your task completion metrics.",
          "Good day! We need to circle back on your deliverable timeline.",
          "Hello! I'm reaching out to touch base about your productivity KPIs."
        ],
        motivation: [
          "We need to leverage your core competencies to drive results.",
          "Let's synergize your efforts to maximize your output potential.",
          "It's time to think outside the box and move the needle on these tasks."
        ],
        deadline: [
          "Per our timeline analysis, we're seeing some concerning metrics around your deliverables.",
          "We need to escalate this to ensure we meet our committed deadlines.",
          "This is a high-priority action item that requires immediate bandwidth allocation."
        ],
        completion: [
          "Excellent work! This really moves the needle on our productivity metrics.",
          "Outstanding! You've exceeded expectations and delivered value-added results.",
          "Great job! This aligns perfectly with our strategic objectives."
        ]
      },
      voiceSettings: { rate: 1.0, pitch: 1.0, volume: 0.7, preferredVoice: 'female' }
    },
    {
      id: 'passive-aggressive',
      name: 'Passive Aggressive Friend',
      description: 'Subtly judgmental with backhanded compliments',
      icon: Coffee,
      color: 'text-purple-600',
      scripts: {
        greeting: [
          "Oh hi! Don't mind me calling, I just thought you might want to know about your tasks...",
          "Hey there! I hope I'm not interrupting your... busy schedule.",
          "Hi! I was just wondering if you remembered you have things to do today..."
        ],
        motivation: [
          "I mean, I'm sure you have your reasons for not working on your tasks...",
          "It's totally fine that you're taking your time. Some people work differently.",
          "Oh, you're still on that task? That's... interesting. Take your time!"
        ],
        deadline: [
          "I'm sure you're aware your deadline is coming up. Not that I'm worried or anything.",
          "Just thought you should know time is running out. But I'm sure you have it handled!",
          "Your deadline is approaching, but hey, you probably work better under pressure, right?"
        ],
        completion: [
          "Wow, you actually finished! I mean, it only took forever, but who's counting?",
          "Look at you being all productive! Better late than never, I suppose.",
          "Congratulations! You did the thing you were supposed to do. Amazing!"
        ]
      },
      voiceSettings: { rate: 0.95, pitch: 1.1, volume: 0.8, preferredVoice: 'female' }
    }
  ];

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice if none selected
      if (!selectedVoice && voices.length > 0) {
        const defaultVoice = voices.find(voice => voice.default) || voices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskdefender_voice_settings');
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        setCallSettings(savedSettings);
        if (savedSettings.selectedVoiceId) {
          setSelectedVoice(savedSettings.selectedVoiceId);
        }
      } catch (error) {
        console.error('Failed to load voice settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    const settingsToSave = {
      ...callSettings,
      selectedVoiceId: selectedVoice
    };
    localStorage.setItem('taskdefender_voice_settings', JSON.stringify(settingsToSave));
  }, [callSettings, selectedVoice]);

  // Check for call triggers
  useEffect(() => {
    if (!callSettings.enableCalls) return;

    const checkForCalls = () => {
      const criticalTasks = getCriticalTasks();
      const procrastinatingTasks = getProcrastinatingTasks();

      // Critical task calls
      if (callSettings.criticalTaskCalls && criticalTasks.length > 0) {
        const shouldCall = Math.random() < 0.3; // 30% chance
        if (shouldCall) {
          initiateCall('deadline');
        }
      }

      // Procrastination calls
      if (callSettings.procrastinationCalls && procrastinatingTasks.length > 0) {
        const shouldCall = Math.random() < 0.2; // 20% chance
        if (shouldCall) {
          initiateCall('motivation');
        }
      }
    };

    // Check based on frequency setting
    const intervals = {
      low: 30 * 60 * 1000,    // 30 minutes
      normal: 20 * 60 * 1000, // 20 minutes
      high: 10 * 60 * 1000    // 10 minutes
    };

    const interval = setInterval(checkForCalls, intervals[callSettings.callFrequency]);
    return () => clearInterval(interval);
  }, [callSettings, getCriticalTasks, getProcrastinatingTasks]);

  const initiateCall = (type: 'greeting' | 'motivation' | 'deadline' | 'completion') => {
    if (isCallActive || !('speechSynthesis' in window)) return;

    // Select random character
    const character = characters[Math.floor(Math.random() * characters.length)];
    setCurrentCharacter(character);
    setIsCallActive(true);

    // Start speaking after a short delay
    setTimeout(() => {
      speakScript(character, type);
    }, 1000);
  };

  const speakScript = (character: VoiceCharacter, type: keyof VoiceCharacter['scripts']) => {
    const scripts = character.scripts[type];
    const script = scripts[Math.floor(Math.random() * scripts.length)];

    const utterance = new SpeechSynthesisUtterance(script);
    
    // Find the best voice for this character
    const voice = findBestVoice(character);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = character.voiceSettings.rate;
    utterance.pitch = character.voiceSettings.pitch;
    utterance.volume = character.voiceSettings.volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // End call after speaking
      setTimeout(() => {
        endCall();
      }, 2000);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      endCall();
    };

    window.speechSynthesis.speak(utterance);
  };

  const findBestVoice = (character: VoiceCharacter): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    // First try to use the user's selected voice
    if (selectedVoice) {
      const userVoice = availableVoices.find(voice => voice.name === selectedVoice);
      if (userVoice) return userVoice;
    }

    // Fallback to character's preferred voice type
    const preferredGender = character.voiceSettings.preferredVoice;
    
    // Try to find a voice that matches the character
    const matchingVoices = availableVoices.filter(voice => {
      const voiceName = voice.name.toLowerCase();
      if (preferredGender === 'female') {
        return voiceName.includes('female') || voiceName.includes('woman') || 
               voiceName.includes('samantha') || voiceName.includes('victoria') ||
               voiceName.includes('karen') || voiceName.includes('susan');
      } else {
        return voiceName.includes('male') || voiceName.includes('man') || 
               voiceName.includes('daniel') || voiceName.includes('alex') ||
               voiceName.includes('tom') || voiceName.includes('fred');
      }
    });

    if (matchingVoices.length > 0) {
      return matchingVoices[0];
    }

    // Final fallback to any available voice
    return availableVoices[0];
  };

  const endCall = () => {
    window.speechSynthesis.cancel();
    setIsCallActive(false);
    setCurrentCharacter(null);
    setIsSpeaking(false);
  };

  const testCall = (characterId: string, type: keyof VoiceCharacter['scripts']) => {
    const character = characters.find(c => c.id === characterId);
    if (character) {
      setCurrentCharacter(character);
      setIsCallActive(true);
      setTimeout(() => speakScript(character, type), 500);
    }
  };

  const testVoice = () => {
    if (!selectedVoice) return;
    
    const utterance = new SpeechSynthesisUtterance("Hello! This is a test of the selected voice. How do I sound?");
    const voice = availableVoices.find(v => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Active Call Interface */}
      {isCallActive && currentCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Character Avatar */}
              <div className={`bg-gray-100 dark:bg-gray-700 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center ${
                isSpeaking ? 'animate-pulse' : ''
              }`}>
                <currentCharacter.icon className={`h-12 w-12 ${currentCharacter.color}`} />
              </div>

              {/* Call Info */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Incoming Call
              </h3>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                {currentCharacter.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {currentCharacter.description}
              </p>

              {/* Call Status */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                {isSpeaking ? (
                  <>
                    <Volume2 className="h-5 w-5 text-green-500 animate-pulse" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Speaking...</span>
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5 text-blue-500" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Connected</span>
                  </>
                )}
              </div>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors duration-200"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-500/20 p-3 rounded-xl">
          <PhoneCall className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Voice Call Interventions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure motivational calls from different characters
          </p>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Mic className="h-5 w-5 text-blue-500" />
          <span>Voice Selection</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Voice
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">Default System Voice</option>
              {availableVoices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={testVoice}
              disabled={!selectedVoice}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Voice
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {voiceOptions.map(voice => (
            <div key={voice.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-2">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">{voice.name}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{voice.gender} • {voice.accent}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{voice.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Call Settings
        </h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Enable Voice Calls</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow characters to call you with motivation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={callSettings.enableCalls}
                onChange={(e) => setCallSettings(prev => ({ ...prev, enableCalls: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Critical Tasks</span>
              <input
                type="checkbox"
                checked={callSettings.criticalTaskCalls}
                onChange={(e) => setCallSettings(prev => ({ ...prev, criticalTaskCalls: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Procrastination</span>
              <input
                type="checkbox"
                checked={callSettings.procrastinationCalls}
                onChange={(e) => setCallSettings(prev => ({ ...prev, procrastinationCalls: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Celebrations</span>
              <input
                type="checkbox"
                checked={callSettings.celebrationCalls}
                onChange={(e) => setCallSettings(prev => ({ ...prev, celebrationCalls: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Call Frequency
            </label>
            <select
              value={callSettings.callFrequency}
              onChange={(e) => setCallSettings(prev => ({ ...prev, callFrequency: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="low">Low (Every 30 minutes)</option>
              <option value="normal">Normal (Every 20 minutes)</option>
              <option value="high">High (Every 10 minutes)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Character Previews */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Characters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map(character => (
            <div key={character.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <character.icon className={`h-5 w-5 ${character.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{character.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{character.description}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => testCall(character.id, 'greeting')}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-600 transition-colors duration-200"
                >
                  Test Call
                </button>
                <button
                  onClick={() => testCall(character.id, 'motivation')}
                  className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-orange-600 transition-colors duration-200"
                >
                  Motivation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceCallSystem;