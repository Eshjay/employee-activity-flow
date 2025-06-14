
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getTrendColorClass } from "./utils";

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  className?: string;
}

export const TrendIndicator = ({ trend, percentage, className = "" }: TrendIndicatorProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getTrendColorClass(trend)} ${className}`}>
      {getTrendIcon()}
      {percentage.toFixed(0)}%
    </div>
  );
};
