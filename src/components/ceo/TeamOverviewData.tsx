
import { useProfiles } from "@/hooks/useProfiles";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { TeamOverviewContainer } from "./team-overview/TeamOverviewContainer";

export const TeamOverviewData = () => {
  const { profiles, loading: profilesLoading } = useProfiles();
  const { activities, loading: activitiesLoading } = useActivities();
  const { profile: currentUser } = useAuth();

  const employees = profiles.filter(p => p.role === 'employee');

  if (profilesLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading team data...</div>
      </div>
    );
  }

  return (
    <TeamOverviewContainer
      employees={employees}
      activities={activities}
      currentUserId={currentUser?.id}
    />
  );
};
