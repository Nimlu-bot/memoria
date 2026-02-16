# Memoria Distribution & Release Guide

This guide covers the complete process of distributing the Memoria app to iOS App Store and Google Play Store.

## Pre-Release Checklist

### Code & Build

- [x] All features tested on iOS, Android, and web
- [x] No console errors or warnings in production builds
- [x] TypeScript strict mode passes
- [x] Bundle size optimized (under 500kB budget)
- [x] All environment variables properly configured
- [x] Backend URLs correct for production

### App Configuration

- [x] App name, icon, and display name set
- [x] Version bumped (major.minor.patch)
- [x] Privacy policy written and accessible
- [x] Terms of service written (if applicable)
- [x] Support/contact information available
- [x] Analytics properly configured (if used)

### Platform-Specific

- **iOS**
  - [ ] Development certificates and provisioning profiles created
  - [ ] App ID registered in Apple Developer Account
  - [ ] Push notification certificates configured (if using push)
- **Android**
  - [ ] App created in Google Play Console
  - [ ] Signing keystore created and securely backed up
  - [ ] Firebase project configured (if using push notifications)
  - [ ] google-services.json in place

## Version Management

### Versioning Schema

Follow semantic versioning: `MAJOR.MINOR.PATCH`

**Examples:**

- `1.0.0` - Initial release
- `1.1.0` - New features added
- `1.0.1` - Bug fixes only
- `2.0.0` - Breaking changes

### Update Version Numbers

#### iOS Version (Info.plist)

```bash
# Open and edit ios/App/App/Info.plist
```

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>  <!-- App version (1.0.0) -->
<key>CFBundleVersion</key>
<string>1</string>      <!-- Build number (increment on each build) -->
```

#### Android Version (build.gradle)

```bash
# Edit android/app/build.gradle
```

```gradle
android {
    ...
    defaultConfig {
        applicationId "com.memoria.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1        // Build number (increment each release)
        versionName "1.0.0"  // App version
        ...
    }
}
```

#### Package.json Reference

```json
{
  "name": "memoria",
  "version": "1.0.0"
}
```

### Version Bump Workflow

```bash
# 1. Update ios/App/App/Info.plist (version and build)
# 2. Update android/app/build.gradle (versionName and versionCode)
# 3. Update package.json version
# 4. Commit and tag

git add ios/App/App/Info.plist android/app/build.gradle package.json
git commit -m "chore: bump version to 1.0.1"
git tag v1.0.1
git push origin main --tags
```

## iOS App Store Release

### Step 1: Prepare for Xcode

Ensure you have:

- [ ] Apple Developer account (with paid membership)
- [ ] Xcode installed (latest version)
- [ ] Signing certificate configured
- [ ] Provisioning profiles created

### Step 2: Create App Store Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "Apps" → "Create a New App"
3. Fill in:
   - [ ] Platform: iOS
   - [ ] Name: Memoria
   - [ ] Bundle ID: `com.memoria.app`
   - [ ] SKU: `com.memoria.app.001` (unique identifier)
   - [ ] User Access: Select user level
4. Click "Create"

### Step 3: App Information

In App Store Connect, complete:

- [ ] Pricing and Availability
  - Set as "Free" app (or configure pricing)
  - Select regions for availability
- [ ] General App Information
  - Privacy Policy URL: https://example.com/privacy
  - Support URL: https://example.com/support
  - Category: Productivity (or appropriate category)

### Step 4: Version Release

1. Click "$VERSION_NUMBER (Prepare for Submission)"
2. Complete:

#### Whats's New

```
What's New in This Version:
[Version 1.0.0 Release]
- Initial public release
- User authentication
- Task management
- Cloud synchronization
- Push notifications support
```

#### Screenshots

- [ ] iPhone 6.5" display (landscape and portrait)
- [ ] iPad 12.9" display (if supporting iPad)
- [ ] Each screenshot shows key feature
- [ ] Professional appearance, consistent branding

#### App Preview

- [ ] Optional 15-30 second video showing app in action
- [ ] Can be recorded in Xcode simulator

#### Description

```
Memoria - Your Digital Memory

Keep track of everything that matters with Memoria,
the intelligent note-taking and task management app.

Features:
• Secure cloud synchronization
• Real-time collaboration
• Offline access to your notes
• Push notifications for reminders
• Beautiful, intuitive interface

