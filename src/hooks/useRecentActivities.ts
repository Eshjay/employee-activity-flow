
import { useState } from 'react';
import { useActivities, Activity } from './useActivities';

export const useRecentActivities = (limit: number = 5) => {
  const { activities, loading } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Get recent activities sorted by date and creation time
  const recentActivities = activities
    .sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })
    .slice(0, limit);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const closeActivityDetail = () => {
    setSelectedActivity(null);
  };

  return {
    recentActivities,
    isLoading: loading,
    selectedActivity,
    handleActivityClick,
    closeActivityDetail,
  };
};
