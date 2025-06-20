import React, { useState, useEffect } from 'react';
import { 
  X, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Copy,
  CheckCircle,
  Code
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
    const urls: {[key: string]: string} = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`,
      devto: `https://dev.to/new?title=${encodeURIComponent(`My ${period.charAt(0).toUpperCase() + period.slice(1)} Productivity Report`)}&body=${encodedText}&tags=productivity,taskdefender`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
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

          {/* Connected Accounts */}
          {connectedAccounts.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Share to Connected Accounts</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {connectedAccounts.map((account) => (
                  <button
                    key={account.platform}
                    onClick={() => shareToSocial(account.platform)}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white transition-colors duration-200 ${getPlatformColor(account.platform)}`}
                  >
                    {getPlatformIcon(account.platform)}
                    <span>Share to {getPlatformName(account.platform)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No connected social media accounts found.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Connect your accounts in Settings → Social Media to share your progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;