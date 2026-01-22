# FortiBody

FortiBody is a comprehensive fitness tracking application with AI-powered features.

## Design Pillar Tasks

### Pillar 1: User Profiles
- [x] Profile creation with biometrics (name, age, gender, height, weight)
- [x] Activity level assessment
- [x] Weight unit selection (kg/lbs)
- [x] Goal setting (weight loss, gain, maintenance)
- [x] Progress tracking dashboards
- [x] Profile storage and retrieval service
- [x] Profile migration from onboarding data

### Pillar 2: Exercise Tracking
- [x] Exercise library with 22+ exercises
- [x] Exercise categorization (Strength, Cardio, Flexibility, etc.)
- [x] Exercise detail screens with instructions
- [x] Set/rep/weight tracking
- [x] Favorites system for quick access
- [x] Personal record tracking
- [x] Workout session skeleton
- [x] Workout templates
- [ ] AI-powered form feedback (pose detection integration)

### Pillar 3: Nutrition
- [x] Food database with local storage
- [x] Open Food Facts API integration
- [x] Debounced food search with 500ms delay
- [x] 7-day search result caching
- [x] Barcode scanning for food entry
- [x] Calorie and macro tracking (P/C/F)
- [x] BMR calculations (Mifflin-St Jeor)
- [x] TDEE calculations
- [x] Nutrition goals setting
- [x] Food diary organized by meal (breakfast, lunch, dinner, snacks)
- [x] Edit food entries (servings, meal, date, time)
- [x] Create custom foods
- [x] Fasting tracking with multiple splits (16:8, 18:6, 20:4, 23:1, Custom, Indefinite)
- [x] Fasting timer with progress
- [x] Fasting timeline showing physiological phases during fast
- [x] Fasting goal setting and tracking

### Pillar 4: Activity
- [x] Pedometer integration (expo-sensors)
- [x] Google Fit API integration (service + UI)
- [x] Activity goal setting (steps, calories, distance)
- [x] Daily step history and trends
- [x] Calorie burn estimation
- [x] Distance tracking
- [x] Active minutes tracking
- [x] Activity dashboard with stats
- [x] Activity service with local storage
- [x] Activity screen with widgets

### Pillar 5: ML Intelligence
- [x] TensorFlow.js installation
- [x] MoveNet model integration
- [x] MediaPipe pose integration
- [x] Pose detection service
- [x] Exercise configurations (Push-ups, Squats, etc.)
- [x] Form analysis utilities
- [x] Rep counting state machine
- [x] TypeScript types for pose detection
- [ ] Exercise recommendations based on data
- [ ] Performance trend analysis
- [ ] Real-time form feedback UI
- [ ] Pose detection camera integration
- [ ] Form scoring algorithm

### Pillar 6: Sleep Tracking
- [x] Sleep logging (bedtime, wake time, duration)
- [x] Sleep quality ratings (poor, fair, good, excellent)
- [x] Sleep goal setting (hours, bedtime, waketime)
- [x] Sleep history and trends
- [x] Recovery tracking
- [x] Sleep streak calculation
- [x] Weekly/daily sleep averages
- [x] Sleep notes support
- [x] Sleep service with local storage
- [x] Sleep screen UI with stats cards

### Pillar 7: Education
- [x] Exercise library with instructions
- [x] Fasting timeline education
- [x] Research-backed fasting phases (10 phases documented)
- [x] Benefits display for each fasting phase
- [x] Nutritional guides and meal planning
- [x] Progressive overload explanations
- [x] Hydration reminders
- [x] Recovery day recommendations
- [x] Macro distribution guides
- [ ] Exercise tutorial videos

### Integration: UltraHuman
- [x] UltraHuman Partner API service
- [x] UltraHuman data types and models
- [x] Recovery score integration
- [x] Sleep data sync
- [x] HRV tracking
- [x] Metabolic insights display
- [x] Integrations screen UI

### Testing Setup
- [x] Jest configuration (jest-expo)
- [x] React Native Testing Library setup
- [x] Test setup file with mocks
- [x] AsyncStorage mock
- [x] Navigation mocks
- [x] NutritionService unit tests
- [x] FastingService unit tests
- [x] SleepService unit tests
- [x] StreakService unit tests
- [x] Component rendering tests

## Features Implemented

### Core Features
- ✅ User Profiles with biometrics and goal setting
- ✅ Exercise Tracking with 22+ exercises and categorization
- ✅ Nutrition Tracking with Open Food Facts API integration
- ✅ Barcode scanning for food entry
- ✅ Calorie and macro tracking
- ✅ BMR/TDEE calculations (Mifflin-St Jeor, Harris-Benedict)
- ✅ Fasting Tracking with multiple splits (16:8, 18:6, 20:4, 23:1, Custom, Indefinite)
- ✅ Fasting Timeline showing physiological phases during fast
- ✅ Sleep Tracking with quality ratings and history
- ✅ Haptic feedback throughout the app
- ✅ Streak tracking with activity-based calculation
- ✅ Food Diary organized by meal (breakfast, lunch, dinner, snacks)
- ✅ Edit food entries (servings, meal, date, time)
- ✅ Activity Tracking with Google Fit integration
- ✅ Pedometer step counting
- ✅ Step goals and progress
- ✅ Calorie burn and distance tracking
- ✅ UltraHuman Partner API integration
- ✅ Recovery score display
- ✅ HRV tracking

