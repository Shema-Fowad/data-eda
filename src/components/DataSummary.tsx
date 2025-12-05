import { DataProfile } from '@/lib/dataAnalysis';
import { StatCard } from './StatCard';
import { Table, Columns, AlertTriangle, Copy, Hash } from 'lucide-react';

interface DataSummaryProps {
  profile: DataProfile;
}

export function DataSummary({ profile }: DataSummaryProps) {
  const totalMissing = Object.values(profile.missingValues).reduce((a, b) => a + b, 0);
  const missingPercentage = ((totalMissing / (profile.shape.rows * profile.shape.columns)) * 100).toFixed(1);
  const numericCols = Object.keys(profile.numericStats).length;
  const categoricalCols = profile.columns.length - numericCols;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Dataset Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Rows"
          value={profile.shape.rows.toLocaleString()}
          icon={Table}
        />
        <StatCard
          title="Columns"
          value={profile.shape.columns}
          subtitle={`${numericCols} numeric, ${categoricalCols} categorical`}
          icon={Columns}
        />
        <StatCard
          title="Missing Values"
          value={totalMissing.toLocaleString()}
          subtitle={`${missingPercentage}% of data`}
          icon={AlertTriangle}
          variant={Number(missingPercentage) > 5 ? 'warning' : 'default'}
        />
        <StatCard
          title="Duplicates"
          value={profile.duplicates}
          subtitle={profile.duplicates > 0 ? 'rows found' : 'none found'}
          icon={Copy}
          variant={profile.duplicates > 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Outliers"
          value={Object.values(profile.outliers).reduce((a, b) => a + b.count, 0)}
          subtitle="detected via IQR"
          icon={Hash}
          variant={Object.values(profile.outliers).some(o => o.percentage > 5) ? 'warning' : 'default'}
        />
      </div>
    </div>
  );
}
