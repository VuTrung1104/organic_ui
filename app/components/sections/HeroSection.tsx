import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative pt-20 h-[700px] overflow-hidden">
      <div className="absolute inset-0">
        <Image 
          src="/images/anhbia.jpg"
          alt="Cửa hàng rau củ tươi"
          fill
          sizes="100vw"
          className="object-cover brightness-75"
          priority
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Rau Củ Tươi Ngon<br />
            Từ Trang Trại Đến Bàn Ăn
          </h1>
          
          <p className="text-lg sm:text-xl text-white mb-8 leading-relaxed">
            Chúng tôi cung cấp rau củ quả tươi ngon, sạch sẽ, được trồng theo phương pháp hữu cơ, 
            đảm bảo an toàn cho sức khỏe gia đình bạn. Giao hàng tận nơi nhanh chóng trong ngày.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/products" 
              className="inline-block px-8 py-4 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition text-center"
            >
              Xem Sản Phẩm
            </a>
            <a 
              href="/contact" 
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-full font-medium hover:bg-gray-100 transition text-center"
            >
              Liên Hệ Ngay
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
