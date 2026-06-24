# GreenThumb Professional — Lovable Rebuild Guide

> **Purpose**: Complete specification of every page, component, data model, and backend function in GreenThumb Professional, intended for a full rebuild on [Lovable](https://lovable.dev).

---

## Table of Contents

1. [App Overview](#app-overview)
2. [Technology Stack](#technology-stack)
3. [Data Models](#data-models)
4. [Authentication & Authorization](#authentication--authorization)
5. [Routing Structure](#routing-structure)
6. [Pages](#pages)
   - [Landing](#1-landing-page)
   - [Pricing](#2-pricing-page)
   - [Dashboard](#3-dashboard)
   - [Plants](#4-plants)
   - [Plant Profile](#5-plant-profile)
   - [Diagnose](#6-diagnose)
   - [Library](#7-library)
   - [Learn](#8-learn)
   - [Schedule](#9-schedule)
   - [Encyclopedia](#10-encyclopedia)
   - [Growth Analytics](#11-growth-analytics)
   - [Agents](#12-agents)
   - [Settings](#13-settings)
   - [Privacy Policy & Terms of Service](#14-privacy-policy--terms-of-service)
7. [Shared Components](#shared-components)
   - [Layout](#layout-components)
   - [Dashboard Widgets](#dashboard-widgets)
   - [Plant Components](#plant-components)
   - [Diagnose Components](#diagnose-components)
   - [Schedule Components](#schedule-components)
   - [Profile Components](#profile-components)
   - [Analytics Components](#analytics-components)
   - [Agents Components](#agents-components)
   - [Learn Components](#learn-components)
   - [Database Components](#database-components)
   - [Subscription Components](#subscription-components)
8. [Backend Functions (Serverless)](#backend-functions-serverless)
9. [AI/LLM Integrations](#aillm-integrations)
10. [Subscription & Payments](#subscription--payments)
11. [Notifications](#notifications)

---

## App Overview

**GreenThumb Professional** is an AI-powered plant care management web application. It allows users to:

- Track a personal plant collection with photos and health scores
- Diagnose plant problems using AI image analysis
- Schedule care reminders (watering, fertilizing, etc.)
- Browse a reference library of pests and diseases
- Get AI-generated growth projections and analytics
- Chat with 7 specialized AI plant-care agents
- Learn gardening science through AI-powered content
- Search a plant encyclopedia powered by LLM

The app uses a **freemium model**: users can add up to 3 plants for free; a **$9.99/month** subscription (with 7-day free trial) unlocks unlimited plants and all Pro features.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Primitives | Radix UI (shadcn/ui patterns) |
| Routing | React Router DOM v6 |
| Server State | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| Charts | Recharts |
| Payments | Stripe |
| Notifications | Sonner (toast) + browser Notification API |
| Backend SDK | Base44 SDK |
| Authentication | Base44 Auth (OAuth / magic link) |
| Database | Base44 Entities (managed) |
| AI/LLM | Base44 Core.InvokeLLM |
| File Storage | Base44 file upload |
| Serverless Functions | Base44 Deno functions |

---

## Data Models

All entities are stored in the Base44 managed database and are scoped by `created_by` (user email).

---

### 1. `Plant`

Core entity representing one of the user's plants.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto-generated |
| `created_by` | string | User email |
| `created_date` | datetime | Auto |
| `plant_name` | string | **Required** |
| `species` | string | Common name |
| `scientific_name` | string | Latin name |
| `plant_category` | enum | `houseplant`, `succulent`, `herb`, `vegetable`, `fruit`, `flower`, `tree`, `shrub`, `vine`, `fern`, `grass`, `other` |
| `location` | enum | `indoor`, `outdoor`, `greenhouse` |
| `growth_stage` | enum | `seedling`, `vegetative`, `budding`, `flowering`, `fruiting`, `dormant`, `mature` |
| `health_score` | number | 0–100, updated after each AI diagnosis |
| `planting_date` | date | When the plant was acquired/planted |
| `image_url` | string | Primary photo URL |
| `notes` | string | Free-text user notes |

**Relationships**: one Plant → many `PlantImage`, `Diagnosis`, `Intervention`, `CareReminder`, `WateringSchedule`

---

### 2. `PlantImage`

Stores a photo and the AI metadata returned for that photo.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto |
| `plant_id` | string | FK → Plant |
| `created_by` | string | User email |
| `created_date` | datetime | Auto |
| `image_url` | string | Uploaded file URL |
| `image_type` | enum | `whole_plant`, `leaf`, `roots`, `soil`, `pest` |
| `ai_analysis_result` | string | Full LLM JSON response (stringified) |
| `stress_indicators` | string[] | Array of detected stress signals |
| `ai_confidence` | number | 0–100 |
| `diagnosis_summary` | string | One-line summary |
| `species_identified` | string | LLM-detected species |

---

### 3. `Diagnosis`

AI-powered health analysis result linked to a specific photo.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto |
| `plant_id` | string | FK → Plant |
| `image_id` | string | FK → PlantImage |
| `created_by` | string | User email |
| `created_date` | datetime | Auto |
| `diagnosis_type` | enum | `pest`, `fungal_disease`, `bacterial_disease`, `viral_disease`, `nutrient_deficiency`, `environmental_stress`, `general_health`, `soil_issue`, `water_stress`, `light_stress` |
| `severity` | enum | `low`, `moderate`, `high`, `critical` |
| `observations` | string | What the AI observed |
| `likely_cause` | string | Root cause explanation |
| `confidence_score` | number | 0–100 |
| `recommended_actions` | string[] | Actionable steps |
| `confirmation_steps` | string[] | How to verify the diagnosis |
| `quick_fix` | string | Short, immediately actionable advice |
| `detailed_explanation` | string | Scientific/in-depth explanation |
| `expected_recovery_time` | string | e.g. "2–3 weeks" |

---

### 4. `Intervention`

Logs a care action the user took on a plant.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto |
| `plant_id` | string | FK → Plant |
| `created_by` | string | User email |
| `date` | date | When the action occurred |
| `created_date` | datetime | Auto |
| `intervention_type` | enum | `watering`, `fertilizing`, `repotting`, `pruning`, `pest_treatment`, `light_adjustment`, `soil_amendment`, `other` |
| `product_used` | string | Product name (optional) |
| `quantity` | string | Amount/dose (optional) |
| `notes` | string | Free-text notes |

---

### 5. `CareReminder`

Scheduled recurring care notification for a plant.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto |
| `plant_id` | string | FK → Plant |
| `created_by` | string | User email |
| `created_date` | datetime | Auto |
| `care_type` | enum | `watering`, `fertilizing`, `repotting`, `pruning`, `pest_treatment`, `misting`, `other` |
| `frequency_days` | number | How often (in days) |
| `next_due_date` | date | Next scheduled date |
| `is_active` | boolean | Whether reminder is enabled |
| `notes` | string | Optional additional note |

---

### 6. `WateringSchedule`

Plant-specific watering tracking record.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto |
| `plant_id` | string | FK → Plant |
| `created_by` | string | User email |
| `frequency_days` | number | Watering frequency |
| `last_watered_date` | date | Most recent watering |
| `light_condition` | string | e.g. "bright indirect" |

---

### 7. `PestDiseaseEntry`

Read-only reference library entries for pests and diseases.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Auto |
| `name` | string | Pest/disease name |
| `category` | enum | `pest`, `fungal_disease`, `bacterial_disease`, `viral_disease`, `nutrient_deficiency`, `environmental_stress` |
| `image_url` | string | Reference photo |
| `symptoms` | string[] | Visible symptoms |
| `lifecycle_description` | string | How it develops |
| `treatment_options` | string[] | How to treat |
| `prevention_methods` | string[] | How to prevent |

---

### 8. `User` (managed by Base44 Auth)

Extended user profile fields used by Settings and subscription logic.

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | Primary key |
| `full_name` | string | Display name |
| `location` | string | City or ZIP code |
| `climate_zone` | string | e.g. "USDA Zone 8b" |
| `growing_environment` | enum | `indoor`, `outdoor`, `greenhouse`, `mixed` |
| `skill_level` | enum | `beginner`, `intermediate`, `advanced` |
| `learning_mode` | enum | `quick_fix`, `mastery` |
| `gardening_goals` | string | Free text |
| `subscription_status` | enum | `active`, `trialing`, `canceled`, `past_due` |
| `stripe_customer_id` | string | Stripe customer ID |
| `stripe_subscription_id` | string | Stripe subscription ID |
| `role` | string | `admin` bypasses subscription gates |
| `email_notifications` | boolean | Opt-in for email care reminders |

---

## Authentication & Authorization

### Auth Flow
1. Base44 `AuthProvider` wraps the entire React app.
2. On load, it checks for a valid user token.
3. If not authenticated → redirect to `/Landing`.
4. If authenticated → render the main app layout with routing.
5. Error states: `auth_required` or `user_not_registered` show an error screen.

### Subscription Gating

Two gate components protect Pro pages:

**`FeatureGate`** — Passes if:
- `user.subscription_status === 'active'` OR
- `user.subscription_status === 'trialing'` OR
- `user.role === 'admin'`

**`SubscriptionGate`** — Passes if:
- `user.subscription_status === 'active'` OR
- `user.subscription_status === 'trialing'`
- *(Does NOT allow admin bypass)*

Pages gated with `FeatureGate`: **Diagnose, Library, Schedule, GrowthAnalytics, Agents, Learn, Encyclopedia**

---

## Routing Structure

```
/Landing                    → Public marketing landing page
/Pricing                    → Subscription pricing & checkout
/PrivacyPolicy              → Legal — privacy policy
/TermsOfService             → Legal — terms of service

[Authenticated, wrapped in AppLayout]
/Dashboard                  → Home/overview (no gate)
/Plants                     → Full plant collection (no gate)
/PlantProfile?id=<plantId>  → Individual plant deep-dive (no gate)
/Diagnose                   → AI image diagnosis (FeatureGate)
/Library                    → Pest/disease reference (FeatureGate)
/Learn                      → AI gardening education (FeatureGate)
/Schedule                   → Care calendar & reminders (FeatureGate)
/Encyclopedia               → AI plant species search (FeatureGate)
/GrowthAnalytics            → AI growth projections (FeatureGate)
/Agents                     → 7 AI specialist agents (FeatureGate)
/Settings                   → User profile & preferences (no gate)
```

---

## Pages

---

### 1. Landing Page

**Route**: `/Landing`  
**Auth**: Public (unauthenticated)

#### Purpose
Marketing page that introduces GreenThumb Professional and drives sign-ups.

#### Key Sections
- **Hero**: App name, tagline, CTA button → triggers Base44 OAuth login
- **Features Grid**: 6 feature highlights with icons (AI diagnostics, care scheduling, growth analytics, plant encyclopedia, agent specialists, photo timeline)
- **Pricing teaser**: Free tier vs Pro comparison
- **Testimonials** (optional static content)
- **Footer**: Links to Privacy Policy, Terms of Service

---

### 2. Pricing Page

**Route**: `/Pricing`  
**Auth**: Authenticated

#### Purpose
Show the subscription plan and handle Stripe checkout.

#### UI Elements
- **Plan card**: "$9.99/month" with 7-day free trial badge
- **Feature list** (8 items):
  - Unlimited plant profiles
  - AI-powered plant diagnostics
  - Growth analytics & projections
  - Personalized care schedules
  - Plant encyclopedia access
  - 7 AI specialist agents
  - Photo timeline & history
  - Weather-based care alerts
- **Subscribe button**: Calls `createCheckoutSession` function → redirects to Stripe Checkout URL
- **Already subscribed state**: Shows current status badge + link back to Dashboard

#### Data / API
- `createCheckoutSession` serverless function: `{ price_id, success_url, cancel_url }` → `{ url }`
- Stripe Price ID: configured via `STRIPE_PRICE_ID` environment variable (do not hardcode production values)
- Cancel redirect: `/Pricing`

---

### 3. Dashboard

**Route**: `/Dashboard`  
**Auth**: Authenticated, no subscription gate

#### Purpose
Main hub giving a garden health overview with key stats, widgets, and quick access to plants.

#### Layout
- Full-width page with responsive grid
- Mobile: single column; Desktop: two-column (main + sidebar)

#### Components Used
| Component | Description |
|-----------|-------------|
| `StatsCard` ×4 | Total plants, Avg health score, Plants needing attention, Total diagnoses |
| `WeatherAlertsWidget` | Location-based weather care alerts |
| `DailyTasksWidget` | Today's care reminders from Schedule |
| `NeedsAttentionWidget` | Plants with health_score < 40 |
| `SeasonalPlannerWidget` | Season-specific care tips |
| `PlantCard` ×6 | Last 6 plants added (grid) |
| `AddPlantDialog` | Add-plant button with free tier enforcement |
| `PullToRefresh` | Mobile pull-to-refresh gesture |

#### Welcome Greeting
- `"Welcome back, [user.full_name first word] 🌿"`

#### Recent Diagnoses Sidebar
- Shows last 5 diagnoses
- Color-coded badge per severity: critical=red, high=orange, moderate=yellow, low=green
- Each entry shows plant name, diagnosis_type, date

#### Data Queries
- `Plant.list({ sort: '-created_date', limit: 50, filter: { created_by: user.email } })`
- `Diagnosis.list({ sort: '-created_date', limit: 10, filter: { created_by: user.email } })`

#### Free Tier Limit
- If plant count ≥ 3 and user is not subscribed → AddPlantDialog shows upgrade prompt instead of form

---

### 4. Plants

**Route**: `/Plants`  
**Auth**: Authenticated, no subscription gate

#### Purpose
Full plant collection browser with search and filtering.

#### Features
- **Search input**: Filters by `plant_name` or `species` (client-side, case-insensitive)
- **Category filter** dropdown: All / houseplant / succulent / herb / vegetable / fruit / flower / tree / shrub / vine / fern
- **Location filter** dropdown: All / indoor / outdoor / greenhouse
- **Add Plant button**: Opens `AddPlantDialog` (enforces 3-plant free limit)
- **Plant grid**: Responsive (2 cols → 3 md → 4 lg), each cell is a `PlantCard`
- **Empty state**: Illustration + "Add your first plant" CTA
- **Pull-to-refresh** on mobile

#### Data Queries
- `Plant.list({ sort: '-created_date', limit: 100, filter: { created_by: user.email } })`

---

### 5. Plant Profile

**Route**: `/PlantProfile?id=<plantId>`  
**Auth**: Authenticated, no subscription gate

#### Purpose
Deep-dive view for a single plant: photos, health history, diagnoses, and care log.

#### Hero Section
- Large plant image (or `Leaf` icon fallback)
- **HealthScoreBadge**: Color-coded 0–100 score
- Plant name (h1) + scientific name (subtitle)
- Info badges: category, location, growth stage, planting date
- Editable notes textarea with auto-save

#### Tab Layout (4 tabs)

| Tab | Content |
|-----|---------|
| **Timeline** | `PhotoTimeline` — chronological photo history with AI analysis |
| **Grid** | `PlantGallery` — masonry photo grid with upload slot |
| **Diagnoses** | `DiagnosisCard` list, mode toggle (Quick Fix / Mastery) |
| **Care Log** | `InterventionTimeline` + log-new-action form |

#### Image Upload (within Grid and Diagnoses tabs)
- `ImageUploader` component: 5 upload slots
- Image types: whole_plant, leaf, roots, soil, pest
- On upload: creates `PlantImage` entity, invokes LLM, creates `Diagnosis`, updates plant `health_score`

#### Mode Toggle
- Quick Fix: actionable, plain-language advice
- Mastery: scientific explanation
- Persisted to `user.learning_mode`

#### Data Queries
- `Plant.filter({ id: plantId })[0]`
- `PlantImage.list({ sort: '-created_date', limit: 50, filter: { plant_id } })`
- `Diagnosis.list({ sort: '-created_date', limit: 20, filter: { plant_id } })`
- `Intervention.list({ sort: '-created_date', limit: 20, filter: { plant_id } })`

---

### 6. Diagnose

**Route**: `/Diagnose`  
**Auth**: Authenticated, **FeatureGate**

#### Purpose
Standalone AI plant health diagnosis tool — select a plant, upload photos, get AI analysis.

#### Features
- **Plant selector**: Dropdown listing user's plants
- **ImageUploader**: 5 photo slots with image-type labels
- **Analyze button**: Runs LLM analysis on each uploaded photo
- **Results**: `DiagnosisCard` list (one per photo analyzed)
- **Mode toggle**: Quick Fix vs Mastery (updates `user.learning_mode`)
- **Loading state**: Spinner with "Analyzing your plant..." message

#### AI Analysis Flow
1. User selects plant and uploads 1–5 photos
2. Each photo uploaded to Base44 file storage → gets a URL
3. For each photo, LLM invoked with botanist prompt + image URL
4. LLM response parsed into structured JSON
5. `PlantImage` entity created with `ai_analysis_result` JSON
6. `Diagnosis` entity created with parsed fields
7. `Plant.health_score` updated based on the **most severe diagnosis** from the current upload batch:
   - critical → 15, high → 30, moderate → 60, low → 85
   - When multiple photos are analyzed at once, the lowest resulting score (worst severity) is applied
   - Each new diagnosis batch overwrites the previous `health_score` (no averaging across sessions)
8. Results rendered in `DiagnosisCard` components

#### LLM Response Schema
```json
{
  "species_identified": "string",
  "diagnosis_summary": "string",
  "stress_indicators": ["string"],
  "ai_confidence": 0-100,
  "observations": "string",
  "likely_cause": "string",
  "diagnosis_type": "pest|fungal_disease|bacterial_disease|viral_disease|nutrient_deficiency|environmental_stress|general_health|soil_issue|water_stress|light_stress",
  "severity": "low|moderate|high|critical",
  "recommended_actions": ["string"],
  "confirmation_steps": ["string"],
  "expected_recovery_time": "string",
  "quick_fix": "string",
  "detailed_explanation": "string"
}
```

---

### 7. Library

**Route**: `/Library`  
**Auth**: Authenticated, **FeatureGate**

#### Purpose
Read-only reference library for common plant pests and diseases.

#### Features
- **Search input**: Client-side filter by `name` (case-insensitive)
- **Category filter**: All / pest / fungal_disease / bacterial_disease / viral_disease / nutrient_deficiency / environmental_stress
- **Entry cards** (expandable):
  - Thumbnail image
  - Name + category badge
  - Collapsed: symptom list (first 3)
  - Expanded: full symptoms, lifecycle description, treatment options, prevention methods, toxicity warning, fun fact
- **Empty state**: "No entries match your search"

#### Data Queries
- `PestDiseaseEntry.list({ sort: 'name', limit: 100 })`

---

### 8. Learn

**Route**: `/Learn`  
**Auth**: Authenticated, **FeatureGate**

#### Purpose
AI-powered gardening education hub — preset topics + free-form questions + per-plant care guides.

#### Features

**Mode Toggle** (Quick Fix / Mastery)
- Persisted to `user.learning_mode`
- Controls how the LLM explains concepts (practical vs scientific)

**Topic Cards** (5 preset topics)
| Button | Topic |
|--------|-------|
| 💧 | Watering Science |
| ☀️ | Light & Photosynthesis |
| 🐛 | Pest Management |
| 🌿 | Plant Nutrition |
| 🌱 | Propagation |

Click a topic → LLM generates educational content → rendered as Markdown

**Ask a Question**
- Free-form text input
- Submit → LLM answers in selected mode
- Response rendered as Markdown

**Per-Plant Care Guides**
- Section listing each of the user's plants
- Each plant shows a `PlantCareGuide` component with on-demand AI care instructions

#### Data Queries
- `Plant.list({ sort: '-created_date', limit: 50, filter: { created_by: user.email } })`

---

### 9. Schedule

**Route**: `/Schedule`  
**Auth**: Authenticated, **FeatureGate**

#### Purpose
Care reminder management with a visual calendar and browser notification support.

#### Features

**CareCalendar**
- Monthly calendar view
- Days with due reminders are highlighted
- Clicking a date shows reminders due that day

**Add/Edit Reminder (ReminderForm)**
- Plant selector dropdown
- Care type picker with emoji: 💧 watering, 🌱 fertilizing, 🪴 repotting, ✂️ pruning, 🐛 pest_treatment, 💦 misting, 📋 other
- Frequency (days) — pre-filled defaults: watering=7, fertilizing=14, repotting=365, pruning=30, pest_treatment=14, misting=3, other=7
- Next due date picker
- Notes textarea
- Save / Delete buttons

**NotificationSettings**
- Toggle to enable/disable browser notifications
- Shows notification permission status

**Browser Notifications** (`useCareNotifications` hook)
- Fires once per browser session
- Shows reminders due today or overdue (up to 5 in notification, "+N more" if more)
- Uses the Web Notification API

#### Data Queries
- `Plant.list({ sort: '-created_date', limit: 100, filter: { created_by: user.email } })`
- `CareReminder.list({ sort: '-next_due_date', limit: 200, filter: { created_by: user.email } })`

---

### 10. Encyclopedia

**Route**: `/Encyclopedia`  
**Auth**: Authenticated, **FeatureGate**

#### Purpose
AI-powered plant species search — returns care info for any plant the user searches for.

#### Features
- **Search bar**: Text input + Search button
- **Popular search chips**: Monstera, Peace Lily, Pothos, Snake Plant, Fiddle Leaf Fig, Succulents, Herbs, Orchids
- **Results** — `PlantEncyclopediaCard` per result:
  - Common name (h2) + scientific name
  - Difficulty badge: Easy (green) / Moderate (yellow) / Difficult (red)
  - Quick-glance icons: ☀️ Light requirement, 💧 Watering frequency, 🌡️ Temperature range, 💨 Humidity level
  - Expandable section: Soil type, Fertilizing schedule, Propagation method, Common issues, Toxicity warning, Fun fact
- **Loading state**: Spinner
- **Empty state**: Illustration + "Search for any plant"

#### AI Integration
LLM invoked with the search query; returns 1–6 matching species:

```json
[
  {
    "common_name": "string",
    "scientific_name": "string",
    "description": "string",
    "difficulty": "Easy|Moderate|Difficult",
    "light": "string",
    "watering": "string",
    "humidity": "string",
    "temperature": "string",
    "soil": "string",
    "fertilizing": "string",
    "propagation": "string",
    "common_issues": ["string"],
    "toxicity": "string",
    "fun_fact": "string"
  }
]
```

No database entities used — results are ephemeral (not saved).

---

### 11. Growth Analytics

**Route**: `/GrowthAnalytics`  
**Auth**: Authenticated, **FeatureGate**

#### Purpose
AI-powered growth projection and trend analysis for each plant in the user's collection.

#### Features
- **Analyze All button**: Runs AI projection for every plant at once
- **Per-plant `GrowthProjectionCard`**:
  - Plant name + category
  - Overall trajectory badge: 🚀 thriving / 📈 steady / 🐌 slow / 📉 declining / 🔄 recovering
  - Health trend: improving / stable / declining
  - Growth rate: fast / moderate / slow / dormant
  - Confidence percentage
  - Next recommended action + date
  - **Expandable section**:
    - Predicted milestones timeline (label, type, date, likelihood)
    - Care recommendations list
    - Risk factors with severity badges
- **Refresh icon**: Re-analyze a single plant

#### Milestone Types
`bloom`, `repot`, `stage_change`, `harvest`, `pruning`, `dormancy`, `other`

#### AI Projection Flow
1. Collect all history for each plant:
   - Interventions (sorted by date)
   - PlantImages (latest 5 URLs)
   - Diagnoses (sorted by date)
   - WateringSchedules
2. Build comprehensive text summary of plant history
3. Invoke LLM with botanist-role prompt + summary + image URLs
4. Parse JSON response into state
5. Render projection cards

#### LLM Response Schema
```json
{
  "overall_trajectory": "thriving|steady|slow|declining|recovering",
  "health_trend": "improving|stable|declining",
  "growth_rate": "fast|moderate|slow|dormant",
  "confidence": 0-100,
  "next_action": "string",
  "next_action_date": "YYYY-MM-DD",
  "milestones": [
    {
      "label": "string",
      "type": "bloom|repot|stage_change|harvest|pruning|dormancy|other",
      "predicted_date": "YYYY-MM-DD",
      "description": "string",
      "likelihood": "high|medium|low"
    }
  ],
  "recommendations": ["string"],
  "risk_factors": [
    { "factor": "string", "severity": "low|moderate|high" }
  ]
}
```

#### Data Queries (all scoped to `created_by: user.email`)
- `Plant.list()`
- `Intervention.list()`
- `PlantImage.list()`
- `Diagnosis.list()`
- `WateringSchedule.list()`

---

### 12. Agents

**Route**: `/Agents`  
**Auth**: Authenticated, **FeatureGate**

#### Purpose
Interface for 7 specialized AI plant-care agent personas, each with a distinct role and multi-turn chat.

#### 7 Agents

| # | Emoji | Name | Role |
|---|-------|------|------|
| 1 | 🔬 | Plant Diagnostic | ID symptoms, confidence scoring, follow-up image requests |
| 2 | 📚 | Horticulture Educator | Science behind recommendations, nutrient physiology |
| 3 | 📸 | Image Triage | Photo quality assessment, APPROVED/INSUFFICIENT verdict, guidance |
| 4 | ⚖️ | Differential Diagnosis | Multi-cause ranking, evidence weighing, confirmatory tests |
| 5 | 📋 | Care Plan | Convert diagnosis → action plan (today's tasks, stop-doing, milestones) |
| 6 | 📈 | Plant History | Longitudinal analysis, intervention correlations, trend detection |
| 7 | 🌍 | Environmental Context | Climate-aware advice, frost risk, humidity, seasonal transitions |

#### Agent List View
- Grid of agent cards (2 columns mobile, 3–4 desktop)
- Each card shows: emoji, name, tagline, description, bullet-point feature list
- Click opens `AgentChatModal`

#### `AgentChatModal`
- Full-screen modal or large sheet
- Header: agent emoji + name
- **Chat history** scrollable area with `MessageBubble` components
- **Input area**: textarea + Send button
- Multi-turn conversation: each message sent with full system prompt for the agent + conversation history
- AI responds as that specific agent persona
- Loading indicator while waiting for LLM response

#### `MessageBubble`
- User messages: right-aligned, green background
- Agent messages: left-aligned, white/gray background, Markdown rendered

---

### 13. Settings

**Route**: `/Settings`  
**Auth**: Authenticated, no subscription gate

#### Purpose
User profile editing and account management.

#### Form Fields

| Field | Type | Options |
|-------|------|---------|
| Location | Text | City or ZIP code |
| Climate Zone | Text | e.g. "USDA Zone 8b" |
| Growing Environment | Select | indoor / outdoor / greenhouse / mixed |
| Skill Level | Select | beginner / intermediate / advanced |
| Default Learning Mode | Toggle | quick_fix / mastery |
| Gardening Goals | Textarea | Free text |

#### Actions
- **Save**: Calls `base44.auth.updateMe(formData)`
- **Delete Account** (destructive, with confirmation dialog):
  - Deletes all user entities: Plant, CareReminder, WateringSchedule, Intervention, Diagnosis, PlantImage, EnvironmentalData
  - Signs user out

#### Static Info
- User card: displays `full_name` and `email` (read-only)
- Links: Privacy Policy, Terms of Service, Contact Support

---

### 14. Privacy Policy & Terms of Service

**Routes**: `/PrivacyPolicy`, `/TermsOfService`  
**Auth**: Public

Standard legal pages with static content rendered in a centered content container.

---

## Shared Components

---

### Layout Components

#### `AppLayout`
- Wraps all authenticated pages
- Renders `Sidebar` (desktop) and `MobileHeader` + `MobileNav` (mobile)
- Contains the `<Outlet>` for nested routes
- Responsive: sidebar hidden on mobile

#### `Sidebar`
- Fixed left sidebar on desktop
- App logo + name
- Navigation links with icons:
  - 🏠 Dashboard
  - 🌿 Plants
  - 🔬 Diagnose *(Pro)*
  - 📚 Library *(Pro)*
  - 🎓 Learn *(Pro)*
  - 📅 Schedule *(Pro)*
  - 📖 Encyclopedia *(Pro)*
  - 📊 Growth Analytics *(Pro)*
  - 🤖 Agents *(Pro)*
  - ⚙️ Settings
- User avatar + name at bottom
- "Upgrade to Pro" CTA if not subscribed

#### `MobileHeader`
- Top bar on mobile
- App logo
- Hamburger menu or notification icon

#### `MobileNav`
- Bottom tab bar on mobile (5–6 main nav items)
- Icons only with labels

---

### Dashboard Widgets

#### `StatsCard`
- Props: `title`, `value`, `icon`, `color`, `trend` (optional)
- Rounded card with colored icon background, large number, title
- Optional: small trend indicator (up/down arrow + %)

#### `WeatherAlertsWidget`
- Requests user's geolocation via browser API (`navigator.geolocation`)
- Calls `getWeatherAlerts` serverless function with `{ lat, lon, plants[] }`
- Renders alert list: each alert has `severity` badge (info=blue, warning=yellow, critical=red), `message`, `type`
- Shows current temperature + conditions from function response
- Collapses/expands on click

#### `DailyTasksWidget`
- Shows care reminders due today or overdue
- Each item: care-type emoji, plant name, days overdue (if any)
- "Mark Done" button → updates `CareReminder.next_due_date` by adding `frequency_days`

#### `NeedsAttentionWidget`
- Lists plants with `health_score < 40`
- Each item: plant thumbnail, name, health score badge
- Click → navigates to Plant Profile

#### `SeasonalPlannerWidget`
- Detects current season based on date
- Shows 3–5 season-appropriate care tips
- Static content per season (Spring/Summer/Autumn/Winter)

---

### Plant Components

#### `PlantCard`
- Props: `plant` object
- Shows: primary image (or leaf icon), plant name, species, health score badge, category + location badges
- Click → navigate to `/PlantProfile?id=<plant.id>`
- Hover: subtle scale animation

#### `AddPlantDialog`
- Modal dialog for adding a new plant
- Fields: plant_name (required), species, scientific_name, plant_category, location, growth_stage, planting_date, notes, image upload
- On submit: calls `createPlant` serverless function (validates input, prevents mass assignment)
- If user has ≥ 3 plants and is not subscribed: shows upgrade prompt instead of form

#### `HealthScoreBadge`
- Props: `score` (0–100)
- Color-coded pill: 0–39=red (Critical), 40–59=orange (Poor), 60–79=yellow (Fair), 80–100=green (Good)
- Shows score number + label

---

### Diagnose Components

#### `ImageUploader`
- 5 upload slots
- Each slot: image type label (whole_plant / leaf / roots / soil / pest), drag-and-drop or click to upload, preview thumbnail
- Upload button triggers Base44 file upload
- On success: passes URL back to parent for LLM analysis

#### `DiagnosisCard`
- Props: `diagnosis`, `mode` (quick_fix | mastery), `image`
- Header: severity badge, diagnosis_type, confidence score, date
- Body in Quick Fix mode: `quick_fix` text, `recommended_actions` as checklist
- Body in Mastery mode: `detailed_explanation`, `observations`, `likely_cause`, `confirmation_steps`
- Footer: `expected_recovery_time`
- Expandable/collapsible

---

### Schedule Components

#### `CareCalendar`
- Monthly calendar grid
- Days with due reminders show colored dots
- Color per care_type: watering=blue, fertilizing=green, etc.
- Click day → shows reminder list for that day

#### `ReminderForm`
- Create or edit a CareReminder
- Fields: plant (required), care_type, frequency_days, next_due_date, notes, is_active toggle
- Default frequencies pre-filled on care_type change

#### `NotificationSettings`
- Toggle for enabling browser notifications
- Shows permission status: granted / denied / default
- "Request permission" button if not yet granted

#### `useCareNotifications` (hook)
- `useEffect` that fires once per session
- Queries active reminders where `next_due_date <= today`
- If any found and permission granted → fires `new Notification(...)` with reminder summary

---

### Profile Components

#### `PhotoTimeline`
- Vertical chronological list of plant photos
- Each entry: date label, thumbnail, AI summary, stress indicators chips, confidence score
- Click photo → opens lightbox

#### `PlantGallery`
- Masonry/grid layout of all plant photos
- Upload slot at top-left
- Hover overlay: date + AI summary
- Click → lightbox

#### `InterventionTimeline`
- Vertical timeline of care actions
- Each entry: date, intervention_type emoji + label, product_used, quantity, notes
- "Log Action" button → opens inline form (intervention_type, date, product, quantity, notes)

---

### Analytics Components

#### `GrowthProjectionCard`
- Props: `plant`, `projection` (LLM result)
- Header: plant name + trajectory badge
- Stats row: health trend, growth rate, confidence
- Next action callout: text + date
- Expandable body:
  - Milestones timeline (vertical list with likelihood badges)
  - Recommendations list
  - Risk factors with severity indicators
- Refresh button (re-runs LLM analysis)

---

### Agents Components

#### `AgentChatModal`
- Props: `agent` (config object), `isOpen`, `onClose`
- Large modal / sheet
- Chat interface with scrollable message history
- Input: multi-line textarea
- On send: appends user message, invokes LLM with agent system prompt + history, appends AI response
- Loading dots animation while waiting

#### `MessageBubble`
- Props: `message` (`{ role: 'user'|'assistant', content: string }`)
- User: right-aligned green bubble
- Assistant: left-aligned white bubble, Markdown rendered (bold, lists, code blocks)

---

### Learn Components

#### `PlantCareGuide`
- Props: `plant`
- "Get Care Guide" button → invokes LLM for this plant's specific care instructions
- Renders Markdown response in styled container

---

### Database Components

#### `PlantSpeciesCard`
- Props: `species` (encyclopedia result from LLM)
- Shows: common_name, scientific_name, difficulty badge
- Quick-glance icons row: light, water, temperature, humidity
- Expandable details: soil, fertilizing, propagation, common_issues, toxicity, fun_fact

#### `PlantSpeciesDetail`
- Full detail view of a plant species
- All fields from encyclopedia result rendered in sections

---

### Subscription Components

#### `FeatureGate`
- Wraps Pro-only page content
- If not subscribed AND not admin: shows upgrade prompt card with link to `/Pricing`
- If subscribed or admin: renders `children`

#### `SubscriptionGate`
- Same as FeatureGate but admin bypass disabled
- Used in contexts where even admins must have a paid subscription

---

## Backend Functions (Serverless)

All functions are Deno-based TypeScript serverless functions using `@base44/sdk`.

---

### `createCheckoutSession`

**Trigger**: Called from Pricing page

**Input**: `{ price_id, success_url, cancel_url }`

**Logic**:
1. Authenticate user via Base44 SDK
2. Create Stripe Checkout session with:
   - Mode: `subscription`
   - Payment method: `card`
   - Customer email: `user.email`
   - Line items: `[{ price: price_id, quantity: 1 }]`
   - Trial: 7 days
   - Metadata: `{ base44_app_id, user_email }`
3. Return `{ url: session.url }` → frontend redirects

**Output**: `{ url: "https://checkout.stripe.com/..." }`

---

### `createPlant`

**Trigger**: Called from AddPlantDialog

**Input**: Plant fields (validated against allowlist)

**Allowed fields**: `plant_name`, `species`, `scientific_name`, `plant_category`, `location`, `growth_stage`, `notes`, `health_score`, `planting_date`, `image_url`

**Security**: Uses `asServiceRole` to create entity but always sets `created_by` to the authenticated user's email (prevents spoofing).

**Output**: Created Plant entity

---

### `getWeatherAlerts`

**Trigger**: Called from WeatherAlertsWidget on Dashboard

**Input**: `{ lat, lon, plants[] }`

**Logic**:
1. Fetches weather data from Open-Meteo API (free, no key required)
2. Gets current conditions + 3-day forecast
3. Filters plants to outdoor/greenhouse only
4. Invokes LLM with plant list + weather summary
5. LLM generates 2–5 specific, actionable alerts

**Alert Schema**:
```json
{
  "alerts": [
    {
      "message": "string",
      "severity": "info|warning|critical",
      "type": "frost|heat|wind|rain|drought|general",
      "plants_affected": "string"
    }
  ],
  "overall_conditions": "string"
}
```

**Output**: `{ alerts[], overall_conditions, weather: { tempF, feelsLike, humidity, windSpeed, precipitation, tomorrowMax, tomorrowMin, tomorrowRain } }`

---

### `sendCareReminders`

**Trigger**: Scheduled job (daily)

**Logic**:
1. Fetches all active CareReminders where `next_due_date <= today`
2. Groups by user email
3. For each user: if `email_notifications !== false`, sends HTML email via `Core.SendEmail`
4. Email contains formatted list of due tasks with emojis and plant names
5. Marks days overdue in the email

**Output**: `{ sent: number, message: string }`

---

### `stripeWebhook`

**Trigger**: Stripe webhook events

**Events Handled**:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set `subscription_status = 'trialing'` or `'active'` |
| `customer.subscription.updated` | Set `subscription_status = sub.status` |
| `customer.subscription.deleted` | Set `subscription_status = 'canceled'`, clear subscription ID |
| `invoice.payment_failed` | Set `subscription_status = 'past_due'` |
| `invoice.paid` | Set `subscription_status = 'active'` |

**Security**: Validates Stripe webhook signature before processing.

---

## AI/LLM Integrations

All LLM calls use `base44.integrations.Core.InvokeLLM({ prompt, response_json_schema })`.

| Feature | Model Input | Output |
|---------|-------------|--------|
| Plant Diagnosis | Photo URL(s) + botanist prompt | Structured diagnosis JSON |
| Weather Alerts | Weather data + plant list | Alert messages |
| Encyclopedia Search | Search query | 1–6 plant species with care info |
| Growth Analytics | Full plant history text | Projection with milestones |
| Learn Topics | Topic name + mode | Markdown educational content |
| Learn Questions | User question + mode | Markdown answer |
| Plant Care Guides | Plant details + mode | Markdown care guide |
| Agent Chat | Agent system prompt + conversation | Agent reply (Markdown) |

---

## Subscription & Payments

### Free Tier Limits
- Maximum **3 plants** in collection
- No access to: Diagnose, Library, Learn, Schedule, Encyclopedia, GrowthAnalytics, Agents

### Pro Plan
- **$9.99/month**
- **7-day free trial**
- Unlimited plants
- All features unlocked

### Subscription Statuses
| Status | Access |
|--------|--------|
| `active` | Full Pro access |
| `trialing` | Full Pro access |
| `canceled` | Free tier only |
| `past_due` | Free tier only |

### Stripe Integration
- Checkout: `createCheckoutSession` function → Stripe hosted checkout
- Webhook: `stripeWebhook` function updates `User.subscription_status`
- Stripe Price ID: store as `STRIPE_PRICE_ID` environment variable in your deployment config

---

## Notifications

### In-App Toasts (Sonner)
- Success/error toasts on save, delete, analysis complete
- Positioned bottom-right on desktop, bottom-center on mobile

### Browser Notifications
- Via Web Notification API
- Triggered once per session by `useCareNotifications` hook
- Shows due/overdue care reminders

### Email Notifications
- Sent by `sendCareReminders` scheduled function
- HTML email with care task list
- Respects `user.email_notifications` setting
- Uses Base44 `Core.SendEmail` integration

---

*This document was generated to support a full rebuild of GreenThumb Professional on Lovable.*
