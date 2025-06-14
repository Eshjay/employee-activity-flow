
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTrendColorClass } from "./utils";

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  className?: string;
}

export const TrendIndicator = ({ trend, percentage, className = "" }: TrendIndicatorProps) => {
  const isMobile = useIsMobile();

  const getTrendIcon = () => {
    const iconSize = isMobile ? "w-3 h-3" : "w-4 h-4";
    switch (trend) {
      case 'up':
        return <TrendingUp className={`${iconSize} text-green-500`} />;
      case 'down':
        return <TrendingDown className={`${iconSize} text-red-500`} />;
      default:
        return <Minus className={`${iconSize} text-gray-500`} />;
    }
  };

  return (
    <div className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs ${getTrendColorClass(trend)} ${className}`}>
      {getTrendIcon()}
      <span className={isMobile ? 'text-xs' : ''}>{percentage.toFixed(0)}%</span>
    </div>
  );
};
