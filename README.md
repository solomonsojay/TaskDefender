# TaskDefender - Privacy-First Productivity App

A comprehensive productivity application with AI-powered motivation and privacy-first design. All data is stored locally on your device.

## Features

- **Task Management**: Create, organize, and track tasks with priorities and deadlines
- **Focus Mode**: Pomodoro timer with customizable work/break intervals
- **AI Sarcasm Engine**: Motivational prompts with different personality types
- **Team Collaboration**: Create and manage teams (admin users)
- **Voice Interventions**: Character-based voice calls for motivation
- **Advanced Monitoring**: Productivity analytics and insights
- **Smart Notifications**: Scheduled reminders and nudges
- **Gamification**: Achievement badges and streak tracking
- **Privacy-First**: All data stored locally, no external servers

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskdefender
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## No Authentication Required

TaskDefender now works without any sign-up or sign-in process. Simply open the app and start using it immediately. A default user profile is automatically created with admin privileges to access all features.

## Deployment

### Option 1: Netlify (Recommended)
1. Build the project: `npm run build`
2. Drag and drop the `dist/` folder to Netlify

### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Option 3: Any Static Host
1. Build: `npm run build`
2. Upload the `dist/` folder to your hosting service

## Privacy & Data

- **100% Local Storage**: All your data stays on your device
- **No External Servers**: No data is sent to third parties
- **Export/Import**: Full control over your data
- **Optional Monitoring**: External monitoring features are opt-in only
- **No Authentication**: No personal information required to use the app

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Vitest + Testing Library
- **Storage**: Browser localStorage

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components (minimal)
│   ├── tasks/          # Task management
│   ├── focus/          # Focus mode & Pomodoro
│   ├── dashboard/      # Main dashboard
│   ├── teams/          # Team management
│   ├── voice/          # Voice call system
│   ├── monitoring/     # Advanced monitoring
│   ├── notifications/  # Smart notifications
│   ├── ai/            # AI intervention system
│   ├── sarcasm/       # Sarcastic prompt display
│   ├── gamification/  # Badge system
│   ├── settings/      # Settings & privacy
│   └── common/        # Shared components
├── contexts/          # React contexts
├── hooks/            # Custom hooks
├── services/         # Business logic
├── types/           # TypeScript types
└── test/           # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run type-check` - Check TypeScript types

## Features Overview

### Task Management
- Create tasks with priorities, deadlines, and descriptions
- Organize with tags and categories
- Track time spent and completion status
- Honesty checkpoint for task completion

### Focus Mode
- Customizable Pomodoro timer
- Work/break session tracking
- Distraction reporting
- Progress visualization

### AI Sarcasm Engine
- Multiple personality types (Gordon Ramsay, Mom, HR, etc.)
- Contextual motivational prompts
- Adaptive messaging based on behavior
- Customizable severity levels

### Team Features (Admin Only)
- Create and manage teams
- Invite members with codes
- Team productivity tracking
- Role-based permissions

### Voice Interventions
- Character-based voice calls
- Motivational scripts
- Configurable call frequency
- Multiple voice personalities

### Advanced Monitoring
- Productivity metrics calculation
- Activity pattern analysis
- AI-powered insights
- Trend tracking

### Privacy Controls
- Granular data collection settings
- External monitoring permissions
- Complete data export
- Secure data deletion

## Default User Profile

The app automatically creates a default user with the following settings:
- **Name**: TaskDefender User
- **Role**: Admin (access to all features)
- **Organization**: My Organization
- **Goals**: Improve Focus, Better Time Management, Increase Productivity
- **Work Style**: Focused

You can modify these settings in the Settings panel.

## Tagline

**"Your Last Line of Defense Against Procrastination"**

TaskDefender stands as your ultimate productivity guardian, helping you overcome procrastination and achieve your goals with AI-powered motivation, smart interventions, and privacy-first design.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions, please open an issue on the repository.