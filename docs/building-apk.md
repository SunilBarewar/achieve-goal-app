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
