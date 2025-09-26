interface StatCard {
  label: string;
  value: string;
  color?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-7.5 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-waterloo dark:text-manatee text-sm">{stat.label}</div>
              <div className={`text-2xl font-semibold ${stat.color || 'text-black dark:text-white'}`}>
                {stat.value}
              </div>
              {stat.trend && (
                <div className={`text-xs mt-1 ${
                  stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend.isPositive ? '↗' : '↘'} {stat.trend.value}
                </div>
              )}
            </div>
            {stat.icon && (
              <div className="text-primary/60">
                {stat.icon}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
