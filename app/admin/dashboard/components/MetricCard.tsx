import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  gradient: string;
  index: number;
}

export const MetricCard = ({ label, value, unit, icon: Icon, gradient, index }: MetricCardProps) => {
  return (
    <div 
      style={{ animationDelay: `${index * 100}ms` }}
      className={`group relative overflow-hidden rounded-2xl bg-linear-to-br ${gradient} p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-[slideUp_0.5s_ease-out_forwards] opacity-0`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="w-8 h-8 opacity-80 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
        </div>
        <h3 className="text-sm font-medium opacity-90 mb-2">{label}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold group-hover:scale-110 transition-transform duration-300">{value}</p>
          <span className="text-sm opacity-80">{unit}</span>
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:w-40 group-hover:h-40 transition-all duration-500"></div>
      <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};
