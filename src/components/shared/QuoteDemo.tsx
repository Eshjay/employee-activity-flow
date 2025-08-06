import { DailyQuote } from './DailyQuote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const QuoteDemo = () => {
  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Daily Quote Component Demo
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Showcasing the different variants of the daily quote component with live API integration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Variant</CardTitle>
          <p className="text-sm text-slate-600">
            Large, centered display perfect for CEO/manager dashboards
          </p>
        </CardHeader>
        <CardContent>
          <DailyQuote variant="hero" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Variant</CardTitle>
          <p className="text-sm text-slate-600">
            Standard card layout for employee dashboards
          </p>
        </CardHeader>
        <CardContent>
          <DailyQuote variant="default" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compact Variant</CardTitle>
          <p className="text-sm text-slate-600">
            Space-efficient design for developer dashboard or sidebars
          </p>
        </CardHeader>
        <CardContent>
          <DailyQuote variant="compact" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                🌐 API Integration
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>Uses free Quotable API (no API key required)</li>
                <li>Fetches motivational and inspirational quotes</li>
                <li>Automatic fallback quotes if API fails</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                💾 Caching System
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>Daily quote caching in localStorage</li>
                <li>Automatically refreshes once per day</li>
                <li>Manual refresh button available</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                🎨 Design Features
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>Three variants for different use cases</li>
                <li>Responsive design for all screen sizes</li>
                <li>Dark mode support</li>
                <li>Smooth loading animations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                ⚡ Performance
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                <li>Lightweight with skeleton loading states</li>
                <li>Error handling with graceful degradation</li>
                <li>Optimized for mobile devices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
