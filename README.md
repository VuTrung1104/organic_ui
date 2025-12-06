# 🌱 EcoFresh - Organic Food E-commerce

Ứng dụng thương mại điện tử chuyên bán rau củ quả hữu cơ, được xây dựng với Next.js 16, TypeScript và TailwindCSS 4.

## ✨ Tính năng chính

### 🛍️ Khách hàng
- **Trang chủ:** Hero section, featured products, về chúng tôi, liên hệ
- **Sản phẩm:** Danh sách sản phẩm với phân trang, tìm kiếm và lọc theo danh mục
- **Chi tiết sản phẩm:** Xem thông tin, hình ảnh, thêm vào giỏ hàng và wishlist
- **Giỏ hàng:** Quản lý sản phẩm, cập nhật số lượng, tính tổng tiền
- **Thanh toán:** Chọn địa chỉ giao hàng, phương thức thanh toán (COD/MoMo)
- **Đơn hàng:** Xem lịch sử đơn hàng, theo dõi trạng thái đơn hàng
- **Wishlist:** Danh sách sản phẩm yêu thích
- **Hồ sơ:** Quản lý thông tin cá nhân, địa chỉ giao hàng

### 🔐 Xác thực
- Đăng ký tài khoản với xác thực OTP qua email
- Đăng nhập với JWT token
- Quên mật khẩu với OTP verification
- Protected routes cho các trang yêu cầu đăng nhập

### 👨‍💼 Quản trị viên
- **Dashboard:** Thống kê tổng quan (doanh thu, đơn hàng, khách hàng, sản phẩm)
- **Quản lý sản phẩm:** CRUD sản phẩm, upload hình ảnh
- **Quản lý đơn hàng:** Xem và cập nhật trạng thái đơn hàng
- **Quản lý danh mục:** CRUD danh mục sản phẩm
- **Quản lý người dùng:** Xem danh sách và khóa/mở khóa tài khoản

### 💳 Thanh toán
- **COD (Cash on Delivery):** Thanh toán khi nhận hàng
- **MoMo:** Tích hợp cổng thanh toán MoMo với xử lý callback

## 🛠️ Công nghệ sử dụng

- **Framework:** Next.js 16.0.5 (App Router)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4 (PostCSS)
- **Icons:** Lucide React 0.555.0
- **State Management:** React Context API & Hooks
- **UI:** React 19.2.0
- **Authentication:** JWT với localStorage
- **API Client:** Fetch API với error handling
- **Form Validation:** Custom validation
- **Image Optimization:** Next.js Image component với lazy loading

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống
- Node.js 20+ 
- npm hoặc yarn
- Backend API server đang chạy

### Các bước cài đặt

1. **Clone repository:**
```bash
git clone https://github.com/VuTrung1104/organic_ui.git
cd organic_ui
```

2. **Cài đặt dependencies:**
```bash
npm install
# hoặc
yarn install
```

3. **Cấu hình biến môi trường:**

Tạo file `.env.local` trong thư mục gốc và thêm:
```env
NEXT_PUBLIC_API_URL=<your_backend_api_url>
```

4. **Chạy development server:**
```bash
npm run dev
# hoặc
yarn dev
```

5. **Mở ứng dụng:**

