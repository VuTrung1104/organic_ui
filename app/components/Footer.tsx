import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white" style={{fontFamily: 'cursive'}}>
                Rau Củ Tươi
              </span>
            </div>
            <p className="text-base leading-relaxed">
              Cung cấp rau củ quả tươi ngon, sạch sẽ, an toàn cho sức khỏe gia đình bạn.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6">Liên Kết Nhanh</h4>
            <ul className="space-y-3 text-base">
              <li><a href="/" className="hover:text-green-500 transition">Trang Chủ</a></li>
              <li><a href="/about" className="hover:text-green-500 transition">Giới Thiệu</a></li>
              <li><a href="/products" className="hover:text-green-500 transition">Sản Phẩm</a></li>
              <li><a href="/" className="hover:text-green-500 transition">Tin Tức</a></li>
              <li><a href="/contact" className="hover:text-green-500 transition">Liên Hệ</a></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-3 text-base">
              <li><a href="#" className="hover:text-green-500 transition">Chính Sách Đổi Trả</a></li>
              <li><a href="#" className="hover:text-green-500 transition">Hướng Dẫn Đặt Hàng</a></li>
              <li><a href="#" className="hover:text-green-500 transition">Phương Thức Thanh Toán</a></li>
              <li><a href="#" className="hover:text-green-500 transition">Câu Hỏi Thường Gặp</a></li>
              <li><a href="#" className="hover:text-green-500 transition">Điều Khoản Dịch Vụ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-lg font-bold mb-6">Thông Tin Liên Hệ</h4>
            <ul className="space-y-3 text-base">
              <li className="leading-relaxed">
                123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh
              </li>
              <li>
                <a href="tel:0123456789" className="hover:text-green-500 transition">
                  0123 456 789
                </a>
              </li>
              <li>
                <a href="mailto:info@raucutuoi.vn" className="hover:text-green-500 transition">
                  info@raucutuoi.vn
                </a>
              </li>
              <li className="pt-2 leading-relaxed">
                <div className="font-semibold text-white mb-1">Thứ 2 - Chủ Nhật</div>
                <div>7:00 - 21:00</div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-base">© 2025 Rau Củ Tươi.</p>
        </div>
      </div>
    </footer>
  );
}
