# Hướng dẫn chuyển đổi cấu trúc thư mục mới

Dự án đã được tái cấu trúc để cải thiện tính tổ chức và khả năng bảo trì. Tài liệu này sẽ hướng dẫn bạn về các thay đổi và cách làm việc với cấu trúc mới.

## Cấu trúc thư mục mới

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
```

## Các thay đổi chính

1. **Phân tách mã nguồn và định tuyến**: 
   - Thư mục `app/` chỉ chứa các tệp liên quan đến định tuyến và giao diện người dùng cấp cao.
   - Thư mục `src/` chứa mã nguồn chính của ứng dụng (components, hooks, services, v.v.).

2. **Nhóm các trang trong thư mục app/**:
   - Các trang được nhóm lại theo chức năng trong các thư mục có tên trong ngoặc đơn, ví dụ: `(auth)`, `(products)`.
   - Điều này tạo ra cấu trúc URL đẹp hơn và cải thiện việc tổ chức.

3. **Phân loại components**:
   - Components được tổ chức theo chức năng (auth, layout, products, v.v.).
   - Components UI cơ bản được đặt trong `src/components/ui/`.

## Hướng dẫn import

Đã có sự thay đổi trong cách import các module. Sử dụng các mẫu sau:

```typescript
// Import từ thư mục src
import { ComponentName } from '@/components/path/to/component';
import { useSomeHook } from '@/hooks/useSomeHook';
import { someConstant } from '@/constants/someConstant';

// Import từ thư mục app
import { someFunction } from '@/app/path/to/function';

// Import trực tiếp từ các thư mục con trong src
import { Button } from '@/components/ui/buttons/Button';
import { formatDate } from '@/utils/formatters/dateFormatter';
```

## Thêm component mới

Khi thêm component mới, hãy tuân theo các hướng dẫn sau:

1. **Component UI cơ bản**:
   - Đặt trong `src/components/ui/[category]/`.
   - Đặt tên theo PascalCase (ví dụ: `Button.tsx`).

2. **Component theo chức năng**:
   - Đặt trong `src/components/[feature]/`.
   - Ví dụ: Component liên quan đến xác thực nên đặt trong `src/components/auth/`.

3. **Trang mới**:
   - Đặt trong `app/[group]/` phù hợp.
   - Sử dụng quy ước đặt tên của Expo Router.

## Lưu ý về Symbolic Links

Dự án sử dụng symbolic links để hỗ trợ cả cấu trúc thư mục cũ và mới mà không làm hỏng các import paths hiện có:

- Khi bạn pull code từ repository, hãy chạy `npm run create-symlinks` để tạo lại các symbolic links cần thiết.
- Các thư mục như `components`, `hooks`, `context` ở thư mục gốc thực chất là symbolic links đến các thư mục tương ứng trong `src/`.
- Khi bạn cần thêm hoặc sửa code, hãy làm việc trực tiếp trong thư mục `src/`.

## Khắc phục sự cố

Nếu gặp lỗi liên quan đến import sau khi chuyển đổi, hãy thử các bước sau:

1. **Chạy lại script cập nhật import**:
   ```
   npm run update-imports
   ```

2. **Tạo lại các symbolic links**:
   ```
   npm run create-symlinks
   ```

3. **Xóa cache Metro**:
   ```
   npm run clear-cache
   ```

4. **Kiểm tra đường dẫn import**:
   - Đảm bảo bạn đang sử dụng các alias đã định nghĩa trong tsconfig.json và babel.config.js.

5. **Kiểm tra các lỗi TypeScript**:
   - Chạy `npx tsc --noEmit` để kiểm tra các lỗi TypeScript.

6. **Trường hợp đồng bộ mã không đúng**:
   - Đôi khi symbolic links có thể gây nhầm lẫn. Nếu có vấn đề, hãy kiểm tra xem cả hai vị trí (thư mục gốc và thư mục `src/`) có phiên bản giống nhau của file.
   - Sử dụng `npm run setup` để thiết lập lại toàn bộ dự án.

## Quy ước đặt tên

- **Thành phần**: PascalCase (ví dụ: `ProductCard.tsx`)
- **Hook**: camelCase với tiền tố "use" (ví dụ: `useAuth.ts`)
- **Context**: PascalCase với hậu tố "Context" (ví dụ: `AuthContext.tsx`)
- **Utilities**: camelCase (ví dụ: `formatDate.ts`)

## Các tệp cấu hình đã cập nhật

- **tsconfig.json**: Đã thêm các đường dẫn alias mới.
- **metro.config.js**: Đã cấu hình Metro để hỗ trợ cấu trúc thư mục mới.
- **babel.config.js**: Đã cập nhật để hỗ trợ alias.

## Lời khuyên bổ sung

- **Sử dụng VSCode**: VSCode có hỗ trợ tốt cho TypeScript và sẽ giúp bạn điều hướng qua cấu trúc mới.
- **Làm quen với Expo Router**: Tìm hiểu cách Expo Router hoạt động để hiểu cấu trúc thư mục app/.
- **Git**: Cẩn thận khi commit các thay đổi vào symbolic links, đôi khi Git có thể xử lý chúng không như mong đợi.
- **TypeScript**: Sử dụng các type rõ ràng để IDE có thể giúp bạn phát hiện lỗi sớm. 