Truy cập [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### Build Production

```bash
# Build ứng dụng
npm run build

# Chạy production server
npm run start
```

## 📜 Scripts

- `npm run dev` - Chạy development server (port 3000)
- `npm run build` - Build ứng dụng cho production
- `npm run start` - Chạy production server
- `npm run lint` - Kiểm tra lỗi code với ESLint

## 📁 Cấu trúc thư mục

```
organic_ui/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/           # Trang đăng nhập
│   │   ├── register/        # Trang đăng ký
│   │   └── forgot-password/ # Quên mật khẩu
│   ├── (main)/              # Public pages
│   │   ├── page.tsx         # Trang chủ
│   │   ├── about/           # Về chúng tôi
│   │   ├── contact/         # Liên hệ
│   │   ├── products/        # Danh sách & chi tiết sản phẩm
│   │   ├── cart/            # Giỏ hàng
│   │   ├── checkout/        # Thanh toán
│   │   ├── orders/          # Đơn hàng
│   │   ├── wishlist/        # Sản phẩm yêu thích
│   │   └── payment/         # Xử lý thanh toán MoMo
│   ├── admin/               # Admin dashboard
│   │   ├── dashboard/       # Thống kê
│   │   ├── products/        # Quản lý sản phẩm
│   │   ├── orders/          # Quản lý đơn hàng
│   │   ├── categories/      # Quản lý danh mục
│   │   └── users/           # Quản lý người dùng
│   ├── profile/             # User profile
│   │   ├── page.tsx         # Thông tin cá nhân
│   │   ├── addresses/       # Quản lý địa chỉ
│   │   └── orders/          # Lịch sử đơn hàng
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   ├── layout/              # Layout components
│   │   ├── Header.tsx       # Header với navigation & cart
│   │   └── Footer.tsx       # Footer
│   ├── sections/            # Homepage sections
│   │   ├── HeroSection.tsx  # Banner chính
│   │   ├── Features.tsx     # Tính năng nổi bật
│   │   ├── ProductsSection.tsx
│   │   ├── AboutSection.tsx
│   │   └── ContactSection.tsx
│   └── ui/                  # Reusable UI components
│       ├── ProductCard.tsx  # Card hiển thị sản phẩm
│       ├── LazyImage.tsx    # Lazy loading image
│       ├── Toast.tsx        # Thông báo
│       ├── ConfirmDialog.tsx
│       └── ScrollToTop.tsx
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   ├── api.ts              # API client & endpoints
│   ├── cache.ts            # Client-side caching
│   ├── constants.ts        # App constants
│   ├── hooks/              # Custom React hooks
│   │   ├── useDebounce.ts
│   │   ├── useIntersectionObserver.ts
│   │   └── useToast.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   └── utils/              # Utility functions
│       ├── error-handler.ts
│       └── formatters.ts
├── public/
│   └── images/             # Static images
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts
```

## 🔑 Tính năng nổi bật

### Performance Optimization
- **Image Lazy Loading:** Sử dụng Intersection Observer API
- **Client-side Caching:** Cache API responses để giảm request
- **Code Splitting:** Next.js automatic code splitting
- **Debouncing:** Tối ưu search và filter operations

### User Experience
- **Responsive Design:** Tối ưu cho mobile, tablet và desktop
- **Toast Notifications:** Thông báo realtime cho user actions
- **Loading States:** Skeleton screens và spinners
- **Error Handling:** Graceful error messages
- **Scroll to Top:** Quick navigation button
- **Confirm Dialogs:** Xác nhận trước khi thực hiện actions quan trọng

### Security
- **JWT Authentication:** Token-based authentication
- **Protected Routes:** Middleware bảo vệ routes
- **Role-based Access:** Admin và User roles
- **OTP Verification:** 2-factor authentication cho đăng ký/quên mật khẩu

## 🌐 API Endpoints

Ứng dụng tương tác với các endpoints sau (Backend API):

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/verify-otp` - Xác thực OTP
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục (Admin)
- `PUT /api/categories/:id` - Cập nhật danh mục (Admin)
- `DELETE /api/categories/:id` - Xóa danh mục (Admin)

### Cart & Wishlist
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm vào giỏ hàng
- `PUT /api/cart/:id` - Cập nhật giỏ hàng
- `DELETE /api/cart/:id` - Xóa khỏi giỏ hàng
- `GET /api/wishlist` - Lấy wishlist
- `POST /api/wishlist` - Thêm/xóa wishlist

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/:id` - Cập nhật trạng thái (Admin)

### User & Addresses
- `GET /api/user/profile` - Lấy thông tin user
- `PUT /api/user/profile` - Cập nhật profile
- `GET /api/user/addresses` - Lấy danh sách địa chỉ
- `POST /api/user/addresses` - Thêm địa chỉ
- `PUT /api/user/addresses/:id` - Cập nhật địa chỉ
- `DELETE /api/user/addresses/:id` - Xóa địa chỉ

### Payment
- `POST /api/payment/momo/create` - Tạo payment MoMo
- `GET /api/payment/momo/callback` - Callback từ MoMo

### Admin Statistics
- `GET /api/admin/statistics` - Thống kê dashboard

## 📱 Screenshots

> Thêm screenshots của ứng dụng tại đây

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát hành dưới MIT License.

## 👨‍💻 Tác giả

**Vu Trung**
- GitHub: [@VuTrung1104](https://github.com/VuTrung1104)

## 🙏 Acknowledgments

- Next.js team cho framework tuyệt vời
- TailwindCSS cho utility-first CSS
- Lucide cho icon library
- MoMo cho payment gateway integration