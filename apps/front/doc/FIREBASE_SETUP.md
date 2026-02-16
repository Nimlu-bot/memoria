# Firebase Setup for Push Notifications

## Overview

Push notifications on Android require Firebase Cloud Messaging (FCM) to be configured. Without Firebase, the app will still run but push notifications will be unavailable on Android.

## Quick Status

The app gracefully handles missing Firebase:

- ✅ **Web**: Uses browser Notification API (works without Firebase)
- ✅ **iOS**: Can use APNs independently of Firebase (optional)
- ⚠️ **Android**: **Requires Firebase for push notifications** (optional for core app functionality)

If Firebase is not configured on Android, you'll see a warning message but the app will continue to work normally.

---

## Firebase Setup Instructions (Optional but Recommended)

### Prerequisites

- Google/Gmail account
- Access to [Firebase Console](https://console.firebase.google.com)
- Android Studio installed

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** or select an existing project
3. Enter project name: `Memoria` (or your preferred name)
4. Accept the terms and click **Create project**
5. Wait for Firebase to set up your project

### Step 2: Register Android App with Firebase

1. In the Firebase Console, click the **Android** icon to add Android app
2. Fill in the details:
   - **Android package name**: `com.memoria.app` (from your `android/app/src/main/AndroidManifest.xml`)
   - **App nickname**: `Memoria Android` (optional)
   - **Debug signing certificate SHA-1**: (see instructions below)
3. Download the `google-services.json` file
4. Place it in: `apps/front/android/app/`

### Step 3: Get Debug SHA-1 Fingerprint (Required)

Run this command to get your debug certificate SHA-1:

**macOS/Linux:**

```bash
./gradlew signingReport
```

**Or using keytool directly:**

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the **SHA1** value in the output and paste it in the Firebase console.

### Step 4: Enable Cloud Messaging API

1. In Firebase Console, go to **Project Settings** → **Cloud Messaging** tab
2. Note your **Server API Key** (you'll use this to send notifications from your backend)

### Step 5: Configure Android Project

After placing `google-services.json` in `apps/front/android/app/`:

1. Rebuild the Android app:

   ```bash
   npm run build:native
   npx cap sync android
   ```

2. Open Android Studio:

   ```bash
   npm run open:android
   ```

3. Let Android Studio install any dependencies (it may prompt for Google Services plugin)

4. Build and run the app on an Android device or emulator

### Step 6: Test Push Notifications

After Firebase is configured:

1. Run the app on Android
2. Grant notification permissions when prompted
3. You should see in the console:

   ```
   ✅ Push notifications initialized
   🔔 Push notification token: <device-token>
   ```

4. Send test notifications from Firebase Console → Cloud Messaging → Send your first message

---

## File Structure

```
apps/front/
├── android/
│   └── app/
│       └── google-services.json         ← Place downloaded file here
├── src/features/notifications/
│   └── notification.service.ts          ← Handles Firebase initialization
└── FIREBASE_SETUP.md                   ← This file
```

---

## Troubleshooting

### "FirebaseApp is not initialized" Error

**Cause**: `google-services.json` is missing or not in the correct location

**Solution**:

1. Download `google-services.json` from Firebase Console again
2. Place it in `apps/front/android/app/`
3. Run `npm run build:native && npx cap sync android`
4. Rebuild the app

### "Default FirebaseApp is not initialized in this process"

**Cause**: The Gradle plugin didn't apply (build.gradle issue)

**Solution**:

1. Verify `google-services.json` exists in `apps/front/android/app/`
2. Check that `android/build.gradle` includes: `classpath 'com.google.gms:google-services:4.4.4'`
3. Verify `android/app/build.gradle` tries to apply the plugin
4. Run: `cd apps/front/android && ./gradlew clean build`

### Push Notifications "Not Implemented" Warning

**Cause**: Keyboard plugin initialization failed (safe to ignore)

**Solution**: This is a known issue with some Capacitor/Android Studio versions. The warning doesn't affect the app functionality.

### No Token Received

**Cause**: Firebase initialization succeeded but token generation failed

**Solution**:

1. Check that you granted notification permissions
2. Verify the device has Google Play Services installed (required for FCM)
3. Check logcat output in Android Studio for detailed errors

---

## Backend Integration

Once Firebase is set up and you have the device token from the client app:

### Send Notifications from Your Backend

1. Get the **Server API Key** from Firebase Console → Project Settings → Cloud Messaging
2. Use the device token received in your Angular app (logged as `🔔 Push notification token: <token>`)
3. Send HTTP POST request to:
   ```
   https://fcm.googleapis.com/fcm/send
   ```

Example backend code:

```typescript
// Node.js/Express example
const axios = require('axios');

async function sendNotification(deviceToken: string) {
  try {
    const response = await axios.post(
      'https://fcm.googleapis.com/fcm/send',
      {
        to: deviceToken,
        notification: {
          title: 'Hello from Memoria!',
          body: 'You have a new message',
        },
        data: {
          action: 'open_app',
        },
      },
      {
        headers: {
          Authorization: `key=${process.env.FCM_SERVER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
```

---

## Optional: iOS Setup (APNs)

iOS can use Apple Push Notification service (APNs) independently of Firebase:

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Create an APNs certificate for your app
3. Upload to Firebase Console (optional, Firebase can proxy APNs)
4. Configure in Xcode project settings

This is optional if you only need Android push notifications.

---

## Optional: Firebase Emulator Setup

For local development/testing without sending real notifications:

```bash
# Install Firebase Emulator
npm install -g firebase-tools

# Start emulator
firebase emulators:start --project=<your-project-id>

# Configure NotificationService to use emulator
# (modify notification.service.ts)
```

---

## Key Files

| File                                                            | Purpose                                          |
| --------------------------------------------------------------- | ------------------------------------------------ |
| `apps/front/android/app/google-services.json`                   | Firebase configuration (downloaded from console) |
| `apps/front/src/features/notifications/notification.service.ts` | Handles Firebase initialization                  |
| `apps/front/android/build.gradle`                               | Includes google-services plugin                  |
| `apps/front/android/app/build.gradle`                           | Applies google-services plugin                   |

---

## Next Steps

- **With Firebase**: Follow "Test Push Notifications" section above
- **Without Firebase**: App continues to work; push notifications simply won't be available on Android
- **Production**: Use Firebase Console to manage and track notification delivery

---

## Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Capacitor Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
