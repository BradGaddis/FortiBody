export interface FastingPhase {
  hours: number;
  title: string;
  description: string;
  benefits: string[];
  icon: string;
}

export const FASTING_PHASES: FastingPhase[] = [
  {
    hours: 0,
    title: 'Fed State',
    description: 'Your body is digesting and absorbing nutrients from your last meal.',
    benefits: ['Blood sugar rising', 'Energy being stored'],
    icon: 'restaurant',
  },
  {
    hours: 4,
    title: 'Blood Sugar Regulation',
    description: 'Insulin levels drop as your body processes the last meal.',
    benefits: ['Blood sugar stabilizes', 'Hunger may peak around hour 4'],
    icon: 'trending-down',
  },
  {
    hours: 8,
    title: 'Early Fat Burning',
    description: 'Your body starts switching to fat as the primary energy source.',
    benefits: ['Glycogen depletion begins', 'Fat burning initiates'],
    icon: 'flame',
  },
  {
    hours: 12,
    title: 'Ketosis Begins',
    description: 'Your body enters ketosis and starts producing ketone bodies.',
    benefits: ['Ketone production starts', 'Mental clarity may improve', 'Hunger decreases'],
    icon: 'sparkles',
  },
  {
    hours: 16,
    title: 'Autophagy Starts',
    description: 'Cellular cleanup begins as old cells are recycled.',
    benefits: ['Cellular repair initiates', 'Autophagy at 20%', 'Improved cellular renewal'],
    icon: 'refresh',
  },
  {
    hours: 18,
    title: 'Deep Ketosis',
    description: 'Your body is efficiently burning fat for fuel.',
    benefits: ['Peak fat burning', 'Increased energy', 'Appetite suppressed'],
    icon: 'fitness-center',
  },
  {
    hours: 24,
    title: 'Growth Hormone Increase',
    description: 'Growth hormone levels increase significantly to preserve muscle.',
    benefits: ['Growth hormone up 5x', 'Muscle preservation', 'Fat burning continues'],
    icon: 'stats-chart',
  },
  {
    hours: 36,
    title: 'Deep Autophagy',
    description: 'Significant cellular cleanup and renewal is occurring.',
    benefits: ['Autophagy at 30%', 'Cellular regeneration', 'Reduced inflammation'],
    icon: 'heart-circle-outline',
  },
  {
    hours: 48,
    title: 'Peak Benefits',
    description: 'Maximum autophagy and metabolic flexibility achieved.',
    benefits: ['Autophagy at 60%', 'Insulin sensitivity peaks', 'Stem cell regeneration begins'],
    icon: 'star',
  },
  {
    hours: 72,
    title: 'Complete Renewal',
    description: 'Full immune system reset and deep cellular renewal.',
    benefits: ['Autophagy at 83%', 'Immune system reset', 'Deep cellular repair'],
    icon: 'infinite-outline',
  },
];

export const getCurrentPhase = (hoursFasted: number): FastingPhase => {
  for (let i = FASTING_PHASES.length - 1; i >= 0; i--) {
    if (hoursFasted >= FASTING_PHASES[i].hours) {
      return FASTING_PHASES[i];
    }
  }
  return FASTING_PHASES[0];
};

export const getUpcomingPhase = (hoursFasted: number): FastingPhase | null => {
  for (let i = 0; i < FASTING_PHASES.length; i++) {
    if (FASTING_PHASES[i].hours > hoursFasted) {
      return FASTING_PHASES[i];
    }
  }
  return null;
};

export const getPhaseProgress = (hoursFasted: number): number => {
  const currentPhase = getCurrentPhase(hoursFasted);
  const nextPhase = getUpcomingPhase(hoursFasted);
  
  if (!nextPhase) return 100;
  
  const currentHours = currentPhase.hours;
  const nextHours = nextPhase.hours;
  const progress = ((hoursFasted - currentHours) / (nextHours - currentHours)) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
};
