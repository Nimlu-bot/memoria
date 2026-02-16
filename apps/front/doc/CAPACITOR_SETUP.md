# Memoria Capacitor Mobile App Configuration Guide

This guide provides setup instructions for building the Memoria app for iOS and Android using Capacitor.

## Project Structure

```
apps/front/
├── dist/memoria/browser/      # Web build output (used by Capacitor)
├── ios/                        # iOS native project (Xcode)
├── android/                    # Android native project (Android Studio)
├── src/                        # Angular source code
├── capacitor.config.ts        # Capacitor configuration
└── package.json               # Available build scripts
```

## Build Commands

### Web Version

```bash
npm start              # Development server on http://localhost:4200
npm run build:web     # Production web build
```

### Native Apps

```bash
npm run build:app     # Build all platforms (ng build --configuration=native + npx cap sync)
npm run build:native  # Build only Angular with native config
npm run open:ios      # Open iOS project in Xcode
npm run open:android  # Open Android project in Android Studio
npm run sync:ios      # Sync iOS platform only
npm run sync:android  # Sync Android platform only
```

## iOS Configuration

### Prerequisites Installed ✅

- ✅ Capacitor iOS platform
- ✅ StatusBar and Keyboard plugins
- ✅ Privacy descriptions in Info.plist
- ✅ Minimum deployment target: iOS 13

### Additional Setup Required

#### 1. Xcode Project Configuration

1. Open iOS project: `npm run open:ios`
2. In Xcode project settings:
   - **Signing & Capabilities**:
     - Select team and signing certificate
     - Add "Push Notifications" capability
     - Add "Background Processing" capability
   - **Deployment Info**:
     - Minimum Deployment Target: 13.0
     - Supported Interface Orientations: Portrait, Landscape

#### 2. Apple Push Notification (APNs) Setup

