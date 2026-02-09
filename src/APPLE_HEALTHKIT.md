# Apple HealthKit Integration Research

> Last updated: February 2026

## Table of Contents

1. [Overview](#overview)
2. [Full Capabilities](#full-capabilities)
3. [How to Access HealthKit](#how-to-access-healthkit)
4. [Authentication and Permissions](#authentication-and-permissions)
5. [Integration Ideas for a Workout Tracker PWA](#integration-ideas-for-a-workout-tracker-pwa)
6. [Technical Integration Approaches](#technical-integration-approaches)
7. [PWA-Specific Challenges](#pwa-specific-challenges)
8. [Data Privacy](#data-privacy)
9. [Limitations](#limitations)
10. [Code Examples](#code-examples)

---

## Overview

### What Is HealthKit?

Apple HealthKit is an **on-device iOS framework** that provides a centralized repository for health and fitness data on iPhone, iPad, Apple Watch, and Apple Vision Pro. It is NOT a cloud-based REST API. HealthKit acts as a local data store on each user's device, allowing apps to read from and write to the Apple Health app in a secure, privacy-first manner.

### How It Differs from REST APIs

| Aspect | Traditional REST API | Apple HealthKit |
|--------|---------------------|-----------------|
| **Location** | Cloud server | On-device only |
| **Access** | HTTP requests from any platform | Native iOS framework only |
| **Authentication** | API keys, OAuth tokens | iOS permission prompts per data type |
| **Data storage** | Server-side database | Device-local encrypted store |
| **Cross-platform** | Any client with HTTP | iOS/iPadOS/watchOS/visionOS only |
| **Offline access** | Requires network | Always available on device |
| **Data ownership** | Service provider | User owns all data |

### Key Design Principles

- **Centralized**: Aggregates data from multiple apps and devices (Apple Watch, Oura, Whoop, Garmin, etc.)
- **Privacy-first**: All data stays on-device; Apple cannot read your health data
- **User-controlled**: Granular per-type, per-app read/write permissions
- **No server sync**: There is no Apple-hosted API to pull HealthKit data remotely

---

## Full Capabilities

### Activity Data

| Data Type | Identifier | Unit | Source |
|-----------|-----------|------|--------|
| Step Count | `stepCount` | count | iPhone, Apple Watch |
| Distance Walking/Running | `distanceWalkingRunning` | meters | iPhone, Apple Watch |
| Distance Cycling | `distanceCycling` | meters | Apple Watch, apps |
| Flights Climbed | `flightsClimbed` | count | iPhone, Apple Watch |
| Apple Exercise Time | `appleExerciseTime` | minutes | Apple Watch |
| Apple Stand Hours | `appleStandTime` | minutes | Apple Watch |
| Active Energy Burned | `activeEnergyBurned` | kcal | Apple Watch |
| Basal Energy Burned | `basalEnergyBurned` | kcal | Apple Watch |
| Push Count (wheelchair) | `pushCount` | count | Apple Watch |
| Distance Wheelchair | `distanceWheelchair` | meters | Apple Watch |

### Workout Data

HealthKit supports **84+ workout activity types** via `HKWorkoutActivityType`. Each workout can include:

- **Start/end timestamps**
- **Duration**
- **Total energy burned** (calories)
- **Total distance**
- **Heart rate samples** (continuous from Apple Watch)
- **Heart rate zones** (calculated)
- **Route data** (GPS coordinates via `HKWorkoutRoute`)
- **Workout events** (pause, resume, lap, segment markers)
- **Sub-activities** (e.g., transition segments in a triathlon)

#### Workout Activity Types Most Relevant to This App

| Activity Type | Enum Value | Use Case |
|--------------|------------|----------|
| `traditionalStrengthTraining` | 50 | Weight lifting (PPL, Upper/Lower) |
| `functionalStrengthTraining` | 20 | Bodyweight/functional exercises |
| `running` | 37 | Cardio workouts |
| `cycling` | 13 | Cardio workouts |
| `walking` | 52 | Cardio/rest day walks |
| `yoga` | 57 | Mobility workouts |
| `pilates` | 66 | Mobility workouts |
| `flexibility` | 62 | Mobility/stretching |
| `highIntensityIntervalTraining` | 63 | HIIT cardio |
| `coreTraining` | 59 | Core-focused workouts |
| `cooldown` | 80 | Post-workout cooldown |
| `mindAndBody` | 29 | Mindfulness/recovery |
| `swimming` | 46 | Cardio workouts |
| `rowing` | 35 | Cardio workouts |
| `elliptical` | 16 | Cardio workouts |
| `stairClimbing` | 44 | Cardio workouts |

#### Full Workout Activity Type List (84 types)

All supported types include: American Football, Archery, Australian Football, Badminton, Barre, Baseball, Basketball, Bowling, Boxing, Cardio Dance, Climbing, Cooldown, Core Training, Cricket, Cross Country Skiing, Cross Training, Curling, Cycling, Dance, Disc Sports, Downhill Skiing, Elliptical, Equestrian Sports, Fencing, Fishing, Fitness Gaming, Flexibility, Functional Strength Training, Golf, Gymnastics, Hand Cycling, Handball, High Intensity Interval Training, Hiking, Hockey, Hunting, Jump Rope, Kickboxing, Lacrosse, Martial Arts, Mind and Body, Mixed Cardio, Mixed Metabolic Cardio Training, Paddle Sports, Pickleball, Pilates, Play, Preparation and Recovery, Racquetball, Rowing, Rugby, Running, Sailing, Skating Sports, Snow Sports, Snowboarding, Soccer, Social Dance, Softball, Squash, Stair Climbing, Stairs, Step Training, Surfing Sports, Swim Bike Run, Swimming, Table Tennis, Tai Chi, Tennis, Track and Field, Traditional Strength Training, Transition, Underwater Diving, Volleyball, Walking, Water Fitness, Water Polo, Water Sports, Wheelchair Walk Pace, Wheelchair Run Pace, Wrestling, Yoga, Other.

### Body Measurements

| Data Type | Identifier | Unit |
|-----------|-----------|------|
| Body Mass (Weight) | `bodyMass` | kg / lb |
| Height | `height` | cm / in |
| Body Fat Percentage | `bodyFatPercentage` | % |
| Body Mass Index | `bodyMassIndex` | count |
| Lean Body Mass | `leanBodyMass` | kg / lb |
| Waist Circumference | `waistCircumference` | cm / in |

### Heart and Cardiovascular Data

| Data Type | Identifier | Unit | Source |
|-----------|-----------|------|--------|
| Heart Rate | `heartRate` | bpm | Apple Watch |
| Resting Heart Rate | `restingHeartRate` | bpm | Apple Watch |
| Walking Heart Rate Average | `walkingHeartRateAverage` | bpm | Apple Watch |
| Heart Rate Variability (HRV) | `heartRateVariabilitySDNN` | ms | Apple Watch |
| Cardio Fitness (VO2 Max) | `vo2Max` | mL/kg/min | Apple Watch |
| Peripheral Perfusion Index | `peripheralPerfusionIndex` | % | Apple Watch |
| Apple Walking Steadiness | `appleWalkingSteadiness` | % | iPhone |

### Sleep Data

Sleep analysis uses category samples (`HKCategoryTypeIdentifierSleepAnalysis`) with the following stages:

| Sleep Stage | Value | Description |
|------------|-------|-------------|
| `inBed` | 0 | User is in bed |
| `asleepUnspecified` | 1 | Asleep, stage not determined |
| `awake` | 2 | Awake during sleep session |
| `asleepCore` | 3 | Light/intermediate sleep |
| `asleepDeep` | 4 | Deep sleep |
| `asleepREM` | 5 | REM sleep |

Sleep tracking provides: total time in bed, total time asleep, time in each stage, sleep schedule consistency, and respiratory rate during sleep.

### Nutrition Data

| Data Type | Identifier | Unit |
|-----------|-----------|------|
| Dietary Energy (Calories) | `dietaryEnergyConsumed` | kcal |
| Dietary Protein | `dietaryProtein` | g |
| Dietary Carbohydrates | `dietaryCarbohydrates` | g |
| Dietary Fat Total | `dietaryFatTotal` | g |
| Dietary Fiber | `dietaryFiber` | g |
| Dietary Sugar | `dietarySugar` | g |
| Dietary Water | `dietaryWater` | mL |
| Dietary Sodium | `dietarySodium` | mg |
| Dietary Caffeine | `dietaryCaffeine` | mg |
| Dietary Cholesterol | `dietaryCholesterol` | mg |
| Dietary Fat Saturated | `dietaryFatSaturated` | g |
| Dietary Fat Polyunsaturated | `dietaryFatPolyunsaturated` | g |
| Dietary Fat Monounsaturated | `dietaryFatMonounsaturated` | g |
| Dietary Calcium | `dietaryCalcium` | mg |
| Dietary Iron | `dietaryIron` | mg |
| Dietary Potassium | `dietaryPotassium` | mg |
| Dietary Vitamin A | `dietaryVitaminA` | mcg |
| Dietary Vitamin C | `dietaryVitaminC` | mg |
| Dietary Vitamin D | `dietaryVitaminD` | mcg |

(HealthKit supports 60+ nutritional data types in total)

### Vitals

| Data Type | Identifier | Unit |
|-----------|-----------|------|
| Blood Pressure Systolic | `bloodPressureSystolic` | mmHg |
| Blood Pressure Diastolic | `bloodPressureDiastolic` | mmHg |
| Respiratory Rate | `respiratoryRate` | breaths/min |
| Body Temperature | `bodyTemperature` | degC / degF |
| Basal Body Temperature | `basalBodyTemperature` | degC / degF |
| Blood Oxygen Saturation (SpO2) | `oxygenSaturation` | % |
| Blood Glucose | `bloodGlucose` | mg/dL |

### Mindfulness Data

| Data Type | Type | Description |
|-----------|------|-------------|
| Mindful Sessions | `HKCategoryTypeIdentifierMindfulSession` | Mindfulness/meditation session duration |
| State of Mind | `HKStateOfMind` | Mood and emotional state logging |

### Other Notable Data Types

- **Menstrual Cycle Tracking**: Menstrual flow, ovulation, sexual activity, symptoms
- **Hearing**: Environmental sound levels, headphone audio levels
- **UV Exposure**: UV index exposure
- **Fall Detection Events**: Fall detection from Apple Watch
- **Electrocardiogram (ECG)**: ECG waveform data from Apple Watch
- **Wrist Temperature**: Temperature during sleep (Apple Watch Ultra/Series 8+)

---

## How to Access HealthKit

### The Fundamental Constraint

HealthKit is a **native iOS framework**. There is no REST API, no cloud endpoint, and no way to access it from a standard web browser. Your code must run inside a native iOS application context to call HealthKit APIs.

### Access Methods

#### 1. Native iOS App (Swift/SwiftUI)
- Direct access to the full HealthKit API
- Best performance and most complete feature set
- Requires Xcode, Apple Developer account ($99/year)
- App Store distribution (review process)

#### 2. React Native Bridge
- Libraries like `react-native-health` or `@kingstinct/react-native-healthkit`
- Write JavaScript/TypeScript, bridge to native HealthKit calls
- Good coverage of common data types
- Requires native iOS build tooling (Xcode)

#### 3. Capacitor Plugin (for web apps)
- Plugins like `@capgo/capacitor-health` or `@perfood/capacitor-healthkit`
- Wrap your existing web app in a native iOS shell
- Access HealthKit through the plugin's JavaScript API
- **This is the most relevant option for this PWA**

#### 4. Apple Health Export (XML)
- Users can manually export all health data as a ZIP file containing XML
- Export path: Health app > Profile icon > Export All Health Data
- Results in `export.xml` (can be 100MB+) with all records
- XML structure: `<HealthData>` root with `<Record>` and `<Workout>` child elements
- Good for one-time data migration, terrible for ongoing sync
- No programmatic access; requires manual user action each time

#### 5. Third-Party Sync Services
- Services like Terra API, Validic, or Human API can act as intermediaries
- They provide a companion iOS app that reads HealthKit and syncs to a cloud API
- Your web app then reads from their REST API
- Adds cost, latency, and a third-party dependency
- The user must install the companion app

### PWA Limitations -- The Hard Truth

**A PWA running in Safari or a home-screen web app CANNOT access HealthKit. Period.**

- Web APIs like the Generic Sensor API do not expose HealthKit data
- There is no W3C standard for health data access from browsers
- Safari does not and will not bridge HealthKit to web content
- Service workers have no access to HealthKit
- This is by design: Apple treats health data as requiring native-level trust

---

## Authentication and Permissions

### How HealthKit Authorization Works

HealthKit uses a **granular, per-data-type permission model**. Apps must request read and/or write access for each specific data type they want to use.

#### Authorization Flow

1. **Enable HealthKit Capability**: Add the HealthKit entitlement in Xcode under Signing & Capabilities
2. **Add Info.plist Keys**:
   - `NSHealthShareUsageDescription` -- explains why the app needs to read health data
   - `NSHealthUpdateUsageDescription` -- explains why the app needs to write health data
3. **Request Authorization at Runtime**: Call `requestAuthorization(toShare:read:completion:)` with specific data types
4. **System Permission Sheet**: iOS presents a modal showing each requested data type with individual toggles
5. **User Grants/Denies Per Type**: The user can allow steps but deny heart rate, for example
6. **App Cannot Determine Denied Status**: For privacy, HealthKit does not tell you if a user denied a specific read permission -- queries simply return no data

#### Key Authorization Behaviors

- **Read vs Write are separate**: An app can have write access without read access, and vice versa
- **No "allow all" option**: Users must individually review each data type
- **Authorization persists**: Once granted, permission remains until the user revokes it in Settings > Health > Data Access & Devices
- **Cannot detect denial**: The completion handler boolean indicates whether the user *responded* to the prompt, not whether they granted access. If read permission is denied, queries return empty results silently
- **Re-prompting**: If you request authorization for types already authorized, the system skips those types in the prompt. You can safely call `requestAuthorization` each time your app launches

#### Permission Categories

| Permission Level | Description |
|-----------------|-------------|
| **Read** | Query existing data from HealthKit |
| **Write (Share)** | Save new data samples to HealthKit |
| **Read + Write** | Both query and save for a data type |

---

## Integration Ideas for a Workout Tracker PWA

### 1. Write Completed Gym Workouts to Apple Health

**Value**: Workouts logged in the app appear in Apple Health and count toward Activity Rings.

- Map workout sessions to `HKWorkoutActivityType.traditionalStrengthTraining`
- Include duration, start/end time, and estimated calories burned
- Each exercise set could contribute to the workout's metadata
- Users see unified workout history across all their health apps

### 2. Read Workout History from Apple Health

**Value**: Import workouts done outside the app (Apple Watch workouts, other gym apps).

- Query `HKWorkoutType` for recent workouts
- Filter by activity types relevant to strength training
- Display alongside app-native workout history
- Avoid duplicates by checking source bundle identifiers

### 3. Sync Body Weight for Progression Tracking

**Value**: Automatic weight updates without manual entry.

- Read `bodyMass` samples to track weight over time
- Write weight entries logged in the app back to HealthKit
- Use the latest weight reading for progression calculations
- Chart weight trends alongside strength gains

### 4. Import Heart Rate Data for Workout Intensity

**Value**: Show real workout intensity from Apple Watch data.

- Query heart rate samples during workout time windows
- Calculate average, max, and min heart rate per workout
- Derive heart rate zones for cardio sessions
- Display HRV trends for recovery assessment

### 5. Read Sleep and Recovery Data

**Value**: Suggest workout intensity based on recovery status.

- Read sleep analysis for previous night (duration, stages)
- Use HRV trends to estimate recovery readiness
- Show a "recovery score" or suggestion on the Home page
- Recommend lighter workouts after poor sleep

### 6. Step Count Display on Home Page

**Value**: Quick glance at daily activity alongside workout schedule.

- Read today's step count from `stepCount`
- Display on the Home page weather card area or as a stat
- Show weekly step trend
- No Apple Watch required (iPhone counts steps)

### 7. Read Cardio Fitness (VO2 Max) Trends

**Value**: Long-term fitness improvement tracking.

- Read `vo2Max` samples over time
- Display trend chart in Profile or Stats section
- Correlate with workout consistency

### 8. Nutrition Data Integration

**Value**: Track macros alongside workouts.

- Read dietary data if user logs food in another app (MyFitnessPal, etc.)
- Display calorie/protein intake on workout days
- Help users understand nutrition's impact on performance

---

## Technical Integration Approaches

### Option A: Capacitor Wrapper (Recommended for This Project)

Convert the existing Vite/React PWA into a native iOS app using Capacitor.

**How it works**:
- Capacitor wraps the web app in a native iOS WebView (WKWebView)
- Native plugins bridge JavaScript calls to native iOS APIs (including HealthKit)
- The web app code remains largely unchanged
- Build for both web (PWA) and iOS (native) from the same codebase

**Pros**:
- Minimal changes to existing React/TypeScript codebase
- Same code runs as PWA in browser AND native iOS app
- Access to HealthKit via Capacitor plugins
- Access to other native APIs (push notifications, haptics, etc.)
- Can still deploy the web version to Vercel
- Active plugin ecosystem (`@capgo/capacitor-health`, `@perfood/capacitor-healthkit`)

**Cons**:
- Adds iOS build complexity (Xcode, provisioning profiles)
- Requires Apple Developer account ($99/year) for App Store
- WebView performance slightly below fully native
- Plugin coverage may not include all HealthKit data types
- Must maintain both web and native deployment pipelines
- App Store review process adds friction to releases

**Estimated effort**: 2-4 weeks for initial setup and basic HealthKit integration

---

### Option B: React Native Module

Rebuild the app (or parts of it) in React Native with HealthKit access.

**How it works**:
- Use `react-native-health` or `@kingstinct/react-native-healthkit` packages
- HealthKit calls are bridged to native iOS code
- App renders with native UI components instead of web views

**Pros**:
- Better HealthKit library maturity and community support
- Native UI performance
- `@kingstinct/react-native-healthkit` has strong TypeScript support
- Large React Native ecosystem for other native features

**Cons**:
- Requires rewriting the entire UI (React DOM is not React Native)
- TailwindCSS, Framer Motion, and existing component library would not transfer
- Essentially building a new app from scratch
- Cannot share code with the web PWA version
- Two completely separate codebases to maintain

**Estimated effort**: 3-6 months for a full rewrite

---

### Option C: Companion Native App that Syncs to Supabase

Build a small native iOS app whose sole purpose is to read/write HealthKit and sync data to the Supabase backend. The main PWA reads/writes from Supabase as usual.

**How it works**:
- Lightweight Swift app reads HealthKit data on a schedule (background refresh)
- Writes health data to Supabase tables (e.g., `health_metrics`, `health_workouts`)
- PWA reads from these tables via existing TanStack Query hooks
- PWA writes workout completions to Supabase; companion app picks them up and writes to HealthKit

**Pros**:
- PWA code stays completely untouched
- Clean separation of concerns
- Companion app can use background refresh for periodic syncing
- Best HealthKit API coverage (full native Swift access)
- PWA continues to work on Android and desktop browsers

**Cons**:
- Two separate apps to develop and maintain
- User must install both apps
- Sync latency (not real-time)
- Background refresh is unreliable on iOS (system-managed schedule)
- Complex data conflict resolution between two sources of truth
- Still requires Apple Developer account and App Store submission

**Estimated effort**: 4-8 weeks for the companion app

---

### Option D: Apple Health Export File Parsing

Allow users to manually export their Apple Health data and upload the XML file.

**How it works**:
- User exports data from Health app (Settings > Health > Export All Health Data)
- User uploads the exported ZIP/XML file through the PWA
- Server or client-side parser extracts relevant data (workouts, weight, steps)
- Data is imported into Supabase tables

**Pros**:
- No native code required at all
- Works with the existing PWA architecture
- Access to ALL historical health data
- No Apple Developer account needed

**Cons**:
- Terrible user experience (manual export, file upload)
- Export files can be 100MB+ (slow upload, parsing)
- No ongoing sync (one-time snapshot)
- Users must repeat the process for new data
- Write-back to HealthKit is impossible
- XML parsing is resource-intensive in the browser
- Not viable for regular use; only for initial data migration

**Estimated effort**: 1-2 weeks

---

### Comparison Summary

| Criteria | Capacitor | React Native | Companion App | XML Export |
|----------|-----------|-------------|---------------|------------|
| **Code reuse** | High | None | High (PWA unchanged) | High |
| **HealthKit coverage** | Moderate | High | Full | Read-only |
| **User experience** | Good | Best | Okay (two apps) | Poor |
| **Development effort** | Low-Medium | Very High | Medium | Low |
| **Ongoing maintenance** | Medium | High | High | Low |
| **App Store required** | Yes | Yes | Yes | No |
| **Write to HealthKit** | Yes | Yes | Yes | No |
| **Real-time sync** | Yes | Yes | No (delayed) | No |
| **Android support** | Yes (Health Connect) | Partial | N/A | N/A |

**Recommendation**: **Option A (Capacitor)** is the best fit for this project. It preserves the existing React/TypeScript/Vite codebase, adds native iOS capabilities with minimal refactoring, and provides a path to the App Store while keeping the PWA functional for non-iOS users.

---

## PWA-Specific Challenges

### Why PWAs Cannot Access HealthKit

1. **No Web API exists**: There is no browser API, W3C specification, or web standard that exposes health data. The Web Bluetooth and Generic Sensor APIs do not cover HealthKit.

2. **Safari sandboxing**: Safari (and all iOS browsers, which use WebKit under the hood) does not expose native framework access to web content. This is a deliberate security boundary.

3. **Apple's philosophy**: Apple treats health data as requiring the highest level of trust. Only apps reviewed by Apple and granted the HealthKit entitlement can access health data. Web apps do not go through this review process.

4. **No Service Worker bridge**: Service workers run in a web context and have no mechanism to call native iOS APIs.

5. **Home screen web apps**: Even when a PWA is added to the iOS home screen, it runs in a WebKit sandbox with the same restrictions as Safari. It does not gain native API access.

### Workarounds and Their Trade-offs

| Workaround | Viability | Trade-off |
|-----------|-----------|-----------|
| Capacitor wrapper | Best option | Adds native build complexity |
| Third-party sync API (Terra, etc.) | Viable | Cost, latency, privacy concerns |
| Manual XML export | Works once | Terrible recurring UX |
| Shortcut Automations | Limited | Fragile, user must configure |
| Health Records on FHIR | Clinical data only | Not relevant for fitness tracking |

### What the PWA CAN Do Without HealthKit

Even without HealthKit access, the PWA can still:
- Use the **Web Accelerometer API** for basic motion detection
- Access **Geolocation API** for outdoor workout route tracking
- Use **Web Notifications** for workout reminders (with limitations on iOS)
- Store data offline with **IndexedDB** and service workers
- Track workouts with manual input (current approach)

---

## Data Privacy

### Apple's Health Data Privacy Requirements

Apple enforces strict privacy rules for any app accessing HealthKit:

#### Mandatory Requirements

1. **Privacy Policy**: Apps must provide a privacy policy detailing how health data is used
2. **No Advertising**: Health data cannot be used for advertising or sold to data brokers
3. **No Third-Party Sharing**: Health data must not be disclosed to third parties for advertising or data mining
4. **Purpose Limitation**: Health data may only be used for improving health management or health research
5. **User Consent**: All data access requires explicit user authorization through the iOS permission system
6. **Minimal Data Collection**: Apps should only request access to data types they actually need
7. **No iCloud Storage**: Apple does not allow developers to store personal health data in iCloud (it can only be stored in the device's local HealthKit store or your own backend with user consent)

#### App Store Review

- Apps using HealthKit undergo additional scrutiny during App Store review
- The app must clearly explain to the user why each health data type is needed
- Usage descriptions in `Info.plist` must be accurate and specific
- Misleading or incomplete privacy descriptions will result in rejection

#### On-Device Processing

- HealthKit data is encrypted at rest on the device
- Data is protected by the device passcode
- HealthKit data is included in encrypted device backups but NOT in unencrypted backups
- Health data syncs between user's devices via iCloud end-to-end encryption (Apple cannot read it)

#### Developer Obligations

If syncing HealthKit data to a backend (like Supabase):
- Must disclose this in the privacy policy
- Must use encrypted transport (HTTPS)
- Must provide a way for users to delete their health data from your servers
- Must not retain data longer than necessary
- Should implement Row Level Security (already in place with Supabase RLS)
- Consider HIPAA compliance if operating in a healthcare context

---

## Limitations

### Platform Limitations
- **iOS only**: HealthKit is not available on Android. Android has Google Health Connect (formerly Google Fit) as a separate, incompatible framework
- **No web access**: No browser API, no REST API, no cloud endpoint
- **Apple Watch dependency**: Many data types (heart rate, HRV, sleep stages, VO2 max) require an Apple Watch. Without one, only step count, distance, and flights climbed are available from the iPhone
- **No real-time streaming**: Cannot get live heart rate data in a web context; even native apps use the Workout Session API on watchOS for live data

### Data Limitations
- **Read permission opacity**: Your app cannot determine if a user denied read access to a specific data type. Queries simply return empty results
- **Historical data access**: When first authorized, you get access to all historical data, but Apple may throttle large queries
- **Source priority**: When multiple apps write the same data type, HealthKit uses a user-defined source priority list to determine which value to surface
- **No push notifications for data changes**: You must poll or use `HKObserverQuery` (native only) for data updates

### Integration Limitations
- **Capacitor plugin gaps**: Not all HealthKit data types are covered by existing Capacitor plugins. You may need to write custom native plugin code for advanced features
- **Background sync restrictions**: iOS aggressively manages background execution. Background app refresh is not guaranteed to run on a predictable schedule
- **Write conflicts**: If both Apple Watch and your app write workouts, deduplication logic is needed
- **No cross-platform HealthKit**: There is no way to access a user's HealthKit data from a Mac, Windows, or Android device

---

## Code Examples

### Capacitor Plugin Setup (@capgo/capacitor-health)

#### Installation

```bash
npm install @capgo/capacitor-health
npx cap sync
```

#### Xcode Configuration

1. Open the iOS project in Xcode: `npx cap open ios`
2. Enable HealthKit under Signing & Capabilities
3. Add to `Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>We read your workout and activity data to display your fitness history and track progress.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We save your completed workouts to Apple Health so they count toward your Activity Rings.</string>
```

#### Check Availability

```typescript
import { Health } from '@capgo/capacitor-health';

async function checkHealthAvailable(): Promise<boolean> {
  const { available } = await Health.isAvailable();
  return available;
}
```

#### Request Authorization

```typescript
import { Health } from '@capgo/capacitor-health';

async function requestHealthPermissions(): Promise<void> {
  try {
    await Health.requestAuthorization({
      read: [
        'steps',
        'weight',
        'heartRate',
        'calories',
        'distance',
        'sleep',
        'heartRateVariability',
        'restingHeartRate',
        'oxygenSaturation',
      ],
      write: [
        'weight',
        'calories',
      ],
    });
    console.log('HealthKit authorization requested successfully');
  } catch (error) {
    console.error('HealthKit authorization failed:', error);
  }
}
```

#### Read Step Count

```typescript
import { Health } from '@capgo/capacitor-health';

async function getTodaySteps(): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const { samples } = await Health.readSamples({
    dataType: 'steps',
    startDate: startOfDay.toISOString(),
    endDate: now.toISOString(),
    limit: 0, // no limit
  });

  // Sum all step samples for today
  const totalSteps = samples.reduce(
    (sum, sample) => sum + (sample.value ?? 0),
    0
  );
  return totalSteps;
}
```

#### Read Body Weight History

```typescript
import { Health } from '@capgo/capacitor-health';

interface WeightEntry {
  date: string;
  weightKg: number;
  source: string;
}

async function getWeightHistory(days: number = 30): Promise<WeightEntry[]> {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const { samples } = await Health.readSamples({
    dataType: 'weight',
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    limit: 0,
  });

  return samples.map((sample) => ({
    date: sample.startDate,
    weightKg: sample.value,
    source: sample.sourceName ?? 'Unknown',
  }));
}
```

#### Write Body Weight

```typescript
import { Health } from '@capgo/capacitor-health';

async function saveWeight(weightKg: number): Promise<void> {
  await Health.saveSample({
    dataType: 'weight',
    value: weightKg, // always in kilograms
  });
  console.log(`Saved weight: ${weightKg} kg to HealthKit`);
}
```

#### Query Workouts

```typescript
import { Health } from '@capgo/capacitor-health';

async function getRecentWorkouts(days: number = 7) {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const { workouts } = await Health.queryWorkouts({
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
    limit: 50,
  });

  return workouts.map((workout) => ({
    type: workout.workoutActivityName,
    startDate: workout.startDate,
    endDate: workout.endDate,
    duration: workout.duration, // seconds
    calories: workout.totalEnergyBurned,
    distance: workout.totalDistance,
    source: workout.sourceName,
  }));
}
```

#### Read Aggregated Data

```typescript
import { Health } from '@capgo/capacitor-health';

async function getWeeklyStepsSummary() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const result = await Health.queryAggregated({
    dataType: 'steps',
    startDate: sevenDaysAgo.toISOString(),
    endDate: now.toISOString(),
    bucket: 'day', // aggregate by day
  });

  return result;
}
```

### Alternative: @perfood/capacitor-healthkit

#### Installation

```bash
npm install @perfood/capacitor-healthkit
npx cap sync
```

#### Request Authorization

```typescript
import { CapacitorHealthkit } from '@perfood/capacitor-healthkit';

const READ_PERMISSIONS = [
  'calories',
  'stairs',
  'activity',
  'steps',
  'distance',
  'duration',
  'weight',
];

async function requestAuth(): Promise<void> {
  await CapacitorHealthkit.requestAuthorization({
    all: [],
    read: READ_PERMISSIONS,
    write: [],
  });
}
```

#### Query Workout Data

```typescript
import { CapacitorHealthkit, SampleNames } from '@perfood/capacitor-healthkit';

async function getWorkouts() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const endDate = new Date();

  const result = await CapacitorHealthkit.queryHKitSampleType({
    sampleName: SampleNames.WORKOUT_TYPE,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    limit: 0,
  });

  return result;
}
```

### React Native Example (@kingstinct/react-native-healthkit)

```typescript
import {
  requestAuthorization,
  queryWorkoutSamples,
  getPreferredUnits,
  HKQuantityTypeIdentifier,
  HKWorkoutActivityType,
} from '@kingstinct/react-native-healthkit';

// Request permissions
await requestAuthorization([
  HKQuantityTypeIdentifier.heartRate,
  HKQuantityTypeIdentifier.activeEnergyBurned,
  HKQuantityTypeIdentifier.stepCount,
  HKQuantityTypeIdentifier.bodyMass,
]);

// Query workouts from the last 7 days
const workouts = await queryWorkoutSamples({
  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  to: new Date(),
});

for (const workout of workouts) {
  console.log(`${workout.workoutActivityType}: ${workout.duration}s`);
}
```

### React Native Example (react-native-health)

```typescript
import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from 'react-native-health';

// Define permissions
const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.BodyMass,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Workout,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.BodyMass,
      AppleHealthKit.Constants.Permissions.Workout,
    ],
  },
};

// Initialize HealthKit
AppleHealthKit.initHealthKit(permissions, (error: string) => {
  if (error) {
    console.error('Cannot initialize HealthKit:', error);
    return;
  }

  // Read today's steps
  const stepOptions: HealthInputOptions = {
    date: new Date().toISOString(),
    includeManuallyAdded: false,
  };

  AppleHealthKit.getStepCount(stepOptions, (err, results) => {
    if (err) {
      console.error('Error getting steps:', err);
      return;
    }
    console.log('Steps today:', results.value);
  });

  // Read weight samples
  const weightOptions: HealthInputOptions = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    ascending: false,
    limit: 10,
  };

  AppleHealthKit.getWeightSamples(weightOptions, (err, results) => {
    if (err) {
      console.error('Error getting weight:', err);
      return;
    }
    console.log('Recent weights:', results);
  });

  // Save a workout
  const workoutOptions = {
    type: AppleHealthKit.Constants.Activities.TraditionalStrengthTraining,
    startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    endDate: new Date().toISOString(),
    energyBurned: 350, // kcal
  };

  AppleHealthKit.saveWorkout(workoutOptions, (err, results) => {
    if (err) {
      console.error('Error saving workout:', err);
      return;
    }
    console.log('Workout saved to HealthKit');
  });
});
```

### Conditional HealthKit Usage in a Cross-Platform App

Since the PWA runs on web and may also run as a Capacitor app, you should conditionally use HealthKit:

```typescript
import { Capacitor } from '@capacitor/core';

// healthKitService.ts
class HealthKitService {
  private isNative: boolean;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isNative) return false;

    try {
      const { Health } = await import('@capgo/capacitor-health');
      const { available } = await Health.isAvailable();
      return available;
    } catch {
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isNative) return false;

    try {
      const { Health } = await import('@capgo/capacitor-health');
      await Health.requestAuthorization({
        read: ['steps', 'weight', 'heartRate', 'calories', 'sleep'],
        write: ['weight', 'calories'],
      });
      return true;
    } catch (error) {
      console.error('HealthKit permission request failed:', error);
      return false;
    }
  }

  async getTodaySteps(): Promise<number | null> {
    if (!this.isNative) return null;

    try {
      const { Health } = await import('@capgo/capacitor-health');
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const { samples } = await Health.readSamples({
        dataType: 'steps',
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        limit: 0,
      });

      return samples.reduce((sum, s) => sum + (s.value ?? 0), 0);
    } catch {
      return null;
    }
  }
}

export const healthKit = new HealthKitService();
```

### Usage in a React Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { healthKit } from '@/services/healthKitService';

export function useHealthKitSteps() {
  return useQuery({
    queryKey: ['healthkit', 'steps', 'today'],
    queryFn: () => healthKit.getTodaySteps(),
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });
}

export function useHealthKitAvailable() {
  return useQuery({
    queryKey: ['healthkit', 'available'],
    queryFn: () => healthKit.isAvailable(),
    staleTime: Infinity,
  });
}
```

---

## References

- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [HealthKit Data Types](https://developer.apple.com/documentation/healthkit/data-types)
- [HKQuantityTypeIdentifier](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier)
- [HKWorkoutActivityType](https://developer.apple.com/documentation/healthkit/hkworkoutactivitytype)
- [Authorizing Access to Health Data](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data)
- [Protecting User Privacy](https://developer.apple.com/documentation/healthkit/protecting-user-privacy)
- [Setting Up HealthKit](https://developer.apple.com/documentation/healthkit/setting-up-healthkit)
- [Apple Health Privacy White Paper](https://www.apple.com/privacy/docs/Health_Privacy_White_Paper_May_2023.pdf)
- [@capgo/capacitor-health Plugin](https://github.com/Cap-go/capacitor-health)
- [@perfood/capacitor-healthkit Plugin](https://github.com/perfood/capacitor-healthkit)
- [@kingstinct/react-native-healthkit](https://github.com/kingstinct/react-native-healthkit)
- [react-native-health](https://github.com/agencyenterprise/react-native-health)
- [HKWorkoutActivityType Descriptions (Complete List)](https://github.com/georgegreenoflondon/HKWorkoutActivityType-Descriptions)
- [HKWorkoutActivityType - Microsoft Learn (.NET Reference)](https://learn.microsoft.com/en-us/dotnet/api/healthkit.hkworkoutactivitytype)