### AI & Computer Vision
- ✅ TensorFlow.js + MoveNet installation
- ✅ Pose detection service
- ✅ Exercise configurations (Push-ups, Squats, etc.)
- ✅ Form analysis utilities
- ✅ Rep counting state machine
- ✅ TypeScript types for pose detection

### Flexibility Testing
- ✅ MediaPipe pose integration
- ✅ Angle calculation utilities
- ✅ 21 test configurations defined
- ✅ Flexindex scoring algorithm
- ✅ Age/gender norm comparisons

### Data & Services
- ✅ Local-first data storage with AsyncStorage
- ✅ Food search caching (7 days)
- ✅ Streak calculation from all activity data
- ✅ Fasting goal setting and tracking
- ✅ Activity service with step/cals/distance
- ✅ UltraHuman API integration

### UI/UX
- ✅ Bottom tab navigation (Home, Exercises, Nutrition, Sleep, Profile, Activity)
- ✅ Fasting timer card with timeline
- ✅ Nutrition dashboard with stats
- ✅ Food search with debounced API calls
- ✅ Meal organization and editing
- ✅ Sleep logging with quality ratings
- ✅ Progress tracking dashboards
- ✅ Activity dashboard with widgets
- ✅ Integrations management screen

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── fitness/        # Fitness-specific components
│   ├── nutrition/      # Nutrition components (FastingTimer, etc.)
│   └── activity/       # Activity widgets (StepCounter, CalorieWidget)
├── screens/            # Screen-level components
│   ├── home/          # Home and dashboard screens
│   ├── exercise/       # Exercise-related screens
│   ├── nutrition/      # Nutrition and fasting screens
│   ├── sleep/          # Sleep tracking screen
│   ├── activity/       # Activity dashboard screen
│   └── profile/        # User profile and settings
├── services/           # Business logic and data services
│   ├── exercise/       # Exercise tracking
│   ├── nutrition/      # Nutrition and fasting services
│   ├── sleep/          # Sleep tracking service
│   ├── activity/       # Activity/Google Fit service
│   ├── integrations/   # UltraHuman integration
│   ├── streak/         # Streak calculation
│   ├── user/           # User profile services
│   └── ai/             # AI/ML services
├── utils/              # Utility functions
│   ├── haptics.ts      # Haptic feedback
│   ├── fastingTimeline.ts # Fasting phases
│   └── ultraHumanMapper.ts # UltraHuman data mapping
├── types/              # TypeScript type definitions
├── navigation/         # Navigation configuration
├── hooks/              # Custom React hooks
└── __tests__/          # Test files
    ├── services/       # Service unit tests
    └── components/     # Component tests
```

## Tech Stack

- React Native with TypeScript
- Expo for build and deployment
- TensorFlow.js for ML
- MediaPipe for pose detection
- AsyncStorage for local data
- React Navigation for routing
- Jest + React Native Testing Library
- Open Food Facts API
- Google Fit API
- UltraHuman Partner API

## Getting Started

```bash
# Install dependencies
yarn install --ignore-engines

# Start development server
npx expo start

# Build for Android
npx expo run:android

# Build for iOS
npx expo run:ios

# Run tests
yarn test
```

## Task Progress

| Pillar | Completed | Total | Progress |
|--------|-----------|-------|----------|
| Pillar 1: User Profiles | 7 | 7 | 100% |
| Pillar 2: Exercise Tracking | 7 | 8 | 88% |
| Pillar 3: Nutrition | 17 | 17 | 100% |
| Pillar 4: Activity | 10 | 10 | 100% |
| Pillar 5: ML Intelligence | 9 | 14 | 64% |
| Pillar 6: Sleep Tracking | 10 | 10 | 100% |
| Pillar 7: Education | 9 | 10 | 90% |
| Integration: UltraHuman | 7 | 7 | 100% |
| Testing Setup | 10 | 10 | 100% |
| **Overall** | **86** | **93** | **92%** |

## Completed Tasks

All major features from the roadmap have been implemented:

- ✅ Project cleanup and TypeScript standardization
- ✅ File structure reorganization
- ✅ Component decomposition
- ✅ Custom hooks implementation
- ✅ State management with Context API
- ✅ Service layer creation
- ✅ Design system implementation
- ✅ Navigation enhancement
- ✅ User interaction improvements
- ✅ Calorie tracker module
- ✅ BMR calculator
- ✅ Exercise tracking enhancement
- ✅ Fasting with splits and timeline
- ✅ Sleep tracking
- ✅ Haptic feedback
- ✅ Food search with caching
- ✅ Food diary with editing
- ✅ Streak calculation
- ✅ Icon fixes (fitness-center, infinite-outline, heart-circle-outline)
- ✅ Google Fit / Activity integration
- ✅ Pedometer step counting
- ✅ Activity dashboard
- ✅ UltraHuman API integration
- ✅ Recovery score display
- ✅ Comprehensive testing setup
- ✅ Service unit tests

## License

Private - Personal Use
