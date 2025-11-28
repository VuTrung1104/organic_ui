import { Leaf, Truck, ShieldCheck, DollarSign } from 'lucide-react';

const features = [
  {
    icon: <Leaf className="w-12 h-12 text-green-600" />,
    title: "Hữu Cơ 100%",
    description: "Tất cả sản phẩm được trồng theo phương pháp hữu cơ, không sử dụng hóa chất độc hại"
  },
  {
    icon: <Truck className="w-12 h-12 text-green-600" />,
    title: "Giao Hàng Nhanh",
    description: "Giao hàng tận nơi trong ngày, đảm bảo rau củ luôn tươi ngon khi đến tay bạn"
  },
  {
    icon: <ShieldCheck className="w-12 h-12 text-green-600" />,
    title: "An Toàn Vệ Sinh",
    description: "Quy trình sản xuất và đóng gói đạt chuẩn HACCP, đảm bảo vệ sinh an toàn thực phẩm"
  },
  {
    icon: <DollarSign className="w-12 h-12 text-green-600" />,
    title: "Giá Cả Hợp Lý",
    description: "Giá cả cạnh tranh, nhiều chương trình khuyến mãi hấp dẫn cho khách hàng thân thiết"
  }
];

export default function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className="text-center p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              {feature.icon}
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
          <p className="text-gray-600 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
