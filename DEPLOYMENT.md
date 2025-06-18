# TaskDefender Deployment Guide

## Quick Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add environment variables:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Option 2: Surge.sh (Simple & Fast)

1. **Install Surge:**
   ```bash
   npm install -g surge
   ```

2. **Build and Deploy:**
   ```bash
   npm run build
   surge dist
   ```

### Option 3: GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "homepage": "https://yourusername.github.io/taskdefender",
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

### Option 4: Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize:**
   ```bash
   firebase init hosting
   ```

3. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

## Environment Variables Setup

For any deployment platform, you'll need to set these environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Build Command
```bash
npm run build
```

## Output Directory
```
dist/
```

## Troubleshooting

### Common Issues:
1. **Environment variables not working**: Make sure they start with `VITE_`
2. **404 on refresh**: Ensure your hosting platform supports SPA routing
3. **Build fails**: Check that all dependencies are installed

### Quick Fixes:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`
- Check environment variables are properly set

## Manual Deployment (Any Static Host)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder** to any static hosting service:
   - Netlify (drag & drop)
   - Vercel (drag & drop)
   - AWS S3 + CloudFront
   - DigitalOcean App Platform
   - Railway
   - Render

The `dist/` folder contains all the static files needed to run your application.