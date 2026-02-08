# Workout App API Research Report

*Compiled: February 1, 2026*

---

## Executive Summary

This report covers free/freemium APIs and MCP servers for building a modern workout application with exercise demonstrations, health integrations, and AI-powered features.

---

## Part 1: Exercise & Workout APIs (with Demo Content)

### Top Recommendations

| API | Exercises | Videos/GIFs | Free Tier | Best For |
|-----|-----------|-------------|-----------|----------|
| **ExerciseDB** | 11,000+ | ✅ Yes | ✅ Yes | Media-rich apps |
| **MuscleWiki** | 1,700+ | ✅ 6,800+ videos | 3k calls/mo | Video-focused apps |
| **Wger** | Extensive | ❌ | ✅ Unlimited | Self-hosted, open-source |
| **Free-Exercise-DB** | 800 | ❌ | ✅ Full | Simple integrations |

---

### 1. ExerciseDB API ⭐ Recommended

**URL:** https://exercisedb.dev | [GitHub](https://github.com/ExerciseDB/exercisedb-api)

**What You Get:**
- 11,000+ exercises with high-quality GIFs
- Step-by-step instructions
- Target body parts and muscle groups
- Equipment requirements

**Pricing:** Free tier via RapidAPI, open-source version on GitHub

**Why It's Great:** Most comprehensive free option with actual visual demonstrations

---

### 2. MuscleWiki API ⭐ Best for Video

**URL:** https://api.musclewiki.com

**What You Get:**
- 1,700+ exercises
- 6,800+ video demonstrations
- 45 muscle groups covered
- Multiple detail levels (minimal, standard, detailed)

**Pricing:** 3,000 API calls/month free (no credit card)

**Why It's Great:** Highest video content count, excellent for showing proper form

---

### 3. Wger API (Open Source)

**URL:** https://wger.de/en/software/api

**What You Get:**
- Comprehensive exercise database
- Workout creation/management
- Nutritional data (2M+ foods)
- Can self-host entire platform

**Pricing:** 100% free, unlimited, GNU AGPLv3 license

**Why It's Great:** No restrictions, full control, includes nutrition data

---

### 4. Free-Exercise-DB (GitHub)

**URL:** https://github.com/yuhonas/free-exercise-db

**What You Get:**
- 800 exercises in public domain
- JSON format (download, no API calls needed)
- Exercise images included
- Primary/secondary muscle groups

**Pricing:** Completely free, public domain

**Why It's Great:** Zero API costs, easy to integrate, no rate limits

---

### 5. API Ninjas Exercises

**URL:** https://www.api-ninjas.com/api/exercises

**What You Get:**
- 3,000+ exercises
- Difficulty levels (beginner/intermediate/expert)
- Equipment and muscle targeting
- Text instructions (no videos)

**Pricing:** Free tier (non-commercial only)

**Why It's Great:** Good filtering options, clear difficulty ratings

---

## Part 2: Health Integration APIs

### Wearable Device APIs

| API | Free Tier | Auth | Best For |
|-----|-----------|------|----------|
| **Fitbit** | ✅ Personal use | OAuth 2.0 + PKCE | Consumer fitness tracking |
| **Apple HealthKit** | ✅ Free (iOS native) | User consent | iOS-native apps |
| **Garmin Connect** | ✅ After approval | OAuth 2.0 + PKCE | Garmin ecosystem |
| **WHOOP** | ✅ With membership | OAuth 2.0 | Recovery/strain focus |
| **Google Fit** | ⚠️ DEPRECATED | - | Not recommended |

---

### Nutrition APIs

| API | Free Tier | Auth | Database Size |
|-----|-----------|------|---------------|
| **USDA FoodData Central** ⭐ | ✅ Unlimited | API key | 380,000+ foods |
| **Open Food Facts** | ✅ Unlimited | None required | Community-sourced |
| **Edamam** | ✅ Rate limited | API key | 900,000+ foods |
| **Nutritionix** | ⚠️ 2 users only | API key | Not practical |

---

### Recommended Nutrition Stack

**Primary:** USDA FoodData Central (free, unlimited, government-validated)
- URL: https://fdc.nal.usda.gov
- 1,000 requests/hour
- Simple API key from data.gov

**Secondary:** Open Food Facts (crowdsourced product data)
- URL: https://world.openfoodfacts.org
- No auth required
- Great for barcode scanning

---

