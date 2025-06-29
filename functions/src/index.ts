import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Configure CORS
const corsHandler = cors({ origin: true });

// Social Media API Configuration
interface SocialMediaConfig {
  twitter: {
    bearerToken: string;
  };
  linkedin: {
    bearerToken: string;
  };
  facebook: {
    bearerToken: string;
  };
  devto: {
    bearerToken: string;
  };
}

// Get social media configuration from Firebase Config
const getSocialMediaConfig = (): SocialMediaConfig => {
  const config = functions.config();
  return {
    twitter: {
      bearerToken: config.social?.twitter?.bearer_token || ''
    },
    linkedin: {
      bearerToken: config.social?.linkedin?.bearer_token || ''
    },
    facebook: {
      bearerToken: config.social?.facebook?.bearer_token || ''
    },
    devto: {
      bearerToken: config.social?.devto?.bearer_token || ''
    }
  };
};

// Twitter API Integration
export const connectTwitter = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const config = getSocialMediaConfig();
      const { bearerToken } = config.twitter;

      if (!bearerToken) {
        response.status(500).json({ 
          error: 'Twitter Bearer Token not configured. Please set it in Firebase Config.' 
        });
        return;
      }

      // Get user info from Twitter API
      const twitterResponse = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!twitterResponse.ok) {
        throw new Error(`Twitter API error: ${twitterResponse.statusText}`);
      }

      const userData = await twitterResponse.json();

      response.json({
        success: true,
        platform: 'twitter',
        user: {
          id: userData.data.id,
          username: userData.data.username,
          name: userData.data.name,
          profileUrl: `https://twitter.com/${userData.data.username}`
        }
      });
    } catch (error) {
      console.error('Twitter connection error:', error);
      response.status(500).json({ 
        error: 'Failed to connect to Twitter',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// LinkedIn API Integration
export const connectLinkedIn = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const config = getSocialMediaConfig();
      const { bearerToken } = config.linkedin;

      if (!bearerToken) {
        response.status(500).json({ 
          error: 'LinkedIn Bearer Token not configured. Please set it in Firebase Config.' 
        });
        return;
      }

      // Get user info from LinkedIn API
      const linkedinResponse = await fetch('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!linkedinResponse.ok) {
        throw new Error(`LinkedIn API error: ${linkedinResponse.statusText}`);
      }

      const userData = await linkedinResponse.json();

      response.json({
        success: true,
        platform: 'linkedin',
        user: {
          id: userData.id,
          name: `${userData.localizedFirstName} ${userData.localizedLastName}`,
          profileUrl: `https://linkedin.com/in/${userData.vanityName || userData.id}`
        }
      });
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      response.status(500).json({ 
        error: 'Failed to connect to LinkedIn',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Facebook API Integration
export const connectFacebook = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const config = getSocialMediaConfig();
      const { bearerToken } = config.facebook;

      if (!bearerToken) {
        response.status(500).json({ 
          error: 'Facebook Bearer Token not configured. Please set it in Firebase Config.' 
        });
        return;
      }

      // Get user info from Facebook Graph API
      const facebookResponse = await fetch(`https://graph.facebook.com/me?access_token=${bearerToken}&fields=id,name,email`);

      if (!facebookResponse.ok) {
        throw new Error(`Facebook API error: ${facebookResponse.statusText}`);
      }

      const userData = await facebookResponse.json();

      response.json({
        success: true,
        platform: 'facebook',
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          profileUrl: `https://facebook.com/${userData.id}`
        }
      });
    } catch (error) {
      console.error('Facebook connection error:', error);
      response.status(500).json({ 
        error: 'Failed to connect to Facebook',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Dev.to API Integration
export const connectDevTo = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const config = getSocialMediaConfig();
      const { bearerToken } = config.devto;

      if (!bearerToken) {
        response.status(500).json({ 
          error: 'Dev.to Bearer Token not configured. Please set it in Firebase Config.' 
        });
        return;
      }

      // Get user info from Dev.to API
      const devtoResponse = await fetch('https://dev.to/api/users/me', {
        headers: {
          'api-key': bearerToken,
          'Content-Type': 'application/json'
        }
      });

      if (!devtoResponse.ok) {
        throw new Error(`Dev.to API error: ${devtoResponse.statusText}`);
      }

      const userData = await devtoResponse.json();

      response.json({
        success: true,
        platform: 'devto',
        user: {
          id: userData.id,
          username: userData.username,
          name: userData.name,
          profileUrl: `https://dev.to/${userData.username}`
        }
      });
    } catch (error) {
      console.error('Dev.to connection error:', error);
      response.status(500).json({ 
        error: 'Failed to connect to Dev.to',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Generic social media connection endpoint
export const connectSocialMedia = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        response.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { platform } = request.body;

      if (!platform) {
        response.status(400).json({ error: 'Platform parameter is required' });
        return;
      }

      // Route to appropriate platform handler
      switch (platform.toLowerCase()) {
        case 'twitter':
          return connectTwitter(request, response);
        case 'linkedin':
          return connectLinkedIn(request, response);
        case 'facebook':
          return connectFacebook(request, response);
        case 'devto':
          return connectDevTo(request, response);
        default:
          response.status(400).json({ 
            error: 'Unsupported platform',
            supportedPlatforms: ['twitter', 'linkedin', 'facebook', 'devto']
          });
      }
    } catch (error) {
      console.error('Social media connection error:', error);
      response.status(500).json({ 
        error: 'Failed to connect to social media platform',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// Health check endpoint
export const healthCheck = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        twitter: '/connectTwitter',
        linkedin: '/connectLinkedIn',
        facebook: '/connectFacebook',
        devto: '/connectDevTo',
        generic: '/connectSocialMedia'
      }
    });
  });
});