1. Go to [Apple Developer Account](https://developer.apple.com/)
2. Create a new App ID (Bundle Identifier: `com.memoria.app`)
3. Enable Push Notifications service for the App ID
4. Create an APNs certificate (production or development)
5. Download and import the certificate in Xcode:
   - Certificates, Identifiers & Profiles → Certificates
   - Download the `.cer` file and double-click to import

#### 3. Provisioning Profiles

1. Create provisioning profiles for:
   - **Development**: For testing on physical devices
   - **Ad Hoc**: For distribution to testers (beta)
   - **App Store**: For App Store release
2. Download profiles in Xcode: Xcode → Preferences → Accounts → Manage Certificates

#### 4. Version Configuration

Update `ios/App/App/Info.plist` with your version:

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>  <!-- App version -->
<key>CFBundleVersion</key>
<string>1</string>      <!-- Build number -->
```

### Testing on iOS

```bash
# Build and run on simulator
npm run build:app
npm run open:ios
# In Xcode: Product → Run (or ⌘R)

# Run on physical device
# Same steps, but select your device instead of simulator
```

### Building for App Store

```bash
# 1. Build
npm run build:app

# 2. In Xcode
npm run open:ios
# Product → Archive
# Upload to App Store Connect via Organizer

# 3. In App Store Connect
# Review and submit for approval
```

## Android Configuration

### Prerequisites Installed ✅

- ✅ Capacitor Android platform
- ✅ File system, device info, and push notification plugins
- ✅ Required permissions in AndroidManifest.xml
- ✅ Minimum SDK: 24 (Android 7.0+)

### Additional Setup Required

#### 1. Google Play Console Setup

1. Create project in [Google Play Console](https://play.google.com/console)
2. Create an app listing for "Memoria"
3. Get the package name: `com.memoria.app`

#### 2. Firebase Configuration

1. Create a Firebase project in [Firebase Console](https://console.firebase.google.com/)
2. Add Android app to the project
3. Download `google-services.json`
4. Copy file to: `android/app/google-services.json`

#### 3. Generate Signing Key

```bash
# Create a signing keystore (one-time)
keytool -genkey -v -keystore ~/ memoria.keystore \
  -alias memoria-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Password: [Create a strong password]
# Alias password: [Same or different]
# CN (Common Name): Your Name
# OU (Organization Unit): Your Organization
# O (Organization): Your Company
# L (City): City
# ST (State): State/Province
# C (Country): Country Code (e.g., US)
```

#### 4. Configure Signing in Gradle

Edit `android/app/build.gradle`:

```gradle
android {
    // ... existing config ...

    signingConfigs {
        release {
            keyAlias 'memoria-key'
            keyPassword 'KEY_PASSWORD'
            storeFile file('memoria.keystore')
            storePassword 'KEYSTORE_PASSWORD'
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 5. Android Studio Configuration

1. Open Android project: `npm run open:android`
2. Configure SDK versions:
   - **File → Project Structure**
   - SDK Platforms: Min SDK 24, Target SDK 34
   - SDK Tools: Latest Android Build Tools

### Testing on Android

```bash
# Build and run on emulator
npm run build:app
npm run open:android
# In Android Studio: Run → Run 'app' (or Shift+F10)

# Run on physical device
# Connect via USB with debugging enabled
# Same steps as emulator
```

### Building for Play Store

```bash
# 1. Build
npm run build:app

# 2. In Android Studio
npm run open:android
# Build → Generate Signed Bundle/APK
# Select "Bundle (Google Play)"
# Use the signing key created above

# 3. Upload to Google Play Console
# Internal Testing → Create Release → Upload AAB/APK
# After testing, submit to production
```

## Build Configurations

### Environment-Specific API URLs

The app uses different API endpoints based on platform and build type:

**Web (development)**

- Proxy: `http://localhost:4200/api` → `http://localhost:4000/api`
- Backend: Set `NG_BACKEND_URL` in `.env`

**Native (development/testing)**

- Backend URL: Set `NG_BACKEND_URL` in `.env`
- Used by both iOS and Android

**Native (production)**

- Backend URL: Configure in `NG_BACKEND_URL` at build time
- Or modify backend domain in Capacitor config

### Updating Backend URLs

1. Edit `.env` file:

   ```
   NG_BACKEND_URL=https://api.memoria.example.com
   ```

2. Rebuild:
   ```bash
   npm run build:app
   ```

## Platform-Specific Services

The app includes three main platform services:

### 1. NotificationService

- **File**: `src/features/notifications/notification.service.ts`
- **Native**: Uses Capacitor Push Notifications API
- **Web**: Uses browser Notifications API
- **Methods**:
  - `sendLocalNotification(title, body, data)`
  - `getDeviceToken()` - For server push notifications

### 2. FileStorageService

- **File**: `src/features/files/file-storage.service.ts`
- **Native**: Uses Capacitor Filesystem API
- **Web**: Uses IndexedDB for storage
- **Methods**:
  - `saveFile(filename, content)`
  - `readFile(filename)`
  - `deleteFile(filename)`
  - `listFiles()`

### 3. DeviceService

- **File**: `src/shared/api/device.service.ts`
- **Native**: Uses Capacitor Device API
- **Web**: Uses user-agent and browser APIs
- **Properties**:
  - `deviceId`: Unique device identifier
  - `platform`: 'web' | 'ios' | 'android'
  - `osVersion`: OS version string
  - `manufacturer`, `model`: Device info

## Troubleshooting

### Firebase Configuration Error on Android

```
ERROR: Default FirebaseApp is not initialized
```

- **Cause**: `google-services.json` is missing or not in the correct location
- **Solution**: Follow the detailed setup guide in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **Note**: Firebase is optional for core app functionality. Push notifications simply won't work without it.

### Capacitor Sync Issues

```bash
# Clean rebuild
rm -rf dist/
npm run build:app
npx cap sync

# Verbose output
npx cap sync --verbose
```

### iOS Build Failures

- **Issue**: Team ID not set
  - **Solution**: Xcode → Preferences → Accounts → Manage Certificates
- **Issue**: Pod installation fails
  - **Solution**: `cd ios/App && pod install --repo-update`

### Android Build Failures

- **Issue**: `google-services.json` not found
  - **Solution**: Copy Firebase `google-services.json` to `android/app/`
- **Issue**: Gradle sync fails
  - **Solution**: File → Sync Now or `./gradlew clean`

### API Connection Issues

- **Issue**: App can't reach backend
  - **Solution**: Check `NG_BACKEND_URL` in `.env`
  - **Solution**: Ensure backend is accessible from device/simulator
  - For simulator: Use actual machine IP, not localhost

## Distribution Checklist

### Before App Store Release

- [ ] Update version in `Info.plist` (iOS)
- [ ] Update version in `build.gradle` (Android)
- [ ] Test on actual devices (not just simulators)
- [ ] Check all features work: auth, notifications, file storage
- [ ] Test on slow network (throttle in DevTools)
- [ ] Create app screenshots for store listing
- [ ] Write app description and release notes
- [ ] Set up privacy policy and terms of service
- [ ] Generate app privacy details report

### iOS App Store

- [ ] Certificate and provisioning profiles set up
- [ ] App ID created in Apple Developer
- [ ] Upload to App Store Connect
- [ ] Add app icons and screenshots
- [ ] Submit for review (takes 1-3 days)

### Android Play Store

- [ ] Firebase project created and configured
- [ ] Signing key generated and secured
- [ ] Google Play Console app created
- [ ] Build signed APK/AAB
- [ ] Upload to internal testing first
- [ ] Beta test, then submit to production

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Angular Best Practices](https://angular.dev)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Store Guidelines](https://play.google.com/about/developer-content-policy/)

## Support

For issues or questions:

1. Check Capacitor documentation: https://capacitorjs.com/docs
2. Review Angular docs: https://angular.dev
3. Check platform-specific guides:
   - iOS: https://developer.apple.com/xcode/
   - Android: https://developer.android.com/studio
