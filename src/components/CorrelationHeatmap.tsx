import { DataProfile } from '@/lib/dataAnalysis';
import { cn } from '@/lib/utils';

interface CorrelationHeatmapProps {
  profile: DataProfile;
}

export function CorrelationHeatmap({ profile }: CorrelationHeatmapProps) {
  const columns = Object.keys(profile.correlations);

  if (columns.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Correlation Matrix</h3>
        <p className="text-muted-foreground text-center py-8">No numeric columns to correlate.</p>
      </div>
    );
  }

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (value === 1) return 'bg-muted text-muted-foreground'; // Self-correlation
    if (absValue >= 0.8) return value > 0 ? 'bg-accent/80 text-accent-foreground' : 'bg-destructive/80 text-destructive-foreground';
    if (absValue >= 0.6) return value > 0 ? 'bg-accent/60 text-foreground' : 'bg-destructive/60 text-foreground';
    if (absValue >= 0.4) return value > 0 ? 'bg-accent/40 text-foreground' : 'bg-destructive/40 text-foreground';
    if (absValue >= 0.2) return value > 0 ? 'bg-accent/20 text-foreground' : 'bg-destructive/20 text-foreground';
    return 'bg-muted/50 text-muted-foreground';
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Correlation Matrix</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Green indicates positive correlation, red indicates negative
        </p>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2"></th>
              {columns.map(col => (
                <th 
                  key={col} 
                  className="p-2 text-xs font-mono text-muted-foreground"
                  style={{ 
                    writingMode: 'vertical-lr', 
                    transform: 'rotate(180deg)',
                    whiteSpace: 'nowrap',
                    maxWidth: '60px'
                  }}
                >
                  {col.length > 12 ? col.slice(0, 12) + '...' : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map(row => (
              <tr key={row}>
                <td className="p-2 text-xs font-mono text-muted-foreground whitespace-nowrap">
                  {row.length > 12 ? row.slice(0, 12) + '...' : row}
                </td>
                {columns.map(col => {
                  const value = profile.correlations[row][col];
                  return (
                    <td key={col} className="p-1">
                      <div 
                        className={cn(
                          "w-12 h-12 flex items-center justify-center rounded text-xs font-mono transition-all hover:scale-110",
                          getCorrelationColor(value)
                        )}
                        title={`${row} vs ${col}: ${value}`}
                      >
                        {value.toFixed(2)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
