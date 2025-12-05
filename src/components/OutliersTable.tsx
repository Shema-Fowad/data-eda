import { DataProfile } from '@/lib/dataAnalysis';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface OutliersTableProps {
  profile: DataProfile;
}

export function OutliersTable({ profile }: OutliersTableProps) {
  const outlierColumns = Object.entries(profile.outliers).filter(([_, info]) => info.count > 0);
  const cleanColumns = Object.entries(profile.outliers).filter(([_, info]) => info.count === 0);

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Outlier Detection (IQR Method)</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Values beyond Q1 - 1.5×IQR and Q3 + 1.5×IQR are flagged as outliers
        </p>
      </div>
      
      {outlierColumns.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Column</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Outliers</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Percentage</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Lower Bound</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Upper Bound</th>
              </tr>
            </thead>
            <tbody>
              {outlierColumns.map(([col, info], idx) => (
                <tr 
                  key={col} 
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-muted/20",
                    idx % 2 === 0 && "bg-muted/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        "w-4 h-4",
                        info.percentage > 5 ? "text-destructive" : "text-chart-3"
                      )} />
                      <span className="font-mono text-sm text-foreground">{col}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-foreground">{info.count}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "font-mono text-sm font-medium",
                      info.percentage > 5 ? "text-destructive" : "text-chart-3"
                    )}>
                      {info.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{info.lowerBound}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-muted-foreground">{info.upperBound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-accent mx-auto mb-2" />
          <p className="text-foreground font-medium">No outliers detected!</p>
          <p className="text-sm text-muted-foreground">All numeric columns are within expected ranges.</p>
        </div>
      )}

      {cleanColumns.length > 0 && outlierColumns.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-accent inline mr-2" />
            Columns without outliers: {cleanColumns.map(([col]) => col).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
