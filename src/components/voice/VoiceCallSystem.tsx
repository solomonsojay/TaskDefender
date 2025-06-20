import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Settings,
  User,
  Mic,
  Play
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface VoiceCharacter {
  id: string;
  name: string;
  description: string;
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
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<VoiceCharacter | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [callSettings, setCallSettings] = useState({
    enableCalls: true,
    callFrequency: 'normal' as 'low' | 'normal' | 'high',
    selectedVoiceId: ''
  });

  const characters: VoiceCharacter[] = [
    {
      id: 'default',
      name: 'TaskDefender AI',
      description: 'Your witty productivity assistant',
      scripts: {
        greeting: [
          "Hello there! Your productivity guardian here with a friendly reminder.",
          "Greetings! I've been monitoring your task situation and thought we should chat.",
          "Hey! Your AI assistant calling with some observations about your work patterns."
        ],
        motivation: [
          "Those tasks aren't going to complete themselves, you know.",
          "I see you're practicing the ancient art of productive procrastination.",
          "Time to channel that energy into actual task completion, don't you think?"
        ],
        deadline: [
          "Your deadline is approaching faster than you might think!",
          "Time is ticking, and your tasks are still waiting patiently.",
          "Urgent alert: Your deadline needs some serious attention!"
        ],
        completion: [
          "Excellent work! I knew you had it in you.",
          "Task completed! Your productivity score just got a nice boost.",
          "Well done! That's the kind of progress I like to see."
        ]
      },
      voiceSettings: { rate: 1.0, pitch: 1.0, volume: 0.8, preferredVoice: 'neutral' }
    },
    {
      id: 'mom',
      name: 'Concerned Mom',
      description: 'Loving but disappointed maternal figure',
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
      id: 'coach',
      name: 'Motivational Coach',
      description: 'Intense motivational speaker',
      scripts: {
        greeting: [
          "RIGHT! What are you doing sitting there like that?!",
          "Listen here, champion! Your tasks are waiting for a WINNER!",
          "WHAT ARE YOU WAITING FOR?! Let's GET MOVING!"
        ],
        motivation: [
          "This is your moment! Show those tasks who's BOSS!",
          "I've seen champions move faster than your task completion rate!",
          "GET YOUR HEAD IN THE GAME AND FOCUS!"
        ],
        deadline: [
          "YOUR DEADLINE IS BREATHING DOWN YOUR NECK! MOVE! MOVE! MOVE!",
          "This is CRUNCH TIME! You're running out of time!",
          "WAKE UP! Your deadline isn't going to wait!"
        ],
        completion: [
          "Finally! Some REAL productivity! You've redeemed yourself!",
          "Well done! That's what I'm talking about! More of that!",
          "BRILLIANT! Now that's how you get things done!"
        ]
      },
      voiceSettings: { rate: 1.3, pitch: 0.7, volume: 0.9, preferredVoice: 'male' }
    },
    {
      id: 'british',
      name: 'British Assistant',
      description: 'Polite but firm British assistant',
      scripts: {
        greeting: [
          "Good day! I do hope you're well. Shall we discuss your pending tasks?",
          "Hello there! I'm afraid we need to have a word about your productivity.",
          "Right then, I believe it's time we addressed your task situation."
        ],
        motivation: [
          "I say, those tasks won't complete themselves, will they?",
          "Perhaps it's time to crack on with some proper work?",
          "Come now, let's show these tasks what you're made of!"
        ],
        deadline: [
          "I'm terribly sorry to inform you that your deadline is rather urgent.",
          "Time is of the essence, I'm afraid. Do get a move on!",
          "Your deadline approaches with alarming speed, old chap!"
        ],
        completion: [
          "Splendid work! Absolutely brilliant, if I may say so.",
          "Well done indeed! That's the spirit we like to see.",
          "Excellent! You've done yourself proud there."
        ]
      },
      voiceSettings: { rate: 1.0, pitch: 1.0, volume: 0.8, preferredVoice: 'british' }
    }
  ];

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
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

  const findBestVoice = (character: VoiceCharacter): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    if (selectedVoice) {
      const userVoice = availableVoices.find(voice => voice.name === selectedVoice);
      if (userVoice) return userVoice;
    }

    const preferredGender = character.voiceSettings.preferredVoice;
    
    const matchingVoices = availableVoices.filter(voice => {
      const voiceName = voice.name.toLowerCase();
      const voiceLang = voice.lang.toLowerCase();
      
      if (preferredGender === 'female') {
        return voiceName.includes('female') || voiceName.includes('woman') || 
               voiceName.includes('samantha') || voiceName.includes('victoria') ||
               voiceName.includes('karen') || voiceName.includes('susan') ||
               voiceName.includes('zira') || voiceName.includes('hazel');
      } else if (preferredGender === 'male') {
        return voiceName.includes('male') || voiceName.includes('man') || 
               voiceName.includes('daniel') || voiceName.includes('alex') ||
               voiceName.includes('tom') || voiceName.includes('fred') ||
               voiceName.includes('david') || voiceName.includes('mark');
      } else if (preferredGender === 'british') {
        return voiceLang.includes('en-gb') || voiceName.includes('british') ||
               voiceName.includes('daniel') || voiceName.includes('kate');
      }
      return true;
    });

    if (matchingVoices.length > 0) {
      return matchingVoices[0];
    }

    return availableVoices[0];
  };

  const speakText = (character: VoiceCharacter, text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
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

  const speakScript = (character: VoiceCharacter, type: keyof VoiceCharacter['scripts']) => {
    const scripts = character.scripts[type];
    const script = scripts[Math.floor(Math.random() * scripts.length)];
    speakText(character, script);
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

  const getVoiceInfo = (voice: SpeechSynthesisVoice) => {
    const name = voice.name;
    const lang = voice.lang;
    
    let gender = 'Unknown';
    let accent = lang;
    
    const nameLower = name.toLowerCase();
    if (nameLower.includes('female') || nameLower.includes('woman') || 
        nameLower.includes('samantha') || nameLower.includes('victoria') ||
        nameLower.includes('karen') || nameLower.includes('susan') ||
        nameLower.includes('zira') || nameLower.includes('hazel')) {
      gender = 'Female';
    } else if (nameLower.includes('male') || nameLower.includes('man') || 
               nameLower.includes('daniel') || nameLower.includes('alex') ||
               nameLower.includes('tom') || nameLower.includes('fred') ||
               nameLower.includes('david') || nameLower.includes('mark')) {
      gender = 'Male';
    }
    
    if (lang.startsWith('en-US')) accent = 'American';
    else if (lang.startsWith('en-GB')) accent = 'British';
    else if (lang.startsWith('en-AU')) accent = 'Australian';
    else if (lang.startsWith('en-CA')) accent = 'Canadian';
    else if (lang.startsWith('en-IN')) accent = 'Indian';
    else if (lang.startsWith('en-ZA')) accent = 'South African';
    else if (lang.startsWith('en-IE')) accent = 'Irish';
    else if (lang.startsWith('en')) accent = 'English';
    
    return { gender, accent };
  };

  // Filter voices to show only English variants
  const englishVoices = availableVoices.filter(voice => 
    voice.lang.startsWith('en-') && 
    (voice.lang.includes('US') || voice.lang.includes('GB') || voice.lang.includes('AU') || voice.lang.includes('ZA'))
  );

  return (
    <div className="space-y-6">
      {/* Active Call Interface */}
      {isCallActive && currentCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className={`bg-gray-100 dark:bg-gray-700 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center ${
                isSpeaking ? 'animate-pulse' : ''
              }`}>
                <User className="h-12 w-12 text-orange-500" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Incoming Call
              </h3>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                {currentCharacter.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {currentCharacter.description}
              </p>

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Voice ({englishVoices.length} available)
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="">Default System Voice</option>
              {englishVoices.map(voice => {
                const { gender, accent } = getVoiceInfo(voice);
                return (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({gender} • {accent})
                  </option>
                );
              })}
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

        {englishVoices.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              ⚠️ No English voices detected. Speech synthesis may not be available in your browser or system.
            </p>
          </div>
        )}
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {characters.map(character => (
            <div key={character.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <User className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {character.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{character.description}</p>
                </div>
                
                <div className="flex flex-col space-y-2 w-full">
                  <button
                    onClick={() => testCall(character.id, 'greeting')}
                    className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-xs hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <Play className="h-3 w-3" />
                    <span>Test Call</span>
                  </button>
                  <button
                    onClick={() => testCall(character.id, 'motivation')}
                    className="w-full bg-orange-500 text-white py-2 px-3 rounded-lg text-xs hover:bg-orange-600 transition-colors duration-200"
                  >
                    Motivation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceCallSystem;