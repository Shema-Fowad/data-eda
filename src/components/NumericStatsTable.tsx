import { DataProfile } from '@/lib/dataAnalysis';
import { cn } from '@/lib/utils';

interface NumericStatsTableProps {
  profile: DataProfile;
}

export function NumericStatsTable({ profile }: NumericStatsTableProps) {
  const numericColumns = Object.entries(profile.numericStats);

  if (numericColumns.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Numeric Statistics</h3>
        <p className="text-muted-foreground text-center py-8">No numeric columns found in the dataset.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Numeric Statistics</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Column</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Count</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Mean</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Std</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Min</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">25%</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">50%</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">75%</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Max</th>
            </tr>
          </thead>
          <tbody>
            {numericColumns.map(([col, stats], idx) => (
              <tr 
                key={col} 
                className={cn(
                  "border-b border-border/50 transition-colors hover:bg-muted/20",
                  idx % 2 === 0 && "bg-muted/10"
                )}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-foreground">{col}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{stats.count}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-primary">{stats.mean}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{stats.std}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{stats.min}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{stats.q25}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-accent">{stats.median}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{stats.q75}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{stats.max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
