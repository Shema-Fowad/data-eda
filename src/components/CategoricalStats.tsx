import { DataProfile } from '@/lib/dataAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoricalStatsProps {
  profile: DataProfile;
}

const CHART_COLORS = [
  'hsl(187, 92%, 50%)',
  'hsl(160, 84%, 45%)',
  'hsl(43, 96%, 56%)',
  'hsl(280, 87%, 65%)',
  'hsl(350, 89%, 60%)',
];

export function CategoricalStats({ profile }: CategoricalStatsProps) {
  const categoricalColumns = Object.entries(profile.categoricalStats).filter(([_, data]) => data.length > 0);

  if (categoricalColumns.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Categorical Analysis</h3>
        <p className="text-muted-foreground text-center py-8">No categorical columns found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Categorical Value Counts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoricalColumns.slice(0, 6).map(([column, data], idx) => (
          <div key={column} className="chart-container">
            <h4 className="text-sm font-medium text-foreground mb-4 font-mono">{column}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart 
                data={data.slice(0, 8)} 
                layout="vertical"
                margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
              >
                <XAxis type="number" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }} />
                <YAxis 
                  type="category" 
                  dataKey="value" 
                  tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                  width={70}
                  tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 47%, 16%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value} (${props.payload.percentage}%)`,
                    'Count'
                  ]}
                  cursor={{ fill: 'hsl(222, 47%, 14%)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
