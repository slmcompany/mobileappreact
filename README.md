# SLM App

Một ứng dụng di động phát triển bằng Expo và React Native.

## Giới thiệu

SLM App là một ứng dụng di động đa nền tảng được phát triển bằng công nghệ Expo và React Native, sử dụng TypeScript để đảm bảo tính an toàn cho mã nguồn. Ứng dụng tập trung vào việc quản lý sản phẩm, theo dõi hoa hồng, và tương tác với người dùng.

## Tính năng chính

- **Quản lý tài khoản**: Đăng nhập, cập nhật mật khẩu và quản lý thông tin cá nhân
- **Danh mục sản phẩm**: Duyệt và tìm kiếm sản phẩm theo danh mục và thương hiệu
- **Thống kê hoa hồng**: Theo dõi và phân tích hoa hồng
- **Thư viện ảnh**: Quản lý và xem thư viện ảnh sản phẩm
- **Báo giá**: Xem chi tiết báo giá và quản lý liên hệ

## Cài đặt

1. Cài đặt các dependencies:

   ```bash
   npm install
   ```

   hoặc

   ```bash
   yarn install
   ```

2. Khởi chạy ứng dụng:

   ```bash
   npx expo start
   ```

## Cấu trúc dự án

- **/app**: Thư mục chính chứa mã nguồn ứng dụng (sử dụng file-based routing của Expo Router)
  - **/app/(tabs)**: Chứa các màn hình chính của ứng dụng (trang chủ, sản phẩm, thống kê, tài khoản)
  - **/app/product_page**: Các trang chi tiết sản phẩm
  - **/app/category**: Trang danh mục sản phẩm
  - **/app/brand**: Trang thương hiệu
- **/components**: Các components được tái sử dụng trong ứng dụng
- **/constants**: Định nghĩa các hằng số, theme và màu sắc
- **/hooks**: Các custom hooks
- **/assets**: Chứa hình ảnh, fonts và các tài nguyên khác

## Cấu trúc thư mục đề xuất

Dưới đây là cấu trúc thư mục được đề xuất để cải thiện tính tổ chức và khả năng mở rộng của dự án:

```
app/
├── (auth)/                  # Phân nhóm các route liên quan đến xác thực
│   ├── login.tsx            # Trang đăng nhập
│   ├── register.tsx         # Trang đăng ký (nếu có)
│   ├── password-update.tsx  # Trang cập nhật mật khẩu
│   └── _layout.tsx          # Layout cho phần xác thực
│
├── (main)/                  # Phân nhóm các route chính sau khi đăng nhập
│   ├── (tabs)/              # Tabs navigation
│   │   ├── home/            # Tab trang chủ
│   │   │   └── index.tsx
│   │   ├── products/        # Tab sản phẩm 
│   │   │   └── index.tsx
│   │   ├── gallery/         # Tab thư viện ảnh
│   │   │   └── index.tsx
│   │   ├── stats/           # Tab thống kê
│   │   │   └── index.tsx
│   │   ├── account/         # Tab tài khoản
│   │   │   └── index.tsx
│   │   └── _layout.tsx      # Layout cho tabs
│   │
│   ├── profile/             # Các trang profile
│   │   ├── index.tsx        # Trang chính profile
│   │   └── edit.tsx         # Trang chỉnh sửa profile
│   │
│   ├── products/            # Các trang sản phẩm
│   │   ├── [id].tsx         # Chi tiết sản phẩm
│   │   ├── line/[id].tsx    # Dòng sản phẩm
│   │   └── _layout.tsx      # Layout cho sản phẩm
│   │
│   ├── categories/          # Danh mục sản phẩm
│   │   ├── index.tsx        # Danh sách danh mục
│   │   └── [id].tsx         # Chi tiết danh mục
│   │
│   ├── brands/              # Thương hiệu
│   │   ├── index.tsx        # Danh sách thương hiệu
│   │   └── [id].tsx         # Chi tiết thương hiệu
│   │
│   ├── commission/          # Phần hoa hồng
│   │   ├── index.tsx        # Tổng quan hoa hồng
│   │   └── stats.tsx        # Thống kê hoa hồng
│   │
│   ├── quotes/              # Phần báo giá
│   │   ├── index.tsx        # Danh sách báo giá
│   │   └── [id].tsx         # Chi tiết báo giá
│   │
│   ├── contacts/            # Quản lý liên hệ
│   │   ├── index.tsx        # Danh sách liên hệ
│   │   ├── [id].tsx         # Chi tiết liên hệ
│   │   └── new.tsx          # Tạo liên hệ mới
│   │
│   └── _layout.tsx          # Layout chung cho phần main
│
├── api/                     # API endpoints (nếu có)
│
├── _layout.tsx              # Layout gốc
├── index.tsx                # Entry point (redirect)
└── +not-found.tsx           # Trang 404
```

### Ưu điểm của cấu trúc mới

- **Phân nhóm theo chức năng**: Phân tách rõ ràng giữa phần xác thực và phần chính
- **Tổ chức theo tính năng**: Mỗi tính năng lớn có thư mục riêng, dễ mở rộng và bảo trì
- **Cấu trúc route rõ ràng**: Sử dụng quy ước của Expo Router để tạo URL trực quan
- **Layout phân cấp**: Mỗi nhóm chức năng có layout riêng
- **Hỗ trợ Dynamic Routes**: Sử dụng tên file như `[id].tsx` cho các route động

## Công nghệ sử dụng

- **Expo**: Framework phát triển ứng dụng React Native
- **Expo Router**: Hệ thống định tuyến file-based
- **React Native**: Framework phát triển ứng dụng di động
- **TypeScript**: Ngôn ngữ lập trình an toàn kiểu dữ liệu
- **AsyncStorage**: Lưu trữ dữ liệu cục bộ
- **Reanimated**: Animations mượt mà
- **Ant Design React Native**: Thư viện UI components

## Các lệnh hữu ích

```bash
# Khởi chạy ứng dụng
npx expo start

# Khởi chạy trên Android
npm run android

# Khởi chạy trên iOS
npm run ios

# Khởi chạy trên web
npm run web

# Chạy tests
npm run test

# Kiểm tra lỗi linting
npm run lint
```

## Tìm hiểu thêm

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
