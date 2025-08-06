import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Quote, RefreshCw, Sparkles, Heart } from 'lucide-react';
import { useQuotes } from '@/hooks/useQuotes';
import { useIsMobile } from '@/hooks/use-mobile';

interface DailyQuoteProps {
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
}

export const DailyQuote = ({ variant = 'default', className = '' }: DailyQuoteProps) => {
  const { quote, loading, refreshQuote } = useQuotes();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshQuote();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <Card className={`border-0 shadow-medium hover:shadow-strong transition-all duration-300 ${className}`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) return null;

  // Compact variant for mobile/sidebar
  if (variant === 'compact') {
    return (
      <Card className={`border-0 shadow-soft hover:shadow-medium transition-all duration-300 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex-shrink-0">
              <Quote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <blockquote className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2 italic">
                "{quote.text}"
              </blockquote>
              <div className="flex items-center justify-between">
                <cite className="text-xs text-slate-500 dark:text-slate-400 font-medium not-italic">
                  — {quote.author}
                </cite>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hero variant for prominent display
  if (variant === 'hero') {
    return (
      <Card className={`border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 shadow-strong hover:shadow-extra transition-all duration-300 ${className}`}>
        <CardContent className="p-6 sm:p-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-full">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Daily Inspiration
              </span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            
            <blockquote className="text-lg sm:text-xl lg:text-2xl text-slate-800 dark:text-slate-200 leading-relaxed mb-4 sm:mb-6 font-medium italic text-balance">
              "{quote.text}"
            </blockquote>
            
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <cite className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold not-italic">
                  — {quote.author}
                </cite>
                {quote.category && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {quote.category}
                  </Badge>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-2 h-8 w-8 p-0 bg-white/80 hover:bg-white border-slate-200"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={`border-0 shadow-medium hover:shadow-strong transition-all duration-300 animate-fade-in ${className}`}>
      <CardContent className="padding-responsive">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-soft transition-colors duration-300 flex-shrink-0">
            <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-responsive-base font-bold text-slate-800 dark:text-slate-200">
                Daily Quote
              </h3>
              <Sparkles className="w-4 h-4 text-amber-500" />
              {quote.category && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {quote.category}
                </Badge>
              )}
            </div>
            
            <blockquote className="text-responsive-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3 sm:mb-4 italic">
              "{quote.text}"
            </blockquote>
            
            <div className="flex items-center justify-between">
              <cite className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium not-italic">
                — {quote.author}
              </cite>
              
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {!isMobile && <span className="text-xs">New Quote</span>}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
