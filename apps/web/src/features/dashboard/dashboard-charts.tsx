import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PARTICIPATION_DATA = [
  { month: 'Mai', rate: 68 },
  { month: 'Juin', rate: 10 },
  { month: 'Juil', rate: 72 },
  { month: 'Août', rate: 50 },
  { month: 'Sept', rate: 60 },
  { month: 'Oct', rate: 94 },
];

const TRAINING_DISTRIBUTION = [
  { name: 'Exercices', value: 89, color: 'hsl(256, 100%, 65%)' },
  { name: 'Complexes', value: 24, color: 'hsl(256, 100%, 85%)' },
  { name: 'Entraînements', value: 32, color: 'hsl(256, 100%, 88%)' },
];

export function ParticipationChart() {
  return (
    <div className="h-16 -mx-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={PARTICIPATION_DATA}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e9d5ff',
              borderRadius: '8px',
              padding: '8px',
            }}
            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value}%`, 'Taux']}
          />
          <Area
            type="monotone"
            dataKey="rate"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#colorRate)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DistributionChart() {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={TRAINING_DISTRIBUTION}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {TRAINING_DISTRIBUTION.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
