import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share2, 
  ExternalLink,
  Copy,
  CheckCircle,
  Settings,
  Link as LinkIcon,
  Unlink
} from 'lucide-react';

interface SocialAccount {
  platform: 'twitter' | 'linkedin' | 'facebook';
  connected: boolean;
  username?: string;
  profileUrl?: string;
}

interface SocialMediaIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  analyticsData: any;
  period: string;
}

const SocialMediaIntegration: React.FC<SocialMediaIntegrationProps> = ({
  isOpen,
  onClose,
  shareText,
  analyticsData,
  period
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'connect'>('share');
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: 'twitter', connected: false },
    { platform: 'linkedin', connected: false },
    { platform: 'facebook', connected: false }
  ]);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = () => {
    const saved = localStorage.getItem('taskdefender_social_accounts');
    if (saved) {
      try {
        setAccounts(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load social accounts:', error);
      }
    }
  };

  const saveAccounts = (newAccounts: SocialAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('taskdefender_social_accounts', JSON.stringify(newAccounts));
  };

  const connectAccount = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    // Mock connection - in real app, this would use OAuth
    const mockUsernames = {
      twitter: '@productivity_hero',
      linkedin: 'productivity-champion',
      facebook: 'productivity.master'
    };

    const mockUrls = {
      twitter: 'https://twitter.com/productivity_hero',
      linkedin: 'https://linkedin.com/in/productivity-champion',
      facebook: 'https://facebook.com/productivity.master'
    };

    const updatedAccounts = accounts.map(account => 
      account.platform === platform 
        ? { 
            ...account, 
            connected: true, 
            username: mockUsernames[platform],
            profileUrl: mockUrls[platform]
          }
        : account
    );

    saveAccounts(updatedAccounts);
  };

  const disconnectAccount = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const updatedAccounts = accounts.map(account => 
      account.platform === platform 
        ? { platform, connected: false }
        : account
    );

    saveAccounts(updatedAccounts);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const encodedText = encodeURIComponent(shareText);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      default:
        return <Share2 className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'linkedin': return 'text-blue-700 bg-blue-50 dark:bg-blue-900/20';
      case 'facebook': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Your Progress</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === 'share'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Share Progress
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
              activeTab === 'connect'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Connect Accounts
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
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

              {/* Social Platforms */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Share to Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {accounts.map(account => (
                    <button
                      key={account.platform}
                      onClick={() => shareToSocial(account.platform)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        account.connected
                          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className={`p-3 rounded-lg mb-3 ${getPlatformColor(account.platform)}`}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize mb-1">
                        {account.platform}
                      </h4>
                      {account.connected ? (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Connected as {account.username}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Not connected
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-center space-x-1 text-blue-600 dark:text-blue-400">
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-xs">Share</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Social Media Accounts</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  Connect your social media accounts for easier sharing of your productivity achievements.
                </p>
              </div>

              <div className="space-y-4">
                {accounts.map(account => (
                  <div key={account.platform} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getPlatformColor(account.platform)}`}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                          {account.platform}
                        </h4>
                        {account.connected ? (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Connected as {account.username}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Not connected
                          </div>
                        )}
                      </div>
                    </div>

                    {account.connected ? (
                      <div className="flex items-center space-x-2">
                        {account.profileUrl && (
                          <a
                            href={account.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                            title="View Profile"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => disconnectAccount(account.platform)}
                          className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors duration-200"
                        >
                          <Unlink className="h-4 w-4" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => connectAccount(account.platform)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                      Privacy & Security
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Your social media connections are stored locally and used only for sharing. 
                      We never post without your explicit permission.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaIntegration;