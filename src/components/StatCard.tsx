import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'success' | 'danger';
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = 'default' }: StatCardProps) {
  const iconColors = {
    default: 'text-primary bg-primary/10',
    warning: 'text-chart-3 bg-chart-3/10',
    success: 'text-accent bg-accent/10',
    danger: 'text-destructive bg-destructive/10',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-xs",
              variant === 'warning' && "text-chart-3",
              variant === 'danger' && "text-destructive",
              variant === 'success' && "text-accent",
              variant === 'default' && "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconColors[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
