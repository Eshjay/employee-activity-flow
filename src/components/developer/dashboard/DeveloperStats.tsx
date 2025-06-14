
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Code,
  Activity,
  Database
} from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface DeveloperStatsProps {
  activeTab: string;
  stats: {
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
    reportsCount: number;
  };
}

export const DeveloperStats = ({ activeTab, stats }: DeveloperStatsProps) => {
  const systemStats: StatItem[] = [
    {
      label: "Total Users",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-blue-600"
    },
    {
      label: "Active Users",
      value: stats.activeEmployees,
      icon: Activity,
      color: "text-green-600"
    },
    {
      label: "Departments",
      value: stats.departments,
      icon: Code,
      color: "text-purple-600"
    },
    {
      label: "Reports Generated",
      value: stats.reportsCount,
      icon: Database,
      color: "text-orange-600"
    }
  ];

  if (activeTab !== "overview") return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {systemStats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
