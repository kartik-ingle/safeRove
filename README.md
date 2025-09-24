## PWA (Installable App)

This project is now a PWA.

- Added `public/manifest.webmanifest` and `public/sw.js`
- Registered service worker in `index.html`

How to test:
- Run `npm run dev`
- Open in Chrome, visit the site over `http://localhost` and use the browser menu: Install App

## Build as Native App (Capacitor)

You can wrap the PWA in Capacitor to build Android/iOS.

1. Install Capacitor
   ```bash
   npm install @capacitor/core @capacitor/cli
   ```
2. Add platforms
   ```bash
   npx cap init "SafeRove" "com.saferove.app" --web-dir=dist
   npm run build
   npx cap add android
   npx cap add ios
   npx cap copy
   npx cap open android   # or: npx cap open ios
   ```
3. Build APK/IPA in Android Studio/Xcode.

Permissions (Camera/Mic/Location) will be requested by the web app via WebView when needed.

### Android permissions (AndroidManifest.xml)
Capacitor will merge permissions, but ensure these are present in your Android project:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

For Android 9+ cleartext, rely on https or set `android:usesCleartextTraffic="true"` on dev only.

### iOS permissions (Info.plist)
Add usage descriptions:

```xml
<key>NSCameraUsageDescription</key>
<string>Camera is used to record face video during SOS.</string>
<key>NSMicrophoneUsageDescription</key>
<string>Microphone is used to capture audio during SOS.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Location is used to attach coordinates to SOS alerts.</string>
```

## Alternative: React Native WebView

If you prefer a pure RN shell, create a React Native app and embed a WebView that points to your deployed URL:

```tsx
import React from 'react';
import { WebView } from 'react-native-webview';

export default function App() {
  return <WebView source={{ uri: 'https://your-website-url.com' }} style={{ flex: 1 }} />;
}
```

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4dce3e3e-9c85-483c-be24-a975e7b66d1d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4dce3e3e-9c85-483c-be24-a975e7b66d1d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4dce3e3e-9c85-483c-be24-a975e7b66d1d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the frontend dev server:
```bash
npm run dev
```

3. Configure environment variables:
- Frontend: create a `.env` in `sih_project/` with:
```
VITE_API_URL=http://localhost:8000
```
- Backend: see `backend/README.md` for a `.env` example with API keys. Run the API locally with:
```
uvicorn app.main:app --reload --port 8000
```
# SafeRove-Final
