import Image from "next/image";
import Features from "./Features";

export default function AboutSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Về Chúng Tôi</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Với hơn 10 năm kinh nghiệm trong lĩnh vực cung cấp rau củ quả sạch, chúng tôi tự hào là 
            đối tác tin cậy của hàng nghìn gia đình Việt Nam
          </p>
        </div>

        <Features />

        {/* Story Section */}
        <div className="bg-green-50 rounded-2xl p-8 lg:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Câu Chuyện Của Chúng Tôi</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Khởi nguồn từ một trang trại nhỏ tại vùng ngoại ô, chúng tôi đã không ngừng phát triển 
                với mục tiêu mang đến cho mọi gia đình những sản phẩm rau củ quả tươi ngon, sạch sẽ và 
                an toàn nhất.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Chúng tôi hợp tác với các nông dân địa phương, áp dụng công nghệ canh tác tiên tiến, 
                kết hợp với phương pháp truyền thống để tạo ra những sản phẩm chất lượng cao nhất.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Mỗi sản phẩm đều được kiểm tra kỹ lưỡng trước khi đến tay khách hàng, đảm bảo độ tươi 
                ngon và giá trị dinh dưỡng tối ưu.
              </p>
            </div>
            
            <div className="relative h-64 md:h-full min-h-[400px] rounded-xl overflow-hidden shadow-lg">
              <Image 
                src="/images/anh1.jpg"
                alt="Nông dân thu hoạch rau củ hữu cơ"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
