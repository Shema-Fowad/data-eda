import { useState } from 'react';
import { Sparkles, Lightbulb, Wrench, Zap, Shield, Database, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIRecommendationsProps {
  recommendations: {
    dataCleaning: string[];
    restructuring: string[];
    featureEngineering: string[];
    qualityImprovements: string[];
    additionalData: string[];
    summary: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

interface RecommendationSectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  color: string;
}

function RecommendationSection({ title, items, icon, color }: RecommendationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!items || items.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", color)}>
            {icon}
          </div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {items.length} suggestions
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {items.map((item, idx) => (
            <div 
              key={idx}
              className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground font-mono w-6 shrink-0">{idx + 1}.</span>
              <p className="text-sm text-foreground">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AIRecommendations({ recommendations, isLoading, error }: AIRecommendationsProps) {
  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Sparkles className="w-5 h-5 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">AI Analysis Error</h3>
        </div>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full animate-pulse-glow" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Analyzing your data with AI...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 glow-primary">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold gradient-text">AI Insights & Suggestions</h3>
          <p className="text-sm text-muted-foreground">Recommendations to improve your dataset</p>
        </div>
      </div>

      {recommendations.summary && (
        <div className="glass-card p-4 border-l-4 border-primary">
          <p className="text-foreground">{recommendations.summary}</p>
        </div>
      )}

      <div className="space-y-4">
        <RecommendationSection
          title="Data Cleaning"
          items={recommendations.dataCleaning}
          icon={<Wrench className="w-5 h-5 text-chart-3" />}
          color="bg-chart-3/10"
        />
        <RecommendationSection
          title="Restructuring"
          items={recommendations.restructuring}
          icon={<Database className="w-5 h-5 text-primary" />}
          color="bg-primary/10"
        />
        <RecommendationSection
          title="Feature Engineering"
          items={recommendations.featureEngineering}
          icon={<Zap className="w-5 h-5 text-accent" />}
          color="bg-accent/10"
        />
        <RecommendationSection
          title="Quality Improvements"
          items={recommendations.qualityImprovements}
          icon={<Shield className="w-5 h-5 text-chart-4" />}
          color="bg-chart-4/10"
        />
        <RecommendationSection
          title="Additional Data Suggestions"
          items={recommendations.additionalData}
          icon={<Lightbulb className="w-5 h-5 text-chart-5" />}
          color="bg-chart-5/10"
        />
      </div>
    </div>
  );
}
