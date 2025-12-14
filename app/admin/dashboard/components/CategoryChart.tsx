import { Package } from 'lucide-react';
import type { CategoryStats } from '../types';

interface CategoryChartProps {
  categoryStats: CategoryStats[];
}

export const CategoryChart = ({ categoryStats }: CategoryChartProps) => {
  const colors = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  
  const colorClasses = [
    'bg-green-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-lime-500'
  ];

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Phân Bố Danh Mục Sản Phẩm</h2>
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">Chưa có dữ liệu danh mục</p>
        </div>
      </div>
    );
  }

  let currentAngle = 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Phân Bố Danh Mục Sản Phẩm</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              {categoryStats
                .filter(stat => stat.productCount > 0)
                .map((stat, index) => {
                  const percentage = stat.percentage;
                  const angle = (percentage / 100) * 360;
                  const startAngle = currentAngle;
                  const endAngle = currentAngle + angle;
                  
                  currentAngle = endAngle;
                  
                  const startX = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                  const startY = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                  const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                  const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArc = angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${startX} ${startY}`,
                    `A 80 80 0 ${largeArc} 1 ${endX} ${endY}`,
                    `Z`
                  ].join(' ');
                  
                  return (
                    <path
                      key={stat.category._id}
                      d={pathData}
                      fill={colors[index % colors.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  );
                })}
              <circle cx="100" cy="100" r="50" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{categoryStats.length}</p>
                <p className="text-sm text-gray-600">Danh mục</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {categoryStats.map((stat, index) => (
            <div 
              key={stat.category._id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-4 h-4 rounded ${colorClasses[index % colorClasses.length]} ${stat.productCount === 0 ? 'opacity-30' : ''}`}></div>
                <span className={`font-medium ${stat.productCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                  {stat.category.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${stat.productCount === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.productCount} sản phẩm
                </span>
                <span className={`font-bold min-w-[60px] text-right ${stat.productCount === 0 ? 'text-gray-400' : 'text-gray-900'}`}>
                  {stat.productCount > 0 ? stat.percentage.toFixed(1) : '0.0'}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
