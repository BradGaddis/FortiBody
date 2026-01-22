# FortiBody

FortiBody is a comprehensive fitness tracking application with AI-powered features.

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

### UI/UX
- ✅ Bottom tab navigation (Home, Exercises, Nutrition, Sleep, Profile)
- ✅ Fasting timer card with timeline
- ✅ Nutrition dashboard with stats
- ✅ Food search with debounced API calls
- ✅ Meal organization and editing
- ✅ Sleep logging with quality ratings
- ✅ Progress tracking dashboards

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── fitness/        # Fitness-specific components
│   └── nutrition/      # Nutrition components (FastingTimer, etc.)
├── screens/            # Screen-level components
│   ├── home/          # Home and dashboard screens
│   ├── exercise/       # Exercise-related screens
│   ├── nutrition/      # Nutrition and fasting screens
│   ├── sleep/          # Sleep tracking screen
│   └── profile/        # User profile and settings
├── services/           # Business logic and data services
│   ├── exercise/       # Exercise tracking
│   ├── nutrition/      # Nutrition and fasting services
│   ├── sleep/          # Sleep tracking service
│   ├── streak/         # Streak calculation
│   ├── user/           # User profile services
│   └── ai/             # AI/ML services
├── utils/              # Utility functions
│   ├── haptics.ts      # Haptic feedback
│   └── fastingTimeline.ts # Fasting phases
├── types/              # TypeScript type definitions
├── navigation/         # Navigation configuration
└── hooks/              # Custom React hooks
```

## Tech Stack

- React Native with TypeScript
- Expo for build and deployment
- TensorFlow.js for ML
- MediaPipe for pose detection
- AsyncStorage for local data
- React Navigation for routing

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
```

## Features by Pillar

### Pillar 1: User Profiles
- Profile creation with biometrics
- Goal setting (weight loss, gain, maintenance)
- Progress tracking dashboards

### Pillar 2: Exercise Tracking
- 22+ categorized exercises
- Set/rep/weight tracking
- Personal record tracking
- Workout templates
- AI-powered form feedback (coming)

### Pillar 3: Nutrition
- Open Food Facts API integration
- Barcode scanning
- Calorie and macro tracking
- BMR/TDEE calculations
- Fasting tracking with splits
- Fasting timeline showing body changes

### Pillar 4: Activity
- Step counting (coming)
- Google Fit integration (coming)

### Pillar 5: ML Intelligence
- Exercise recommendations based on data
- Performance trend analysis
- Pose detection for form feedback

### Pillar 6: Sleep Tracking
- Sleep logging with quality ratings
- Sleep goal setting
- Sleep history and trends
- Recovery tracking

### Pillar 7: Education
- Exercise library with instructions
- Fasting timeline education
- Research-backed recommendations

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

## License

Private - Personal Use
