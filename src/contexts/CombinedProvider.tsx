import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { UserProvider } from './contexts/UserContext';
import { NutritionProvider } from './contexts/NutritionContext';
import { ExerciseProvider } from './contexts/ExerciseContext';

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
