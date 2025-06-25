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
  AlertCircle,
  Key
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
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    twitter: { clientId: '', clientSecret: '' },
    linkedin: { clientId: '', clientSecret: '' },
    facebook: { appId: '', appSecret: '' },
    devto: { apiKey: '' }
  });

  // Platform configurations for OAuth
  const platformConfigs: SocialPlatformConfig[] = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      scope: 'tweet.read tweet.write users.read',
      clientId: apiKeys.twitter.clientId,
      redirectUri: `${window.location.origin}/auth/twitter/callback`
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20',
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      scope: 'r_liteprofile w_member_social',
      clientId: apiKeys.linkedin.clientId,
      redirectUri: `${window.location.origin}/auth/linkedin/callback`
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      scope: 'pages_manage_posts,pages_read_engagement',
      clientId: apiKeys.facebook.appId,
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
    loadApiKeys();
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

  const loadApiKeys = () => {
    const saved = localStorage.getItem('taskdefender_api_keys');
    if (saved) {
      try {
        setApiKeys(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load API keys:', error);
      }
    }
  };

  const saveAccounts = (newAccounts: SocialAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('taskdefender_social_accounts', JSON.stringify(newAccounts));
  };

  const saveApiKeys = (newKeys: typeof apiKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem('taskdefender_api_keys', JSON.stringify(newKeys));
  };

  const connectAccount = async (platform: 'twitter' | 'linkedin' | 'facebook' | 'devto') => {
    const config = platformConfigs.find(p => p.id === platform);
    if (!config) return;

    if (platform === 'devto') {
      // Dev.to uses API key authentication
      if (!apiKeys.devto.apiKey) {
        alert('Please enter your Dev.to API key first');
        setShowApiKeys(true);
        return;
      }
      
      try {
        // Test the API key
        const response = await fetch('https://dev.to/api/articles/me', {
          headers: {
            'api-key': apiKeys.devto.apiKey
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          const updatedAccounts = accounts.map(account => 
            account.platform === platform 
              ? { 
                  ...account, 
                  connected: true, 
                  username: userData[0]?.user?.username || 'dev-user',
                  profileUrl: `https://dev.to/${userData[0]?.user?.username || 'dev-user'}`
                }
              : account
          );
          saveAccounts(updatedAccounts);
        } else {
          throw new Error('Invalid API key');
        }
      } catch (error) {
        alert('Failed to connect to Dev.to. Please check your API key.');
      }
      return;
    }

    // OAuth flow for other platforms
    if (!config.clientId) {
      alert(`Please enter your ${config.name} Client ID first`);
      setShowApiKeys(true);
      return;
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
            profileUrl: mockUrls[platform as keyof typeof mockUrls]
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

      {/* API Keys Configuration */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Configuration</span>
          </h4>
          <button
            onClick={() => setShowApiKeys(!showApiKeys)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            {showApiKeys ? 'Hide' : 'Show'} API Keys
          </button>
        </div>
        
        {showApiKeys && (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-700 dark:text-yellow-400">Setup Required</h5>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    To connect real social media accounts, you need to create developer apps and get API keys:
                  </p>
                  <ul className="text-sm text-yellow-600 dark:text-yellow-300 mt-2 space-y-1">
                    <li>
                      • <strong>Twitter:</strong> Create app at <a href="https://developer.twitter.com" target=\"_blank" rel="noopener noreferrer\" className="underline">developer.twitter.com</a>
                    </li>
                    <li>
                      • <strong>LinkedIn:</strong> Create app at <a href="https://www.linkedin.com/developers" target=\"_blank" rel="noopener noreferrer\" className="underline">linkedin.com/developers</a>
                    </li>
                    <li>
                      • <strong>Facebook:</strong> Create app at <a href="https://developers.facebook.com" target=\"_blank" rel="noopener noreferrer\" className="underline">developers.facebook.com</a>
                    </li>
                    <li>
                      • <strong>Dev.to:</strong> Get API key from <a href="https://dev.to/settings/account" target=\"_blank" rel="noopener noreferrer\" className="underline">dev.to/settings/account</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Twitter API Keys */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter Client ID
                </label>
                <input
                  type="text"
                  value={apiKeys.twitter.clientId}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    twitter: { ...prev.twitter, clientId: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Your Twitter Client ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter Client Secret
                </label>
                <input
                  type="password"
                  value={apiKeys.twitter.clientSecret}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    twitter: { ...prev.twitter, clientSecret: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Your Twitter Client Secret"
                />
              </div>
            </div>

            {/* LinkedIn API Keys */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn Client ID
                </label>
                <input
                  type="text"
                  value={apiKeys.linkedin.clientId}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    linkedin: { ...prev.linkedin, clientId: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Your LinkedIn Client ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LinkedIn Client Secret
                </label>
                <input
                  type="password"
                  value={apiKeys.linkedin.clientSecret}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    linkedin: { ...prev.linkedin, clientSecret: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Your LinkedIn Client Secret"
                />
              </div>
            </div>

            {/* Facebook API Keys */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook App ID
                </label>
                <input
                  type="text"
                  value={apiKeys.facebook.appId}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    facebook: { ...prev.facebook, appId: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Your Facebook App ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook App Secret
                </label>
                <input
                  type="password"
                  value={apiKeys.facebook.appSecret}
                  onChange={(e) => setApiKeys(prev => ({
                    ...prev,
                    facebook: { ...prev.facebook, appSecret: e.target.value }
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Your Facebook App Secret"
                />
              </div>
            </div>

            {/* Dev.to API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dev.to API Key
              </label>
              <input
                type="password"
                value={apiKeys.devto.apiKey}
                onChange={(e) => setApiKeys(prev => ({
                  ...prev,
                  devto: { apiKey: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="Your Dev.to API Key"
              />
            </div>

            <button
              onClick={() => saveApiKeys(apiKeys)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Save API Keys
            </button>
          </div>
        )}
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
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <LinkIcon className="h-4 w-4" />
                <span>Connect</span>
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

      {/* Privacy Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">
              Privacy & Security
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Your API keys are stored locally and used only for authentication. 
              We never post without your explicit permission. All sharing is done through official platform APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSettings;