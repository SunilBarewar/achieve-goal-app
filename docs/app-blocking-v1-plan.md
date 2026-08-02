# App Blocking v1 — Implementation Plan

This document describes how to implement the core v1 feature: **block one or more apps until a chosen time, with no early unblock**, on the Achieve Goal mobile app.

**Target:** Android only — personal use on a physical device. No iOS build or App Store requirements.

## Product requirements (v1)

| Requirement | Detail |
|-------------|--------|
| Block apps | User picks installed apps and an **end time** (e.g. block until 8:00 PM) |
| Independent end times | Each blocked app has its own `endsAt`; two apps can unblock at different times |
| No early unblock | UI must not offer cancel/skip; enforcement must live in native code |
| Survive background | Blocks continue when the app is closed or the screen is off |
| Survive reboot | Active blocks are restored after device restart |
| Platform | **Android only** |

### Out of scope for v1

- Schedules / recurring blocks
- Website blocking
- Stats or usage analytics
- PIN / accountability partner for override
- Cloud sync or accounts
- iOS

---

## Platform feasibility (Android)

Android allows third-party focus apps to monitor and intercept app launches using:

1. **Usage Stats** — detect which app is in the foreground
2. **Accessibility Service** — react quickly when a blocked app opens (industry-standard for blockers)
3. **Overlay** — show a full-screen “blocked until …” screen
4. **Foreground service** — keep the monitor alive while blocks are active

The user must grant several special permissions manually in Settings. This is expected for this category of app.

---

## UI design principles

All screens should feel **clean, modern, and minimal** — no clutter, no heavy chrome.

| Principle | Guidance |
|-----------|----------|
| Layout | Generous whitespace, single primary action per screen, clear hierarchy |
| Typography | One sans-serif family; large titles, readable body; avoid all-caps except tiny labels |
| Color | Neutral background (off-white or soft dark); one accent color for primary buttons and active states |
| Components | Rounded cards for active blocks; simple list rows in app picker; no nested borders |
| Motion | Subtle transitions only (screen fade/slide); countdown updates in place — no flashy animations |
| Copy | Short, direct (“Block until 8:00 PM”, “Unblocks at 8:00 PM”) — not “duration” or “timer length” |
| Empty states | Friendly one-line message + single CTA, not illustration overload |
| Permissions | Step-by-step cards with icon + one sentence + “Open Settings” — not walls of text |

**Screen tone:** calm and focused, like a utility app — not gamified or noisy.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native (JS/TS)                    │
│  Screens · App picker · End time picker · Active blocks list│
│  BlockStore (AsyncStorage) · Native module bridge           │
└──────────────────────────┬──────────────────────────────────┘
                           │ AppBlockerModule
┌──────────────────────────▼──────────────────────────────────┐
│                    Native layer (Android)                   │
│  BlockRepository (SharedPreferences)                        │
│  BlockMonitorService (Foreground Service)                   │
│  AppLaunchAccessibilityService                                │
│  BlockOverlayActivity / SYSTEM_ALERT_WINDOW overlay         │
│  BootReceiver · AlarmManager (optional backup expiry)       │
└─────────────────────────────────────────────────────────────┘
```

**Rule:** Native code is the source of truth for enforcement. JS only starts blocks and displays state. Even if the user patches JS or clears app cache incorrectly, native persisted blocks + the foreground service must still enforce until `endsAt`.

---

## Data model

```typescript
type BlockSession = {
  id: string;              // UUID
  packageName: string;     // Android: com.instagram.android
  appLabel: string;        // Display name
  startedAt: number;       // Unix ms
  endsAt: number;          // Unix ms — chosen end time, immutable after start
  status: 'active' | 'expired';
};
```

The user never sets a “duration in hours.” The UI collects an **end time**; native code stores `endsAt` as absolute wall-clock milliseconds.

Storage:

- **JS:** `@react-native-async-storage/async-storage` for UI state
- **Android:** `SharedPreferences` or Room DB readable by `BlockMonitorService` without RN running

On app start, sync: native → JS (native wins for `endsAt` and `status`).

---

## End time selection (UX)

**Primary model:** “Block until {time}” — not “block for 2 hours.”

**End time picker screen**

1. **Quick presets** (tap to select, show computed time):
   - Until 6:00 PM / 8:00 PM / 10:00 PM today (adjust defaults to sensible evening times)
   - Until midnight tonight
2. **Custom time** — platform time picker (hour + minute); 24h or 12h follows device locale
3. **Tomorrow rule** — if the chosen clock time is already past today, treat it as **tomorrow** at that time (show “Tomorrow, 8:00 AM” in confirm step so there is no ambiguity)

**Confirm screen copy**

- “Instagram will stay blocked until **8:00 PM** (today).”
- “You cannot unblock early.”

**Home / active blocks**

- Show **“Unblocks at 8:00 PM”** (and “in 2h 14m” as secondary countdown)
- Overlay uses the same wording: “Blocked until 8:00 PM”

---

## Android implementation phases

### Phase 0 — Project setup

- [x] Add TypeScript paths / folder structure: `src/screens`, `src/components`, `src/services`, `src/native`
- [x] Add dependencies:
  - `@react-native-async-storage/async-storage`
  - `uuid` or `react-native-uuid`
- [x] Create empty native module scaffold: `AppBlockerModule` (Kotlin)
- [x] Register TurboModule / legacy NativeModule in `MainApplication`
- [x] Establish base theme: colors, spacing, typography tokens for consistent modern UI

### Phase 1 — App list & permissions UX

**Native APIs**

- `getInstalledApps()` — returns `{ packageName, label, icon }` (exclude system apps without launcher intent)
- `checkPermissions()` — returns status for each required permission
- `openPermissionSettings(permission)` — deep link to the correct Settings screen

**UI screens** (clean, minimal layout per [UI design principles](#ui-design-principles))

1. **Onboarding / Permissions** — one permission per card; icon, short explanation, “Open Settings”
2. **Home** — active block cards + single “Block an app” button; empty state when none
3. **App picker** — searchable list with icons; plenty of vertical padding
4. **End time picker** — preset chips + custom time picker; live preview of “Unblocks at …”
5. **Confirm** — app name, end time, and “You cannot unblock until {time}” before start

**Permission flow order**

1. Usage access
2. Accessibility service
3. Display over other apps (overlay)
4. Notifications (Android 13+)
5. Battery optimization exemption (recommended)

### Phase 2 — Start block (native persistence)

**Native module methods**

```typescript
startBlock(packageName: string, endsAtMs: number): Promise<BlockSession>
getActiveBlocks(): Promise<BlockSession[]>
// v1 intentionally NO stopBlock / cancelBlock
```

**Logic**

1. Validate `endsAtMs > now` (and minimum lead time, e.g. 1 minute)
2. Persist session with `endsAt = endsAtMs`
3. Start or update `BlockMonitorService`
4. Return session to JS

**Validation**

- Reject duplicate active block for same `packageName`
- Reject `endsAt` in the past or within minimum lead time (e.g. &lt; 1 minute from now)
- Reject `endsAt` beyond maximum horizon (e.g. 7 days) to avoid accidental far-future blocks

### Phase 3 — Enforcement (core)

#### BlockMonitorService (Foreground Service)

- Runs while any block is `active`
- Shows persistent notification: “Achieve Goal — 2 apps blocked”
- Polls Usage Stats every ~300–500 ms **or** relies on Accessibility events (prefer events + lightweight poll fallback)
- When foreground app ∈ blocked set and `now < endsAt`:
  - Launch overlay / `BlockOverlayActivity`
  - Call `performGlobalAction(GLOBAL_ACTION_HOME)` from AccessibilityService as backup
- When `now >= endsAt` for a package: mark expired, remove from enforced set
- Stop service when no active blocks remain

#### AppLaunchAccessibilityService

- Listen for `TYPE_WINDOW_STATE_CHANGED`
- On window change, read `event.packageName`
- If blocked → trigger overlay + go home
- Config XML: `accessibility_service_config.xml` with minimal capabilities

#### Block overlay

- Full-screen activity or `TYPE_APPLICATION_OVERLAY` window
- Clean layout: app name, **“Blocked until 8:00 PM”**, optional remaining time; no dismiss button
- Back / home only; no “unlock” affordance
- Match app visual style (neutral background, clear typography)
- The overlay itself must not be bypassable via the blocked app underneath

#### BootReceiver

- `RECEIVE_BOOT_COMPLETED`: reload blocks from storage, restart `BlockMonitorService` if any `endsAt > now`

#### Expiry cleanup

- On each tick / event: expire sessions where `endsAt <= now`
- Emit event to JS (`BlockExpired`) when app is foreground for UI refresh

### Phase 4 — React Native UI polish

- [ ] Active block cards: app icon, label, **“Unblocks at {time}”**, secondary countdown
- [ ] Empty state when no blocks — one line + CTA
- [ ] Re-request permissions if user revoked mid-session (non-intrusive banner)
- [ ] Handle “all permissions granted?” gate before allowing first block
- [ ] Consistent spacing, touch targets (≥ 48dp), and theme across all screens

### Phase 5 — Hardening & edge cases

| Scenario | Behavior |
|----------|----------|
| User disables Accessibility | Show critical banner; blocks cannot enforce — detect on resume |
| User force-stops app | Blocks may stop until reboot/reopen — document limitation; BootReceiver helps after reboot |
| User changes device time backward | Use `elapsedRealtime()` for remaining time, not wall clock alone |
| User changes time forward | Treat as expired if `endsAt <= now` |
| Low memory kills service | `START_STICKY` + restart on Usage events; consider `AlarmManager` watchdog |
| Multiple blocks same app | Prevent at start; one active block per package |
| Blocked app opens from notification | Accessibility + overlay still intercept |
| End time already passed when picking “today” | Roll to tomorrow; show explicit date in confirm UI |

**Time tamper resistance (v1 pragmatic)**

- Store `endsAt` wall clock **and** `remainingMs` at last sync using `SystemClock.elapsedRealtime()`
- Remaining = min(wallClockRemaining, elapsedRealtimeRemaining) when detecting backward time changes

### Phase 6 — Testing

- [ ] Unit tests: expiry logic, end-time validation, duplicate block rejection, tomorrow rollover
- [ ] Manual matrix: block 1 app until 8 PM, block 3 apps with different end times, expiry while app killed, reboot with active block
- [ ] Devices: Android 10, 13, 14+ (foreground service types)
- [ ] Release APK smoke test ([building-apk.md](./building-apk.md))

---

## Suggested folder structure

```
app/
├── src/
│   ├── components/
│   │   ├── ActiveBlockCard.tsx
│   │   ├── AppListItem.tsx
│   │   ├── EndTimePresets.tsx
│   │   └── PermissionBanner.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── AppPickerScreen.tsx
│   │   ├── EndTimeScreen.tsx
│   │   └── PermissionsScreen.tsx
│   ├── theme/
│   │   └── index.ts                 # colors, spacing, typography
│   ├── services/
│   │   ├── blockStore.ts
│   │   └── appBlocker.ts          # JS wrapper around native module
│   ├── hooks/
│   │   └── useActiveBlocks.ts
│   └── types/
│       └── block.ts
└── android/app/src/main/java/com/app/blocker/
    ├── AppBlockerModule.kt
    ├── AppBlockerPackage.kt
    ├── BlockRepository.kt
    ├── BlockMonitorService.kt
    ├── AppLaunchAccessibilityService.kt
    ├── BlockOverlayActivity.kt
    └── BootReceiver.kt