Start using Memoria today and never forget again.
```

#### Keywords

```
notes, tasks, productivity, memory, organizing,
reminders, collaboration, sync
```

### Step 5: Build and Upload

```bash
# 1. Build app with production configuration
npm run build:app

# 2. Open Xcode project
npm run open:ios

# 3. In Xcode:
# - Select Memoria target
# - Select "Memoria" scheme
# - Select "Generic iOS Device" (or create archive)
# - Product → Archive

# 4. In Organizer window (Xcode → Window → Organizer):
# - Select archive you just created
# - Click "Distribute App"
# - Select "App Store Connect"
# - Choose "Upload"
# - Select signing options
# - Upload

# Wait for upload to complete (15-30 minutes)
```

### Step 6: Submit for Review

1. In App Store Connect, click "Submit for Review"
2. Select:
   - [ ] Export Compliance: Encryption
     - Answer questions about encryption (usually "No")
   - [ ] Advertising Identifier (IDFA)
     - Select "Does not use IDFA" (unless applicable)
   - [ ] Age Rating
     - Fill in content rating form
3. Review all information
4. Click "Submit for Review"

**Expected Review Time:** 24-48 hours (up to 7 days in rare cases)

### Step 7: Post-Review

- [ ] Receive approval notification
- [ ] Click "Release This Version"
- [ ] Choose:
  - "Release App Manually" (when ready)
  - "Automatically Release This Version" (releases automatically when ready)
- [ ] Toggle availability to "Available"

---

## Android Play Store Release

### Step 1: Prepare for Android Studio

Ensure you have:

- [ ] Google Play Developer account (one-time $25 fee)
- [ ] Android Studio installed
- [ ] Signing key generated and backed up
- [ ] Firebase project created (for push notifications)

### Step 2: Create Google Play App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in:
   - [ ] App name: Memoria
   - [ ] Default language: English
   - [ ] App type: Application
   - [ ] Content rating: Select appropriate category
4. Click "Create app"

### Step 3: App Details

Complete the following sections:

#### Store Listing

- [ ] Title: Memoria
- [ ] Short description (80 chars max):
  ```
  Keep track of everything with Memoria's intelligent notes and tasks app
  ```
- [ ] Full description:

  ```
  Memoria - Your Digital Memory

  Keep track of everything that matters with Memoria,
  the intelligent note-taking and task management app.

  Features:
  • Secure cloud synchronization
  • Real-time collaboration
  • Offline access to your notes
  • Push notifications for reminders
  • Beautiful, intuitive interface
  • Dark mode support

  Start using Memoria today and never forget again.
  ```

- [ ] Screenshots:
  - 2-8 screenshots required
  - Minimum 320x426, maximum 3840x2160
  - Show key features in action
- [ ] Feature image (1024x500)
- [ ] Icon (512x512)
- [ ] Privacy policy URL: https://example.com/privacy
- [ ] Support email: support@example.com
- [ ] Content rating: Complete form

#### Pricing & Distributed

- [ ] Price: Free
- [ ] Countries/regions to distribute

#### Target Audience

- [ ] Content rating questionnaire
- [ ] Check all applicable categories

### Step 4: Prepare Build

```bash
# Update version in android/app/build.gradle
vim android/app/build.gradle

# Build signed APK
npm run build:app
npm run open:android

# In Android Studio:
# Build → Generate Signed Bundle/APK
# Select "Bundle (Google Play)"
# Select or create signing key
# Select "release" build type
# Finish
```

### Step 5: Upload to Google Play

1. In Google Play Console, click "Production"
2. Click "Create new release"
3. "Create release" section:
   - Click "Browse files" or drag AAB file
   - Select `android/app/release.aab` (generated by Android Studio)
4. Review release notes:
   ```
   Version 1.0.0 Release
   - Initial public release
   - User authentication
   - Task management
   - Cloud synchronization
   - Push notifications support
   ```
5. Click "Review release"
6. Review all information
7. Click "Start rollout to Production"
8. Set rollout percentage (usually 100% for release versions)
9. Click "Confirm rollout"

**Publication Time:** Usually 2-3 hours, can take up to 24 hours

### Step 6: Monitor Release

1. Monitor "Release Dashboard":
   - Watch deployment progress
   - Check analytics
   - Monitor crash rates
2. Respond to user reviews and ratings
3. Update rating and reviews regularly

---

## Web Deployment

### Option 1: Static Hosting (Recommended)

**Platforms:** Netlify, Vercel, AWS S3, GitHub Pages, Firebase Hosting

```bash
# Build for production
npm run build:web

