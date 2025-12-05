import { DataProfile } from '@/lib/dataAnalysis';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DistributionChartsProps {
  profile: DataProfile;
}

const CHART_COLORS = [
  'hsl(187, 92%, 50%)',
  'hsl(160, 84%, 45%)',
  'hsl(43, 96%, 56%)',
  'hsl(280, 87%, 65%)',
  'hsl(350, 89%, 60%)',
];

export function DistributionCharts({ profile }: DistributionChartsProps) {
  const distributions = Object.entries(profile.distributions).filter(([_, data]) => data.length > 0);

  if (distributions.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Distributions</h3>
        <p className="text-muted-foreground text-center py-8">No numeric columns to visualize.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Numeric Distributions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {distributions.slice(0, 6).map(([column, data], idx) => (
          <div key={column} className="chart-container">
            <h4 className="text-sm font-medium text-foreground mb-4 font-mono">{column}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis 
                  dataKey="bin" 
                  tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis 
                  tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 10%)',
                    border: '1px solid hsl(222, 47%, 16%)',
                    borderRadius: '8px',
                    color: 'hsl(210, 40%, 98%)',
                  }}
                  cursor={{ fill: 'hsl(222, 47%, 14%)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.map((_, index) => (
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
