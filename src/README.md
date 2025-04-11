# Cấu trúc thư mục dự án SLM App

## Tổng quan về cấu trúc thư mục

```
src/
├── components/            # Các thành phần UI có thể tái sử dụng
│   ├── auth/              # Các thành phần xác thực
│   ├── layout/            # Các thành phần bố cục
│   ├── products/          # Các thành phần sản phẩm
│   ├── profile/           # Các thành phần hồ sơ
│   ├── ui/                # Các thành phần UI cơ bản
│   │   ├── buttons/
│   │   ├── cards/
│   │   ├── forms/
│   │   ├── modals/
│   │   └── typography/
│   └── shared/            # Các thành phần dùng chung
├── hooks/                 # Các custom hooks
├── context/               # Các context React
├── services/              # Các dịch vụ API, xác thực và tích hợp bên thứ ba
├── utils/                 # Các tiện ích
│   ├── helpers/           # Các hàm helper
│   ├── formatters/        # Các hàm định dạng
│   └── validation/        # Các hàm xác thực
├── constants/             # Các hằng số và cấu hình
├── models/                # Các kiểu TypeScript và interfaces
└── styles/                # Các styles, themes
```

## Quy ước đặt tên

- **Thành phần**: PascalCase (ví dụ: `ProductCard.tsx`)
- **Hook**: camelCase với tiền tố "use" (ví dụ: `useAuth.ts`)
- **Context**: PascalCase với hậu tố "Context" (ví dụ: `AuthContext.tsx`)
- **Utilities**: camelCase (ví dụ: `formatDate.ts`)

## Hướng dẫn

### Components
- Mỗi component nên đi kèm với interface TypeScript riêng
- Sử dụng functional components với hooks
- Tách logic phức tạp ra thành custom hooks

### Services
- Sử dụng axios hoặc fetch cho các API call
- Mỗi dịch vụ nên được tách thành các file riêng biệt

### Styles
- Sử dụng styled-components hoặc các style được định nghĩa trong riêng từng component
- Khai báo theme và các biến chung trong thư mục styles

### Testing
- Các test file nên được đặt trong thư mục `__tests__` cùng cấp với file cần test 