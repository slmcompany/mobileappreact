# SLM App

Một ứng dụng di động phát triển bằng Expo và React Native.

> **Lưu ý quan trọng:** Dự án đã được tái cấu trúc để cải thiện khả năng bảo trì. Hãy đọc file [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) để biết thêm chi tiết. Sau khi clone repository, hãy chạy `npm run setup` để thiết lập dự án.

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

### Cấu trúc thư mục chính

```
slmapp/
├── app/                       # Chứa router và các trang (Expo Router)
│   ├── (auth)/                # Nhóm các trang liên quan đến xác thực
│   ├── (profile)/             # Nhóm các trang liên quan đến hồ sơ
│   ├── (products)/            # Nhóm các trang liên quan đến sản phẩm
│   ├── (brands)/              # Nhóm các trang liên quan đến thương hiệu
│   ├── (quotes)/              # Nhóm các trang liên quan đến báo giá
│   ├── (contacts)/            # Nhóm các trang liên quan đến liên hệ
│   ├── (stats)/               # Nhóm các trang liên quan đến thống kê
│   ├── (tabs)/                # Navigation tabs
│   ├── _layout.tsx            # Layout chính
│   └── +not-found.tsx         # Trang 404
├── src/                       # Mã nguồn chính của ứng dụng
│   ├── components/            # Các thành phần UI có thể tái sử dụng
│   │   ├── auth/              # Các thành phần xác thực
│   │   ├── layout/            # Các thành phần bố cục
│   │   ├── products/          # Các thành phần sản phẩm
│   │   ├── profile/           # Các thành phần hồ sơ
│   │   ├── ui/                # Các thành phần UI cơ bản
│   │   │   ├── buttons/
│   │   │   ├── cards/
│   │   │   ├── forms/
│   │   │   ├── modals/
│   │   │   └── typography/
│   │   └── shared/            # Các thành phần dùng chung
│   ├── hooks/                 # Các custom hooks
│   ├── context/               # Các context React
│   ├── services/              # Các dịch vụ API, xác thực và tích hợp bên thứ ba
│   ├── utils/                 # Các tiện ích
│   │   ├── helpers/           # Các hàm helper
│   │   ├── formatters/        # Các hàm định dạng
│   │   └── validation/        # Các hàm xác thực
│   ├── constants/             # Các hằng số và cấu hình
│   ├── models/                # Các kiểu TypeScript và interfaces
│   └── styles/                # Các styles, themes
├── assets/                    # Tài nguyên tĩnh
│   ├── images/
│   ├── fonts/
│   └── icons/
└── các file cấu hình
```

### Quy ước đặt tên

- **Thành phần**: PascalCase (ví dụ: `ProductCard.tsx`)
- **Hook**: camelCase với tiền tố "use" (ví dụ: `useAuth.ts`)
- **Context**: PascalCase với hậu tố "Context" (ví dụ: `AuthContext.tsx`)
- **Utilities**: camelCase (ví dụ: `formatDate.ts`)

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

# Cấu trúc lại dự án
npm run setup-structure

# Tạo lại symbolic links
npm run create-symlinks

# Cập nhật các import paths
npm run update-imports
```

## Tìm hiểu thêm

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