# Output: dist/memoria/browser/
# Deploy entire directory to static hosting

# Example with Firebase Hosting:
firebase deploy --only hosting
```

### Option 2: Server Hosting

Deploy to any web server that serves static files:

```bash
# Build
npm run build:web

# Copy dist/memoria/browser/ to web server
# Configure web server to serve index.html for all routes (SPA configuration)

# Nginx example:
# location / {
#   try_files $uri $uri/ /index.html;
# }
```

---

## Release Notes Template

Use this template for release notes on all platforms:

```
Version X.Y.Z - Release Date

New Features:
✨ Feature 1 description
✨ Feature 2 description

Improvements:
• Performance optimization for page loading
• Enhanced error messages for better debugging
• Improved mobile UI responsiveness

Bug Fixes:
🐛 Fixed authentication timeout issue
🐛 Fixed file sync error on slow networks
🐛 Fixed notification permission prompt

Breaking Changes:
⚠️ Removed deprecated API endpoint v1

Migration Guide (if applicable):
1. Step one
2. Step two

Known Issues:
- Issue description (workaround provided)

Thanks to:
- Contributors and beta testers
- Community for feedback
```

---

## Post-Release Checklist

### Immediately After Release

- [ ] Verify app is live on App Store
- [ ] Verify app is live on Play Store
- [ ] Monitor crash dashboards
- [ ] Check user feedback/ratings
- [ ] Monitor server logs

### First Week

- [ ] Daily monitoring of crash rates
- [ ] Respond to critical user reviews
- [ ] Fix any critical bugs immediately
- [ ] Track feature usage

### First Month

- [ ] Analyze user analytics
- [ ] Gather user feedback
- [ ] Plan next features
- [ ] Prepare next release

---

## Update Release Process

For subsequent releases, repeat:

1. **Development & Testing** (1-2 weeks)
   - Develop new features
   - Test on all platforms
   - Fix bugs
   - Get team approval

2. **Version Bump**
   - Update iOS version (Info.plist)
   - Update Android version (build.gradle)
   - Update package.json

3. **Build & Submit**
   - Run `npm run build:app`
   - Upload to App Store Connect (iOS)
   - Upload to Google Play Console (Android)
   - Deploy web version

4. **Review & Release**
   - Wait for app store reviews
   - Release when approved
   - Monitor for issues

---

## Important Notes

### Code Signing & Security

- [ ] Keep signing keys secure and backed up
- [ ] Never commit signing keys to version control
- [ ] Use strong passwords for all accounts
- [ ] Enable two-factor authentication on:
  - [ ] Apple Developer account
  - [ ] Google Play Console
  - [ ] GitHub/Git hosting

### Update Communication

- [ ] Write clear, professional release notes
- [ ] Highlight benefits to users
- [ ] Be transparent about known issues
- [ ] Thank community and beta testers

### Compliance

- [ ] Ensure privacy policy is accurate
- [ ] Include required legal disclaimers
- [ ] Comply with app store guidelines:
  - [ ] [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
  - [ ] [Google Play Store Policies](https://play.google.com/about/developer-content-policy/)
- [ ] Obtain necessary permissions (like for location, contacts, etc.)

### Monitoring & Analytics

- [ ] Configure app analytics (Firebase, Sentry, etc.)
- [ ] Monitor crash rates daily
- [ ] Watch error logs
- [ ] Track user engagement
- [ ] Plan improvements based on analytics

---

## Support & Help

**Have questions?**

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Angular Documentation](https://angular.dev)

**Get help with:**

- [ ] Building the app
- [ ] Submitting to stores
- [ ] Resolving rejection reasons
- [ ] Technical issues

---

## Next Steps After Release

1. **User Feedback Loop**
   - Monitor reviews and ratings
   - Respond to user feedback
   - Fix reported bugs

2. **Analytics & Improvements**
   - Analyze how users use the app
   - Identify popular features
   - Plan next release based on usage

3. **Regular Updates**
   - Plan release schedule (monthly, quarterly)
   - Keep dependencies updated
   - Maintain security patches

4. **Marketing & Growth**
   - Promote app on social media
   - Gather positive reviews
   - Feature in app store
   - Build user community

---

**Congratulations!** 🎉

Your Memoria app is now available to millions of users worldwide!
