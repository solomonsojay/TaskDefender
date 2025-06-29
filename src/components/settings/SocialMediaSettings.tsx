import React, { useState, useEffect } from 'react';
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  Copy,
  CheckCircle,
  Settings,
  Code,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { functions } from '../../config/firebase';
import { httpsCallable } from 'firebase/functions';

interface SocialAccount {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'devto';
  connected: boolean;
  username?: string;
  profileUrl?: string;
  accessToken?: string;
  refreshToken?: string;
}

interface SocialPlatformConfig {
  id: 'twitter' | 'linkedin' | 'facebook' | 'devto';
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  functionName: string;
}

const SocialMediaSettings: React.FC = () => {
  const { user } = useApp();
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: 'twitter', connected: false },
    { platform: 'linkedin', connected: false },
    { platform: 'facebook', connected: false },
    { platform: 'devto', connected: false }
  ]);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  // Platform configurations for Firebase Functions
  const platformConfigs: SocialPlatformConfig[] = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      functionName: 'connectTwitter'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20',
      functionName: 'connectLinkedIn'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      functionName: 'connectFacebook'
    },
    {
      id: 'devto',
      name: 'Dev.to',
      icon: Code,
      color: 'text-black bg-gray-50 dark:bg-gray-900/20',
      functionName: 'connectDevTo'
    }
  ];

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = () => {
    try {
      const saved = localStorage.getItem('taskdefender_social_accounts');
      if (saved) {
        setAccounts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load social accounts:', error);
    }
  };

  const saveAccounts = (newAccounts: SocialAccount[]) => {
    try {
      setAccounts(newAccounts);
      localStorage.setItem('taskdefender_social_accounts', JSON.stringify(newAccounts));
    } catch (error) {
      console.error('Failed to save social accounts:', error);
    }
  };

  const connectAccount = async (platform: 'twitter' | 'linkedin' | 'facebook' | 'devto') => {
    setConnecting(platform);
    
    try {
      const config = platformConfigs.find(p => p.id === platform);
      if (!config) {
        throw new Error(`Platform configuration not found for ${platform}`);
      }

      if (!functions) {
        throw new Error('Firebase Functions not available');
      }

      // Call Firebase Function to connect to social media
      const connectFunction = httpsCallable(functions, config.functionName);
      const result = await connectFunction({});
      
      const data = result.data as any;
      
      if (data.success) {
        // Update account status
        const updatedAccounts = accounts.map(account => 
          account.platform === platform 
            ? { 
                ...account, 
                connected: true, 
                username: data.user.username || data.user.name,
                profileUrl: data.user.profileUrl
              }
            : account
        );
        saveAccounts(updatedAccounts);
        
        console.log(`✅ Successfully connected to ${config.name}`);
      } else {
        throw new Error(data.error || 'Connection failed');
      }

    } catch (error: any) {
      console.error(`Error connecting to ${platform}:`, error);
      
      let errorMessage = `Failed to connect to ${platform}. `;
      
      if (error.message?.includes('Bearer Token not configured')) {
        errorMessage += 'API credentials not configured in Firebase. Please contact support.';
      } else if (error.message?.includes('API error')) {
        errorMessage += 'API authentication failed. Please try again later.';
      } else {
        errorMessage += 'Please try again later.';
      }
      
      alert(errorMessage);
    } finally {
      setConnecting(null);
    }
  };

  const disconnectAccount = (platform: 'twitter' | 'linkedin' | 'facebook' | 'devto') => {
    const updatedAccounts = accounts.map(account => 
      account.platform === platform 
        ? { platform, connected: false }
        : account
    );

    saveAccounts(updatedAccounts);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    const config = platformConfigs.find(p => p.id === platform);
    return config ? <config.icon className="h-5 w-5" /> : <LinkIcon className="h-5 w-5" />;
  };

  const getPlatformColor = (platform: string) => {
    const config = platformConfigs.find(p => p.id === platform);
    return config ? config.color : 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
  };

  const getPlatformName = (platform: string) => {
    const config = platformConfigs.find(p => p.id === platform);
    return config ? config.name : platform;
  };

  const generateShareText = () => {
    return `🎯 Productivity Update from TaskDefender!\n\n✅ Tasks Completed: ${Math.floor(Math.random() * 10) + 5}\n⏰ Focus Time: ${Math.floor(Math.random() * 8) + 2}h\n📈 Productivity: ${Math.floor(Math.random() * 20) + 80}%\n🔥 Streak: ${user?.streak || 7} days\n\n#ProductivityJourney #TaskDefender #GetThingsDone`;
  };

  const shareToSocial = (platform: 'twitter' | 'linkedin' | 'facebook' | 'devto') => {
    const shareText = generateShareText();
    const encodedText = encodeURIComponent(shareText);
    const currentUrl = encodeURIComponent(window.location.href);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&hashtags=TaskDefender,Productivity`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}&summary=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${encodedText}`,
      devto: `https://dev.to/new?title=${encodeURIComponent("My Productivity Journey")}&body=${encodedText}&tags=productivity,taskdefender`
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Social Media Integration
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Connect your social media accounts to easily share your productivity achievements
        </p>
      </div>

      {/* API Configuration Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
              API Configuration
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-2">
              Social media connections are powered by secure Firebase backend functions. 
              API credentials are managed server-side for security.
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400">
              If you encounter connection issues, please contact support for API configuration assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">Social Media Accounts</h4>
        
        {accounts.map(account => (
          <div key={account.platform} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${getPlatformColor(account.platform)}`}>
                {getPlatformIcon(account.platform)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {getPlatformName(account.platform)}
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
                  onClick={() => shareToSocial(account.platform)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>Share</span>
                </button>
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
                disabled={connecting === account.platform}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-70"
              >
                {connecting === account.platform ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                <span>{connecting === account.platform ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Share Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Share Preview</h4>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Sample Share Content</h5>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
            {generateShareText()}
          </pre>
        </div>
        
        <button
          onClick={() => copyToClipboard(generateShareText())}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
        >
          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
        </button>
      </div>

      {/* Firebase Functions Info */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Secure Backend Integration</span>
        </h4>
        <ul className="space-y-2 text-green-600 dark:text-green-300 text-sm">
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>All social media connections are handled by secure Firebase Cloud Functions</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>API keys and bearer tokens are stored securely in Firebase configuration</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>CORS is properly configured for secure cross-origin requests</span>
          </li>
          <li className="flex items-start space-x-2">
            <span>•</span>
            <span>No sensitive credentials are exposed to the frontend application</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SocialMediaSettings;