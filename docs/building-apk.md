# Building an Android APK

This guide covers how to build an installable `.apk` file for the React Native app in the `app/` directory.

## Prerequisites

Before building, make sure you have completed the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android:

- Android SDK (via Android Studio)
- JDK 17 or newer
- `ANDROID_HOME` environment variable set
- `JAVA_HOME` pointing to your JDK installation

All build commands below are run from the `app/android` directory.

## Quick reference

| Build type | Command | Output path |
|------------|---------|-------------|
| Debug | `./gradlew assembleDebug` | `app/android/app/build/outputs/apk/debug/app-debug.apk` |
| Release | `./gradlew assembleRelease` | `app/android/app/build/outputs/apk/release/app-release.apk` |

## Debug APK

Use a debug APK for local testing on a device or emulator. It is signed with the debug keystore and does not require extra configuration.

```sh
cd app/android
./gradlew assembleDebug
```

If `gradlew` is not executable:

```sh
chmod +x gradlew
```

## Release APK

Use a release APK for sharing builds outside of development or for store submission (after proper signing).

```sh
cd app/android
./gradlew assembleRelease
```

The release build bundles your JavaScript and assets into the APK. You do not need Metro running during the Gradle build.

### Current signing setup

By default, this project signs release builds with the debug keystore (see `app/android/app/build.gradle`). That is fine for internal testing, but **not** for publishing to the Google Play Store.

For production, generate a release keystore and configure `signingConfigs.release` in `app/android/app/build.gradle`. See the official guide: [Publishing to Google Play Store — Signed APK](https://reactnative.dev/docs/signed-apk-android).

## Install the APK on a device

With a device connected over USB and USB debugging enabled:

```sh
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

Or install the release APK:

```sh
adb install app/android/app/build/outputs/apk/release/app-release.apk
```

You can also copy the `.apk` file to the device and open it from a file manager.

## Clean rebuild

If a build fails or behaves unexpectedly, clean and rebuild:

```sh
cd app/android
./gradlew clean
./gradlew assembleRelease
```

## Troubleshooting

### `gradlew: Permission denied`

```sh
chmod +x app/android/gradlew
```

### SDK or JDK not found

Verify your environment variables:

```sh
echo $ANDROID_HOME
echo $JAVA_HOME
```

Install or update the Android SDK through Android Studio (**Settings → Languages & Frameworks → Android SDK**).

### Build fails after dependency changes

Reinstall JavaScript dependencies, then rebuild:

```sh
cd app
npm install
cd android
./gradlew clean assembleRelease
```

For more help, see [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting).

## Reducing APK size

A default release build bundles native libraries for **four CPU architectures** (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`), which produces a large “fat” APK (~66 MB). Most of that size is the React Native + Hermes runtime, not your app code.

| Build | Approx. size |
|-------|--------------|
| Default (4 ABIs) | ~66 MB |
| arm64-only | ~24 MB |
| arm64 + R8/shrink | ~18–22 MB |

### Quick win: arm64-only (~66 MB → ~24 MB)

Most modern phones use **arm64-v8a**. Building only that architecture removes the other three copies of native libraries.

One-off build (recommended to try first):

```sh
cd app/android
./gradlew clean assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Output: `app/android/app/build/outputs/apk/release/app-release.apk`

Install on a connected device:

```sh
adb install app/android/app/build/outputs/apk/release/app-release.apk
```

### Make arm64 the default (optional)

Edit `app/android/gradle.properties` and change:

```properties
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
```

to:

```properties
reactNativeArchitectures=arm64-v8a
```

Then build as usual:

```sh
cd app/android
./gradlew clean assembleRelease
```

**Note:** x86/x86_64 builds are mainly for emulators. If you test on a physical phone, arm64-only is fine. Use `arm64-v8a,armeabi-v7a` only if you need older 32-bit ARM devices.

### Extra savings: enable code shrinking (~3–8 MB more)

Edit `app/android/app/build.gradle`:

1. Change `def enableProguardInReleaseBuilds = false` to `true`.
2. In the `release` block, add `shrinkResources`:

```gradle
release {
    signingConfig signingConfigs.debug
    minifyEnabled enableProguardInReleaseBuilds
    shrinkResources enableProguardInReleaseBuilds
    proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
}
```

Build:

```sh
cd app/android
./gradlew clean assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Test the app after enabling R8 (permissions, app blocking, navigation) in case anything was stripped incorrectly.

### For Google Play Store (smallest download for users)

Play Store uses App Bundles, not fat APKs:

```sh
cd app/android
./gradlew clean bundleRelease
```

Output: `app/android/app/build/outputs/bundle/release/app-release.aab`

Google Play delivers only the ABI the user’s device needs (~similar to arm64-only size).

### Check APK size after build

```sh
ls -lh app/android/app/build/outputs/apk/release/app-release.apk
```

### Size reduction summary

| Goal | Command |
|------|---------|
| Smallest sideload APK (try first) | `./gradlew clean assembleRelease -PreactNativeArchitectures=arm64-v8a` |
| Play Store upload | `./gradlew clean bundleRelease` |
| Clean rebuild if something breaks | `./gradlew clean assembleRelease` |