## Part 3: AI/ML APIs for Modern Features

### Pose Estimation (Form Analysis)

| Solution | Cost | Platform | Use Case |
|----------|------|----------|----------|
| **MediaPipe** ⭐ | Free | Web/Mobile/Desktop | Real-time form tracking |
| **Google ML Kit Pose** | Free | iOS/Android | Native mobile apps |
| **YOLO11 Pose** | Free | Any | Fast, efficient detection |
| **Roboflow** | Freemium | API | Pre-trained workout models |

**Recommendation:** MediaPipe for web apps, ML Kit for native mobile

---

### AI Coaching & Recommendations

| API | Free Tier | Best For |
|-----|-----------|----------|
| **Claude API** | Limited credits | Workout plans, form tips, coaching |
| **OpenAI API** | Limited credits | Natural language interaction |
| **Hugging Face** | Free credits | Custom model hosting |

---

### Voice Commands

| Solution | Cost | Notes |
|----------|------|-------|
| **Web Speech API** ⭐ | Free | Browser-based, no server needed |
| **Google Cloud Speech** | 60 min/mo free | High accuracy, 85+ languages |
| **Hugging Face ASR** | Free credits | 17,000+ models available |

**Recommendation:** Start with Web Speech API (zero cost), upgrade to GCP if needed

---

## Part 4: MCP Servers for Modern Integration

### Fitness-Specific MCP Servers

| MCP Server | Purpose | Free |
|------------|---------|------|
| **Hevy Fitness MCP** | Workout routines & exercise database | Freemium |
| **Strava MCP** | Activity tracking & analytics | Freemium |
| **Apple Health MCP** | Health metrics from iOS | Free (local) |
| **Fitness Coach MCP** | AI-powered coaching | Open-source |

---

### Database & Storage MCP Servers

| MCP Server | Purpose | Free Tier |
|------------|---------|-----------|
| **Supabase** ⭐ | PostgreSQL + Auth + Real-time | Yes |
| **GreptimeDB** | Time-series metrics | Open-source |
| **Kuzu** | Graph relationships | Open-source |

---

### Scheduling MCP Servers

| MCP Server | Purpose |
|------------|---------|
| **Apple Calendar MCP** | Workout scheduling (macOS) |
| **CalDAV MCP** | Cross-platform calendar |
| **Calendly MCP** | Personal training sessions |

---

## Recommended Tech Stack

### For MVP (Free Tier)

```
Exercise Data:     ExerciseDB (free) or Free-Exercise-DB (open-source)
Form Analysis:     MediaPipe (free, open-source)
Voice Commands:    Web Speech API (free, browser-native)
Nutrition Data:    USDA FoodData Central (free, unlimited)
Data Storage:      Supabase free tier
Scheduling:        Apple Calendar MCP or CalDAV
```

### For Scaling

```
Exercise Data:     MuscleWiki API (paid tier for more calls)
Form Analysis:     + Google Cloud Vision ($300 credits)
AI Coaching:       Claude API with batch processing (50% discount)
Wearables:         Fitbit/Garmin OAuth integration
Time-Series:       GreptimeDB for workout metrics
```

---

## Quick Start Links

### Exercise APIs
- ExerciseDB: https://exercisedb.dev
- MuscleWiki: https://api.musclewiki.com
- Wger: https://wger.de/en/software/api
- Free-Exercise-DB: https://github.com/yuhonas/free-exercise-db

### Health APIs
- USDA FoodData: https://fdc.nal.usda.gov/api-guide/
- Fitbit: https://dev.fitbit.com
- Garmin: https://developer.garmin.com/gc-developer-program/

### AI/ML
- MediaPipe: https://developers.google.com/mediapipe
- Roboflow Pose: https://roboflow.com
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

### MCP Servers
- MCP Registry: https://github.com/modelcontextprotocol/servers
- Supabase: https://supabase.com

---

## Key Takeaways

1. **For Exercise Demos:** ExerciseDB or MuscleWiki give you the best visual content for free
2. **For Nutrition:** USDA FoodData Central is free, unlimited, and government-validated
3. **For Form Analysis:** MediaPipe is the gold standard for free pose estimation
4. **For Voice:** Web Speech API costs nothing and works great for basic commands
5. **For Modern Architecture:** MCP servers enable elegant AI integrations with minimal code
6. **Avoid:** Google Fit (deprecated), Nutritionix free tier (too limited)
