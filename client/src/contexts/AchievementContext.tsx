import React, { createContext, useContext, useState } from 'react';

interface AchievementContextType {
  achievement: string | null;
  triggerAchievement: (name: string) => void;
}

const AchievementContext = createContext<AchievementContextType>({
  achievement: null,
  triggerAchievement: () => {},
});

export const AchievementProvider = ({ children }: { children: React.ReactNode }) => {
  const [achievement, setAchievement] = useState<string | null>(null);

  const triggerAchievement = (name: string) => {
    setAchievement(name);
    setTimeout(() => setAchievement(null), 4000); // Auto-dismiss after 4s
  };

  return (
    <AchievementContext.Provider value={{ achievement, triggerAchievement }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievement = () => useContext(AchievementContext);
