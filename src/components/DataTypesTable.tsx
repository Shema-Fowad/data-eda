import { DataProfile } from '@/lib/dataAnalysis';
import { cn } from '@/lib/utils';

interface DataTypesTableProps {
  profile: DataProfile;
}

export function DataTypesTable({ profile }: DataTypesTableProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numeric': return 'bg-primary/10 text-primary';
      case 'categorical': return 'bg-accent/10 text-accent';
      case 'datetime': return 'bg-chart-3/10 text-chart-3';
      case 'boolean': return 'bg-chart-4/10 text-chart-4';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMissingColor = (percentage: number) => {
    if (percentage > 20) return 'text-destructive';
    if (percentage > 5) return 'text-chart-3';
    return 'text-accent';
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Column Information</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Column</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Missing</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Unique</th>
            </tr>
          </thead>
          <tbody>
            {profile.columns.map((col, idx) => {
              const missingCount = profile.missingValues[col];
              const missingPct = ((missingCount / profile.shape.rows) * 100).toFixed(1);
              const type = profile.dataTypes[col];
              const uniqueCount = type === 'numeric' 
                ? profile.numericStats[col]?.count || 0
                : profile.categoricalStats[col]?.length || 0;

              return (
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
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getTypeColor(type))}>
                      {type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm font-medium", getMissingColor(Number(missingPct)))}>
                      {missingCount} ({missingPct}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {uniqueCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
