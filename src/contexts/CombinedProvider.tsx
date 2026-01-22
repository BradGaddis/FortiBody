import React from 'react';
import { AppProvider } from './AppContext';
import { UserProvider } from './UserContext';
import { NutritionProvider } from './NutritionContext';
import { ExerciseProvider } from './ExerciseContext';

const CombinedProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AppProvider>
      <UserProvider>
        <ExerciseProvider>
          <NutritionProvider>{children}</NutritionProvider>
        </ExerciseProvider>
      </UserProvider>
    </AppProvider>
  );
};

export default CombinedProvider;
