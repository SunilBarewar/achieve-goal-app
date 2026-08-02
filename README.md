# Achieve Goal

A mobile focus app built with [React Native](https://reactnative.dev). It helps you stay on task by **blocking distracting apps until a time you choose** (e.g. until 8:00 PM) — with no option to unblock early.

**Android only** — personal use on a physical device.

## v1 feature

**Block until a chosen time**

- Pick one or more installed apps to block
- Choose when each block ends (presets like “Until 8:00 PM” or a custom time) — not “block for 2 hours”
- Each app can have its own end time
- **No early unblock** — once started, the block cannot be cancelled from the app before that time
- Enforcement continues in the background (Android foreground service)

Future versions may add schedules and stats.

## How it works (high level)

1. You grant special permissions (usage access, accessibility, overlay — required on Android for any app blocker).
2. You select apps and an end time (e.g. block until 8:00 PM).
3. A native background service monitors which app is in the foreground.
4. If you open a blocked app before that time, a full-screen overlay appears and you are sent back to the home screen.
5. When the end time is reached, that app is automatically unblocked.

See the full technical plan: [docs/app-blocking-v1-plan.md](./docs/app-blocking-v1-plan.md).

## Platform support

**Android only** — full blocking via Usage Stats + Accessibility + overlay. Install via sideload APK on a physical device; emulators poorly simulate accessibility and overlay behavior.

## Permissions

App blockers need elevated access on Android. Users must enable these manually in system Settings.

### Android (required for blocking)

| Permission / setting | Why it’s needed |
|----------------------|-----------------|
| **Usage access** (`PACKAGE_USAGE_STATS`) | Detect which app is currently open |
| **Accessibility service** | Intercept app launches quickly and return to home |
| **Display over other apps** (`SYSTEM_ALERT_WINDOW`) | Show the “app is blocked” overlay |
| **Notifications** (`POST_NOTIFICATIONS`, Android 13+) | Show an ongoing notification while blocks are active |
| **Foreground service** | Keep the block monitor running when the app is closed |
| **Boot completed** | Restore active blocks after device restart |
| **Battery optimization exemption** (recommended) | Reduce chance the OS stops the monitor service |

### Android (manifest — no user prompt)

- `INTERNET` — already declared (Metro / updates; not used for blocking logic in v1)
- `FOREGROUND_SERVICE` / `FOREGROUND_SERVICE_SPECIAL_USE` — declare foreground monitoring
- `RECEIVE_BOOT_COMPLETED` — restart blocks after reboot

## Requirements for the app to work properly

### Development environment

- **Node.js** ≥ 22.11.0
- **React Native** 0.86.x environment — follow [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment)
- **Android:** Android Studio, SDK 35, JDK 17+, `ANDROID_HOME` and `JAVA_HOME` set

### Runtime (end user — Android)

1. Install the APK on a physical device (see [docs/building-apk.md](./docs/building-apk.md)).
2. Complete the in-app permission setup (usage access, accessibility, overlay, notifications).
3. Optionally disable battery optimization for Achieve Goal.
4. Keep the app installed for the duration of any active block.

### Limitations users should know

- Blocks are **commitment tools**, not unbreakable locks. Disabling accessibility, revoking usage access, or uninstalling the app can bypass enforcement.
- Changing the device clock may affect timers; the app uses best-effort tamper detection (see implementation plan).
- Personal sideload — no Play Store, but Accessibility and overlay permissions still need clear in-app explanation.

## Project structure

```
app/
├── App.tsx                 # Root component (will host navigation)
├── src/                    # App screens, services, components (to be added)
├── android/                # Native Android project + blocker module
├── docs/
│   ├── app-blocking-v1-plan.md   # Detailed implementation plan
│   └── building-apk.md           # Build & install APK
└── package.json
```

## Getting started

From the `app/` directory:

```sh
npm install
npm start          # Metro bundler
npm run android    # Run on Android device/emulator
```

## Building a release APK

See [docs/building-apk.md](./docs/building-apk.md) for debug/release APK commands and troubleshooting.

## Implementation roadmap

Detailed phases, architecture, data models, and milestones:

**[docs/app-blocking-v1-plan.md](./docs/app-blocking-v1-plan.md)**

Summary:

1. **M1** — Permissions flow + app picker + end time picker
2. **M2** — Start block (`endsAt`), persistence, active blocks UI
3. **M3** — Foreground service, accessibility service, block overlay
4. **M4** — Boot restore, time tamper basics, QA

## Tech stack

- React Native 0.86.2
- React 19
- TypeScript
- Kotlin (Android native module)
- Hermes (default)

## Troubleshooting

- React Native general issues: [Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- Android build issues: [docs/building-apk.md](./docs/building-apk.md)
- Blocking not working: verify all permissions in Settings → Apps → Achieve Goal / Special access

## License

Private project — not published yet.
