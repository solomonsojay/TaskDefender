import React, { useState, useEffect } from 'react';
import { 
  X, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Copy,
  CheckCircle,
  Code,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  period: 'weekly' | 'monthly' | 'yearly';
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({ 
  isOpen, 
  onClose, 
  shareText,
  period
}) => {
  const { user } = useApp();
  const [copied, setCopied] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Load connected accounts from localStorage
    const saved = localStorage.getItem('taskdefender_social_accounts');
    if (saved) {
      try {
        const accounts = JSON.parse(saved);
        setConnectedAccounts(accounts.filter((account: any) => account.connected));
      } catch (error) {
        console.error('Failed to load social accounts:', error);
      }
    }
  }, []);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const currentUrl = encodeURIComponent(window.location.href);
    
    const urls: {[key: string]: string} = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&hashtags=TaskDefender,Productivity`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}&summary=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`,
      devto: `https://dev.to/new?title=${encodeURIComponent(`My ${period.charAt(0).toUpperCase() + period.slice(1)} Productivity Report`)}&body=${encodedText}&tags=productivity,taskdefender,goals`
    };

    // Open in new window
    const shareWindow = window.open(
      urls[platform], 
      'share-window',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );

    // Focus the share window
    if (shareWindow) {
      shareWindow.focus();
    }
  };

  const directShare = async (platform: string) => {
    // Use Web Share API if available
    if (navigator.share && platform === 'native') {
      try {
        await navigator.share({
          title: `My ${period} TaskDefender Report`,
          text: shareText,
          url: window.location.href
        });
        return;
      } catch (error) {
        console.log('Web Share API failed, falling back to platform sharing');
      }
    }

    shareToSocial(platform);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      case 'devto':
        return <Code className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'X (Twitter)';
      case 'linkedin': return 'LinkedIn';
      case 'facebook': return 'Facebook';
      case 'devto': return 'Dev.to';
      default: return platform;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'bg-blue-500 hover:bg-blue-600';
      case 'linkedin': return 'bg-blue-700 hover:bg-blue-800';
      case 'facebook': return 'bg-blue-600 hover:bg-blue-700';
      case 'devto': return 'bg-black hover:bg-gray-800';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Available platforms for direct sharing
  const availablePlatforms = [
    { id: 'twitter', name: 'X (Twitter)', icon: Twitter, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700 hover:bg-blue-800' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'devto', name: 'Dev.to', icon: Code, color: 'bg-black hover:bg-gray-800' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Share Your Progress
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Preview</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                {shareText}
              </pre>
            </div>
            <button
              onClick={copyToClipboard}
              className="mt-3 flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          {/* Native Web Share (if available) */}
          {navigator.share && (
            <div className="mb-6">
              <button
                onClick={() => directShare('native')}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-colors duration-200"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Share via Device</span>
              </button>
            </div>
          )}

          {/* Direct Platform Sharing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Share Directly</h3>
            
            <div className="grid grid-cols-1 gap-3">
              {availablePlatforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => directShare(platform.id)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white transition-colors duration-200 ${platform.color}`}
                >
                  <platform.icon className="h-5 w-5" />
                  <span>Share to {platform.name}</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Connected Accounts Section */}
          {connectedAccounts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Connected Accounts</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {connectedAccounts.map((account) => (
                  <button
                    key={account.platform}
                    onClick={() => directShare(account.platform)}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white transition-colors duration-200 ${getPlatformColor(account.platform)}`}
                  >
                    {getPlatformIcon(account.platform)}
                    <span>Share to {getPlatformName(account.platform)}</span>
                    <span className="text-xs opacity-75">({account.username})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
              💡 Sharing Tips
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
              <li>• Share your progress to stay accountable</li>
              <li>• Inspire others with your productivity journey</li>
              <li>• Use hashtags like #TaskDefender #Productivity</li>
              <li>• Connect accounts in Settings for easier sharing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;