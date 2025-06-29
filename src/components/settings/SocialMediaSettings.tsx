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
  authUrl: string;
  scope: string;
  clientId: string;
  redirectUri: string;
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

  // Platform configurations for OAuth
  const platformConfigs: SocialPlatformConfig[] = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      scope: 'tweet.read tweet.write users.read',
      clientId: import.meta.env.VITE_TWITTER_API_KEY || '',
      redirectUri: `${window.location.origin}/auth/twitter/callback`
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20',
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      scope: 'r_liteprofile w_member_social',
      clientId: '',
      redirectUri: `${window.location.origin}/auth/linkedin/callback`
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      scope: 'pages_manage_posts,pages_read_engagement',
      clientId: '',
      redirectUri: `${window.location.origin}/auth/facebook/callback`
    },
    {
      id: 'devto',
      name: 'Dev.to',
      icon: Code,
      color: 'text-black bg-gray-50 dark:bg-gray-900/20',
      authUrl: '', // Dev.to uses API key authentication
      scope: '',
      clientId: '',
      redirectUri: ''
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

      if (platform === 'devto') {
        // Dev.to uses API key authentication
        // Simulate successful connection
        const updatedAccounts = accounts.map(account => 
          account.platform === platform 
            ? { 
                ...account, 
                connected: true, 
                username: 'dev-user',
                profileUrl: `https://dev.to/dev-user`
              }
            : account
        );
        saveAccounts(updatedAccounts);
        return;
      }

      // For Twitter, use the API key from environment variables
      if (platform === 'twitter') {
        if (!config.clientId) {
          throw new Error('Twitter API key not found in environment variables');
        }
        
        console.log('Connecting to Twitter with API key:', config.clientId);
        
        // Simulate successful Twitter connection using the provided API key
        const updatedAccounts = accounts.map(account => 
          account.platform === platform 
            ? { 
                ...account, 
                connected: true, 
                username: '@productivity_hero',
                profileUrl: 'https://twitter.com/productivity_hero',
                accessToken: 'simulated-token-' + Math.random().toString(36).substring(2)
              }
            : account
        );
        saveAccounts(updatedAccounts);
        return;
      }

      // OAuth flow for other platforms
      if (!config.clientId) {
        throw new Error(`Client ID not configured for ${config.name}`);
      }

      // Generate state parameter for security
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(`oauth_state_${platform}`, state);

      // Build OAuth URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scope,
        response_type: 'code',
        state: state
      });

      const authUrl = `${config.authUrl}?${params.toString()}`;
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        `${platform}_oauth`,
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check if authentication was successful
          setTimeout(() => {
            checkAuthResult(platform);
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      alert(`Failed to connect to ${platform}. Please try again later.`);
    } finally {
      setConnecting(null);
    }
  };

  const checkAuthResult = (platform: string) => {
    // In a real implementation, this would check for the OAuth callback result
    // For now, we'll simulate a successful connection
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
            username: mockUsernames[platform as keyof typeof mockUsernames],
            profileUrl: mockUrls[platform as keyof typeof mockUrls],
            accessToken: 'simulated-token-' + Math.random().toString(36).substring(2)
          }
        : account
    );

    saveAccounts(updatedAccounts);
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
    </div>
  );
};

export default SocialMediaSettings;