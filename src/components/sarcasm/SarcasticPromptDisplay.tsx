import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Volume2, 
  VolumeX,
  Zap,
  Crown,
  Heart,
  Briefcase,
  Coffee
} from 'lucide-react';
import { SarcasticPrompt } from '../../services/SarcasticPromptEngine';

interface SarcasticPromptDisplayProps {
  prompt: SarcasticPrompt | null;
  onDismiss: () => void;
  onPersonaChange?: (persona: string) => void;
  currentPersona?: string;
}

const SarcasticPromptDisplay: React.FC<SarcasticPromptDisplayProps> = ({
  prompt,
  onDismiss,
  onPersonaChange,
  currentPersona = 'default'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (prompt) {
      setIsVisible(true);
      // Auto-dismiss after 10 seconds for gentle prompts, 15 for others
      const timeout = prompt.severity === 'gentle' ? 10000 : 15000;
      const timer = setTimeout(() => {
        handleDismiss();
      }, timeout);
      
      return () => clearTimeout(timer);
    }
  }, [prompt]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation
  };

  const speakPrompt = () => {
    if (!prompt || !('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(prompt.message);
    
    // Adjust voice based on persona
    switch (prompt.persona) {
      case 'gordon':
        utterance.rate = 1.2;
        utterance.pitch = 0.8;
        utterance.volume = 0.9;
        break;
      case 'mom':
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        utterance.volume = 0.8;
        break;
      case 'hr':
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.7;
        break;
      default:
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const getPersonaIcon = (persona: string) => {
    switch (persona) {
      case 'gordon': return Crown;
      case 'mom': return Heart;
      case 'hr': return Briefcase;
      case 'passive-aggressive': return Coffee;
      default: return Zap;
    }
  };

  const getPersonaColors = (persona: string) => {
    switch (persona) {
      case 'gordon':
        return {
          bg: 'from-red-500 to-red-600',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-400'
        };
      case 'mom':
        return {
          bg: 'from-pink-500 to-pink-600',
          border: 'border-pink-500',
          text: 'text-pink-700 dark:text-pink-400'
        };
      case 'hr':
        return {
          bg: 'from-blue-500 to-blue-600',
          border: 'border-blue-500',
          text: 'text-blue-700 dark:text-blue-400'
        };
      case 'passive-aggressive':
        return {
          bg: 'from-purple-500 to-purple-600',
          border: 'border-purple-500',
          text: 'text-purple-700 dark:text-purple-400'
        };
      default:
        return {
          bg: 'from-orange-500 to-orange-600',
          border: 'border-orange-500',
          text: 'text-orange-700 dark:text-orange-400'
        };
    }
  };

  const getSeverityAnimation = (severity: string) => {
    switch (severity) {
      case 'savage':
        return 'animate-bounce';
      case 'medium':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  if (!prompt) return null;

  const PersonaIcon = getPersonaIcon(prompt.persona);
  const colors = getPersonaColors(prompt.persona);

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-l-4 ${colors.border} p-6 max-w-sm ${getSeverityAnimation(prompt.severity)}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${colors.bg}`}>
              <PersonaIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                {prompt.persona === 'default' ? 'TaskDefender' : prompt.persona.replace('-', ' ')}
              </h3>
              <span className={`text-xs font-medium ${colors.text}`}>
                {prompt.type.toUpperCase()} • {prompt.severity.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={speakPrompt}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title={isSpeaking ? 'Stop speaking' : 'Speak prompt'}
            >
              {isSpeaking ? (
                <VolumeX className="h-4 w-4 text-gray-500 animate-pulse" />
              ) : (
                <Volume2 className="h-4 w-4 text-gray-500" />
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {prompt.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Prompt #{prompt.id.split('_')[1]}
            </span>
          </div>
          
          {onPersonaChange && (
            <select
              value={currentPersona}
              onChange={(e) => onPersonaChange(e.target.value)}
              className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300"
            >
              <option value="default">Default</option>
              <option value="gordon">Gordon Ramsay</option>
              <option value="mom">Mom</option>
              <option value="hr">Corporate HR</option>
              <option value="passive-aggressive">Passive Aggressive</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default SarcasticPromptDisplay;