```

---

## Permissions reference (Android)

| Permission / setting | Manifest / API | Purpose |
|----------------------|----------------|---------|
| `PACKAGE_USAGE_STATS` | Special access → Usage access | Detect foreground app |
| Accessibility service | User enables in Settings | Fast launch detection & home action |
| `SYSTEM_ALERT_WINDOW` | Special access → Display over other apps | Block overlay |
| `FOREGROUND_SERVICE` | Manifest | Keep monitor running |
| `FOREGROUND_SERVICE_SPECIAL_USE` | Manifest (Android 14+) | Declare focus / blocking use case |
| `POST_NOTIFICATIONS` | Runtime (Android 13+) | Ongoing block notification |
| `RECEIVE_BOOT_COMPLETED` | Manifest | Restore blocks after reboot |
| `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` | Settings intent | Reduce service kills |
| `QUERY_ALL_PACKAGES` | Manifest (optional) | List all apps; for personal sideload APK, prefer `<queries>` with launcher intent |

Example manifest additions (implementation reference):

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

Accessibility and Usage Access are **not** manifest permissions — they require dedicated Settings screens.

---

## Dependencies to add

| Package | Purpose |
|---------|---------|
| `@react-native-async-storage/async-storage` | Persist block sessions for UI |
| Native module (custom) | App listing, enforcement, permissions |

Optional later:

- `@notifee/react-native` — richer ongoing notifications
- `react-native-vector-icons` — UI icons

---

## Milestones & estimate

| Milestone | Deliverable | Rough effort |
|-----------|-------------|--------------|
| M1 | Permissions UI + installed app list + end time picker | 3–5 days |
| M2 | Start block (`endsAt`) + persistence + home screen list | 2–3 days |
| M3 | Foreground service + accessibility + overlay | 5–8 days |
| M4 | Boot restore + tamper basics + QA | 3–4 days |

**Total Android v1:** ~3–4 weeks for one developer familiar with React Native; longer if new to Android services.

---

## Known limitations (document in README)

1. **Determined users can bypass** any blocker by disabling Accessibility, revoking Usage Access, or uninstalling the app. v1 targets honest self-control, not tamper-proof locks.
2. **Personal sideload** — no Play Store review, but Accessibility and overlay still require careful permission UX on device.
3. **Emulator** testing is limited; use a physical device for Accessibility and overlay behavior.

---

## Success criteria

- [ ] User can block 3+ apps with different end times simultaneously
- [ ] User picks “block until 8:00 PM” (preset or custom) — not a duration in hours
- [ ] Opening a blocked app shows overlay with end time until expiry
- [ ] No in-app control removes a block before expiry
- [ ] Blocks persist with app in background for 30+ minutes
- [ ] Blocks restore after device reboot
- [ ] Home screen shows “Unblocks at {time}” and countdown
- [ ] UI is clean, modern, and consistent across all screens

---

## Related docs

- [README](../README.md) — project overview and setup
- [building-apk.md](./building-apk.md) — Android release builds

---

## Development progress tracker

Update the **Status** column as work proceeds: `Not started` → `In progress` → `Completed`. When a phase is done, set status to `Completed` and fill in the **Completed** date.

| Phase | Name | Key deliverables | Status | Completed |
|-------|------|------------------|--------|-----------|
| 0 | Project setup | Folder structure, theme tokens, AsyncStorage, native module scaffold | Completed | Aug 2, 2026 |
| 1 | App list & permissions UX | `getInstalledApps`, permission flow, home, app picker, **end time** & confirm screens | Completed | Aug 2, 2026 |
| 2 | Start block (native persistence) | `startBlock(endsAt)` / `getActiveBlocks`, SharedPreferences, validation | Completed | Aug 2, 2026 |
| 3 | Enforcement (core) | `BlockMonitorService`, Accessibility service, block overlay, `BootReceiver` | Completed | Aug 2, 2026 |
| 4 | React Native UI polish | Active block cards, “Unblocks at” copy, empty state, permission gate | Not started | — |
| 5 | Hardening & edge cases | Time tamper resistance, tomorrow rollover, service restart | Not started | — |
| 6 | Testing | Unit tests, manual device matrix, release APK smoke test | Not started | — |

**Overall:** 4 / 7 phases completed
