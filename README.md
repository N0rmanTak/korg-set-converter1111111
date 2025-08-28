KORG Set Downgrader — Source package
-----------------------------------

This package contains the React Native prototype source for the KORG SET downgrader.
It is a *prototype* and requires the React Native toolchain to build an Android APK.

Included files:
 - package.json
 - src/App.tsx
 - src/engine.ts
 - src/mappings.ts
 - README.md (this file)

Quick build instructions (Android)
1) Install Android Studio + Android SDK + Java JDK (11+ recommended).
2) Install Node.js and yarn or npm.
3) In the project folder run:
   npm install
4) For iOS only: npx pod-install
5) Connect an Android device or start an Android emulator.
6) Run:
   npx react-native run-android
   OR to produce a release-ready APK:
   cd android
   ./gradlew assembleRelease
   The generated APK will be in android/app/build/outputs/apk/release/app-release.apk

Notes:
- The prototype uses stubbed file pickers and mock FS helpers. To make it fully functional:
  - Install the listed native modules (react-native-fs, document-picker, zip-archive).
  - Replace the pickZipFile stub with DocumentPicker.
  - Implement binary parsers for KORG STYLE/SOUND/PCM formats.
- If you want, I can prepare a CI workflow (GitHub Actions) to build release APKs automatically.

If you prefer, I can also try to produce a debug APK here — but building an actual Android APK requires the Android SDK and Gradle environment which aren't available inside this environment. So the zip contains a ready-to-build project you can run on your machine.
