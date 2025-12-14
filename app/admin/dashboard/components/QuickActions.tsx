import Link from 'next/link';
import { Package, ShoppingBag, Users } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      href: '/admin/products',
      title: 'Quản Lý Sản Phẩm',
      description: 'Thêm, sửa, xóa sản phẩm',
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-100',
    },
    {
      href: '/admin/orders',
      title: 'Quản Lý Đơn Hàng',
      description: 'Xem và xử lý đơn hàng',
      icon: ShoppingBag,
      gradient: 'from-green-500 to-green-600',
      textColor: 'text-green-100',
    },
    {
      href: '/admin/users',
      title: 'Quản Lý Người Dùng',
      description: 'Xem danh sách khách hàng',
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100',
    },
  ];

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link 
            key={action.href}
            href={action.href}
            className={`group bg-linear-to-br ${action.gradient} rounded-2xl p-6 text-white hover:shadow-lg transition-all`}
          >
            <Icon className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-1">{action.title}</h3>
            <p className={`text-sm ${action.textColor}`}>{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
};
