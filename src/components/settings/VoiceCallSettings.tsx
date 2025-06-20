import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Settings,
  User,
  Mic,
  Play,
  Upload,
  Plus,
  Save,
  Trash2
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

interface CustomAssistant {
  name: string;
  prompts: string[];
  recordedVoice?: string; // Base64 encoded audio
}

const VoiceCallSettings: React.FC = () => {
  const { user } = useApp();
  const [isCallActive, setIsCallActive] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<VoiceCharacter | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [callSettings, setCallSettings] = useState({
    enableCalls: true,
    callFrequency: 'normal' as 'low' | 'normal' | 'high',
    selectedVoiceId: '',
    selectedCharacter: 'default'
  });
  const [customAssistant, setCustomAssistant] = useState<CustomAssistant>({
    name: 'Custom Assistant',
    prompts: [],
  });
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [promptsText, setPromptsText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      id: 'custom',
      name: 'Custom Assistant',
      description: 'Your personalized assistant with custom voice',
      scripts: {
        greeting: customAssistant.prompts.slice(0, 3),
        motivation: customAssistant.prompts.slice(3, 6),
        deadline: customAssistant.prompts.slice(6, 9),
        completion: customAssistant.prompts.slice(9, 12)
      },
      voiceSettings: { rate: 1.0, pitch: 1.0, volume: 0.8 }
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

    const savedCustom = localStorage.getItem('taskdefender_custom_assistant');
    if (savedCustom) {
      try {
        setCustomAssistant(JSON.parse(savedCustom));
      } catch (error) {
        console.error('Failed to load custom assistant:', error);
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

  // Save custom assistant to localStorage
  useEffect(() => {
    localStorage.setItem('taskdefender_custom_assistant', JSON.stringify(customAssistant));
  }, [customAssistant]);

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
      }
      return true;
    });

    if (matchingVoices.length > 0) {
      return matchingVoices[0];
    }

    return availableVoices[0];
  };

  const speakText = (character: VoiceCharacter, text: string) => {
    if (character.id === 'custom' && customAssistant.recordedVoice) {
      // Play recorded voice
      const audio = new Audio(customAssistant.recordedVoice);
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        setTimeout(() => endCall(), 2000);
      };
      audio.play().catch(err => {
        console.error('Error playing recorded voice:', err);
        setIsSpeaking(false);
        endCall();
      });
      return;
    }

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
    if (!scripts || scripts.length === 0) {
      speakText(character, "No script available for this character and type.");
      return;
    }
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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setCustomAssistant(prev => ({
            ...prev,
            recordedVoice: base64data
          }));
        };
        setIsRecording(false);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSaveCustomAssistant = () => {
    const prompts = promptsText.split(',').map(p => p.trim()).filter(p => p);
    setCustomAssistant(prev => ({
      ...prev,
      prompts
    }));
    setIsEditingCustom(false);
  };

  const handleDeleteRecording = () => {
    setCustomAssistant(prev => ({
      ...prev,
      recordedVoice: undefined
    }));
  };

  const playRecordedVoice = () => {
    if (customAssistant.recordedVoice) {
      const audio = new Audio(customAssistant.recordedVoice);
      audio.play().catch(err => console.error('Error playing recorded voice:', err));
    }
  };

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
            Voice Call Settings
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Character
            </label>
            <select
              value={callSettings.selectedCharacter}
              onChange={(e) => setCallSettings(prev => ({ ...prev, selectedCharacter: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
            >
              {characters.map(character => (
                <option key={character.id} value={character.id}>{character.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Custom Assistant */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
          <span>Custom Assistant</span>
          {!isEditingCustom && (
            <button
              onClick={() => setIsEditingCustom(true)}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Edit
            </button>
          )}
        </h3>

        {isEditingCustom ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assistant Name
              </label>
              <input
                type="text"
                value={customAssistant.name}
                onChange={(e) => setCustomAssistant(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Custom Assistant Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Prompts (separate by commas)
              </label>
              <textarea
                value={promptsText}
                onChange={(e) => setPromptsText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                rows={5}
                placeholder="Enter prompts separated by commas, e.g.: Time to work!, Focus on your tasks!, Don't procrastinate!"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add at least 4 prompts for variety. These will be used for different call types.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Voice Recording
              </label>
              
              {customAssistant.recordedVoice ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={playRecordedVoice}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Play className="h-4 w-4" />
                    <span>Play</span>
                  </button>
                  <button
                    onClick={handleDeleteRecording}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {isRecording ? (
                    <button
                      onClick={handleStopRecording}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2 animate-pulse"
                    >
                      <span>Stop Recording</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartRecording}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Mic className="h-4 w-4" />
                      <span>Record Voice</span>
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Record a short sample of your voice to be used for calls. If not provided, system voice will be used.
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setIsEditingCustom(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomAssistant}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Assistant</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{customAssistant.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Your personalized assistant</p>
              
              {customAssistant.prompts.length > 0 ? (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sample Prompts:</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                    {customAssistant.prompts.slice(0, 3).map((prompt, index) => (
                      <li key={index}>{prompt}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  No custom prompts added yet. Click Edit to add prompts.
                </p>
              )}

              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice:</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {customAssistant.recordedVoice ? 'Custom recorded voice' : 'Using system voice'}
                </p>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => testCall('custom', 'greeting')}
                  disabled={customAssistant.prompts.length === 0}
                  className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Character Previews */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Characters
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.filter(c => c.id !== 'custom').map(character => (
            <div key={character.id} className={`bg-gray-50 dark:bg-gray-700 rounded-xl p-4 ${
              callSettings.selectedCharacter === character.id ? 'ring-2 ring-orange-500' : ''
            }`}>
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
                    onClick={() => setCallSettings(prev => ({ ...prev, selectedCharacter: character.id }))}
                    className={`w-full py-2 px-3 rounded-lg text-xs transition-colors duration-200 ${
                      callSettings.selectedCharacter === character.id
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {callSettings.selectedCharacter === character.id ? 'Selected' : 'Select'}
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

export default VoiceCallSettings;