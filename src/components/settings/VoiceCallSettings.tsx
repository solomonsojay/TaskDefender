import React, { useState, useRef } from 'react';
import { 
  PhoneCall, 
  Volume2, 
  Settings, 
  Upload, 
  Mic, 
  Square, 
  Play,
  Save,
  Trash2,
  Edit3
} from 'lucide-react';

interface VoiceSettings {
  enableCalls: boolean;
  callFrequency: 'low' | 'normal' | 'high';
  selectedCharacter: string;
  customCharacterName: string;
  customPrompts: string[];
  customVoiceBlob: Blob | null;
  selectedVoice: string;
  callInterval: number; // minutes
}

const VoiceCallSettings: React.FC = () => {
  const [settings, setSettings] = useState<VoiceSettings>({
    enableCalls: true,
    callFrequency: 'normal',
    selectedCharacter: 'default',
    customCharacterName: 'Custom Assistant',
    customPrompts: [],
    customVoiceBlob: null,
    selectedVoice: 'en-US-female',
    callInterval: 20
  });

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const characters = [
    { id: 'default', name: 'TaskDefender AI', description: 'Your witty productivity assistant' },
    { id: 'mom', name: 'Concerned Mom', description: 'Loving but disappointed maternal figure' },
    { id: 'coach', name: 'Motivational Coach', description: 'Intense motivational speaker' },
    { id: 'custom', name: settings.customCharacterName, description: 'Your personalized assistant' }
  ];

  const voiceOptions = [
    { id: 'en-US-female', name: 'American English (Female)' },
    { id: 'en-US-male', name: 'American English (Male)' },
    { id: 'en-GB-female', name: 'British English (Female)' },
    { id: 'en-GB-male', name: 'British English (Male)' },
    { id: 'en-AU-female', name: 'Australian English (Female)' },
    { id: 'en-AU-male', name: 'Australian English (Male)' },
    { id: 'en-ZA-female', name: 'South African English (Female)' },
    { id: 'en-ZA-male', name: 'South African English (Male)' },
    { id: 'custom', name: 'Custom Voice Recording' }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setSettings(prev => ({ ...prev, customVoiceBlob: audioBlob }));
        setAudioChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handlePromptsUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const prompts = content.split(',').map(p => p.trim()).filter(p => p.length > 0);
        setSettings(prev => ({ ...prev, customPrompts: prompts }));
      };
      reader.readAsText(file);
    }
  };

  const addPrompt = () => {
    if (newPrompt.trim()) {
      setSettings(prev => ({
        ...prev,
        customPrompts: [...prev.customPrompts, newPrompt.trim()]
      }));
      setNewPrompt('');
    }
  };

  const editPrompt = (index: number, newText: string) => {
    setSettings(prev => ({
      ...prev,
      customPrompts: prev.customPrompts.map((prompt, i) => 
        i === index ? newText : prompt
      )
    }));
    setEditingPromptIndex(null);
  };

  const deletePrompt = (index: number) => {
    setSettings(prev => ({
      ...prev,
      customPrompts: prev.customPrompts.filter((_, i) => i !== index)
    }));
  };

  const testVoiceCall = () => {
    const testMessage = settings.selectedCharacter === 'custom' && settings.customPrompts.length > 0
      ? settings.customPrompts[Math.floor(Math.random() * settings.customPrompts.length)]
      : "Hey there! This is a test call from TaskDefender. Time to get back to work and defend against procrastination!";

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(testMessage);
      
      // Try to match voice selection
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => 
        voice.lang.includes(settings.selectedVoice.split('-')[0]) &&
        voice.name.toLowerCase().includes(settings.selectedVoice.includes('female') ? 'female' : 'male')
      );
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      speechSynthesis.speak(utterance);
    } else {
      alert('Speech synthesis not supported in this browser');
    }
  };

  const saveSettings = () => {
    localStorage.setItem('taskdefender_voice_settings', JSON.stringify(settings));
    alert('Voice call settings saved successfully!');
  };

  return (
    <div className="space-y-6">
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

      {/* Basic Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Call Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Enable Voice Calls</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow characters to call you with motivation</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.enableCalls}
                onChange={(e) => setSettings(prev => ({ ...prev, enableCalls: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Call Interval (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.callInterval}
                onChange={(e) => setSettings(prev => ({ ...prev, callInterval: parseInt(e.target.value) || 20 }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Call Frequency
              </label>
              <select
                value={settings.callFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, callFrequency: e.target.value as any }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="low">Low (Less frequent)</option>
                <option value="normal">Normal (Balanced)</option>
                <option value="high">High (More frequent)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Character Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Character Selection
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map(character => (
            <button
              key={character.id}
              onClick={() => setSettings(prev => ({ ...prev, selectedCharacter: character.id }))}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                settings.selectedCharacter === character.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600'
              }`}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white">{character.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{character.description}</p>
            </button>
          ))}
        </div>

        {/* Custom Character Settings */}
        {settings.selectedCharacter === 'custom' && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-4">
              Custom Assistant Settings
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assistant Name
                </label>
                <input
                  type="text"
                  value={settings.customCharacterName}
                  onChange={(e) => setSettings(prev => ({ ...prev, customCharacterName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter custom name"
                />
              </div>

              {/* Custom Prompts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Prompts
                </label>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Add a motivational prompt"
                    />
                    <button
                      onClick={addPrompt}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handlePromptsUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload .txt file</span>
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (comma-separated prompts)
                    </span>
                  </div>

                  {/* Prompts List */}
                  {settings.customPrompts.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {settings.customPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                          {editingPromptIndex === index ? (
                            <input
                              type="text"
                              defaultValue={prompt}
                              onBlur={(e) => editPrompt(index, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  editPrompt(index, e.currentTarget.value);
                                }
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                              autoFocus
                            />
                          ) : (
                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{prompt}</span>
                          )}
                          <button
                            onClick={() => setEditingPromptIndex(index)}
                            className="p-1 text-gray-500 hover:text-blue-500"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deletePrompt(index)}
                            className="p-1 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Voice Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice Selection
            </label>
            <select
              value={settings.selectedVoice}
              onChange={(e) => setSettings(prev => ({ ...prev, selectedVoice: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
            >
              {voiceOptions.map(voice => (
                <option key={voice.id} value={voice.id}>{voice.name}</option>
              ))}
            </select>
          </div>

          {/* Custom Voice Recording */}
          {settings.selectedVoice === 'custom' && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-4">
                Record Custom Voice
              </h4>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isRecording
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
                
                {settings.customVoiceBlob && (
                  <span className="text-sm text-green-600 dark:text-green-400">
                    ✓ Custom voice recorded
                  </span>
                )}
              </div>
              
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                Record a sample phrase that will be used to synthesize your voice for calls
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Test & Save */}
      <div className="flex space-x-4">
        <button
          onClick={testVoiceCall}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors duration-200"
        >
          <Play className="h-4 w-4" />
          <span>Test Voice Call</span>
        </button>
        
        <button
          onClick={saveSettings}
          className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors duration-200"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default VoiceCallSettings;