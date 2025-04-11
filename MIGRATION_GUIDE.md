# Hướng dẫn chuyển đổi cấu trúc thư mục mới

Dự án đã được tái cấu trúc để cải thiện tính tổ chức và khả năng bảo trì. Tài liệu này sẽ hướng dẫn bạn về các thay đổi và cách làm việc với cấu trúc mới.

## Cấu trúc thư mục chuẩn

```
slmapp/
├── app/                       # Chứa router và các trang (Expo Router)
│   ├── (auth)/                # Trang xác thực (đăng nhập, đăng ký, quên mật khẩu)
│   ├── (profile)/             # Trang hồ sơ người dùng
│   ├── (products)/            # Trang sản phẩm (danh sách, chi tiết, tìm kiếm)
│   ├── (brands)/              # Trang thương hiệu 
│   ├── (quotes)/              # Trang báo giá
│   ├── (quotation)/           # Trang tạo và quản lý báo giá
│   ├── (contacts)/            # Trang liên hệ và quản lý khách hàng
│   ├── (stats)/               # Trang thống kê và báo cáo
│   ├── (notification)/        # Trang thông báo
│   ├── (gallery)/             # Trang thư viện media
│   ├── (content)/             # Trang quản lý nội dung
│   ├── (group)/               # Trang quản lý nhóm
│   ├── (tabs)/                # Navigation tabs
│   ├── _layout.tsx            # Layout chính
│   ├── index.tsx              # Trang chủ
│   └── +not-found.tsx         # Trang 404
├── src/                       # Mã nguồn chính của ứng dụng
│   ├── components/            # Components UI tái sử dụng
│   │   ├── auth/              # Components xác thực
│   │   ├── layout/            # Components bố cục
│   │   ├── products/          # Components sản phẩm
│   │   ├── quotes/            # Components báo giá
│   │   ├── profile/           # Components hồ sơ
│   │   ├── contacts/          # Components liên hệ
│   │   ├── gallery/           # Components thư viện media
│   │   ├── content/           # Components nội dung
│   │   ├── stats/             # Components thống kê
│   │   ├── ui/                # Components UI cơ bản
│   │   │   ├── buttons/       # Các loại nút
│   │   │   ├── cards/         # Các loại card
│   │   │   ├── forms/         # Components form nhập liệu
│   │   │   ├── modals/        # Components modal/popup
│   │   │   ├── typography/    # Components văn bản
│   │   │   └── feedback/      # Components thông báo (toast, alert)
│   │   └── shared/            # Components dùng chung
│   ├── hooks/                 # Custom hooks
│   ├── context/               # React contexts
│   ├── services/              # Dịch vụ API, xác thực, bên thứ ba
│   ├── utils/                 # Các tiện ích
│   │   ├── helpers/           # Hàm helper
│   │   ├── formatters/        # Hàm định dạng
│   │   └── validation/        # Hàm xác thực
│   ├── constants/             # Hằng số và cấu hình
│   ├── models/                # TypeScript interfaces/types
│   ├── config/                # Cấu hình ứng dụng
│   └── styles/                # Styles, themes
├── assets/                    # Tài nguyên tĩnh (hình ảnh, font chữ)
├── scripts/                   # Scripts phục vụ phát triển
└── config/                    # Cấu hình dự án
```

## Các thay đổi chính

1. **Phân tách mã nguồn và định tuyến**: 
   - Thư mục `app/` chỉ chứa các tệp liên quan đến định tuyến và giao diện người dùng cấp cao.
   - Thư mục `src/` chứa mã nguồn chính của ứng dụng (components, hooks, services, v.v.).

2. **Nhóm các trang trong thư mục app/**:
   - Các trang được nhóm lại theo chức năng trong các thư mục có tên trong ngoặc đơn, ví dụ: `(auth)`, `(products)`.
   - Điều này tạo ra cấu trúc URL đẹp hơn và cải thiện việc tổ chức.
   - QUAN TRỌNG: Các thư mục phẳng (như `brand`, `category`, `product_baogia`) cần được di chuyển vào thư mục chức năng tương ứng có định dạng `(tên-chức-năng)`.

3. **Phân loại components**:
   - Components được tổ chức theo chức năng (auth, layout, products, v.v.).
   - Components UI cơ bản được đặt trong `src/components/ui/`.
   - Components dùng chung được đặt trong `src/components/shared/`.

## Hướng dẫn import

Sử dụng các mẫu sau:

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
   - Mỗi component nên được định nghĩa trong file riêng.
   - Ví dụ: `src/components/ui/buttons/PrimaryButton.tsx`.

2. **Component theo chức năng**:
   - Đặt trong `src/components/[feature]/`.
   - Ví dụ: Component liên quan đến xác thực nên đặt trong `src/components/auth/`.
   - Đối với các component phức tạp, có thể tạo thư mục con để tổ chức tốt hơn.
   - Ví dụ: `src/components/products/ProductList/ProductListItem.tsx`.

3. **Trang mới**:
   - Đặt trong `app/[group]/` phù hợp.
   - Sử dụng quy ước đặt tên của Expo Router.
   - Trang động (dynamic routes) sử dụng `[param].tsx`.
   - Trang con (nested routes) sử dụng thư mục lồng nhau.

## Hướng dẫn di chuyển thư mục và file

### Di chuyển từ cấu trúc cũ sang mới

1. **Thư mục không đúng chuẩn trong app**:
   - Di chuyển nội dung từ `app/brand` vào `app/(brands)`.
   - Di chuyển nội dung từ `app/category` vào `app/(products)`.
   - Di chuyển nội dung từ `app/product_baogia` vào `app/(products)`.

2. **Components trong app/components**:
   - Di chuyển các components theo chức năng tương ứng vào `src/components/`.
   - Ví dụ: `app/components/ContentGallery.tsx` → `src/components/content/ContentGallery.tsx`.

3. **Các thư mục khác trong app**:
   - Di chuyển các file từ `app/context`, `app/services`, `app/models` vào thư mục tương ứng trong `src/`.

## Lưu ý về Symbolic Links

Dự án sử dụng symbolic links để hỗ trợ cả cấu trúc thư mục cũ và mới mà không làm hỏng các import paths hiện có:

- Khi bạn pull code từ repository, hãy chạy `npm run create-symlinks` để tạo lại các symbolic links cần thiết.
- Các thư mục như `components`, `hooks`, `context` ở thư mục gốc thực chất là symbolic links đến các thư mục tương ứng trong `src/`.
- Khi bạn cần thêm hoặc sửa code, hãy làm việc trực tiếp trong thư mục `src/`.

## Quy trình chuyển đổi

Để chuyển đổi dự án sang cấu trúc mới, hãy thực hiện theo các bước sau:

1. **Thiết lập ban đầu**:
   ```bash
   npm run setup
   ```

2. **Di chuyển thư mục và file**:
   - Thực hiện di chuyển thủ công theo hướng dẫn ở trên, hoặc sử dụng script tự động.

3. **Cập nhật imports**:
   ```bash
   npm run update-imports
   ```

4. **Tạo lại symbolic links**:
   ```bash
   npm run create-symlinks
   ```

5. **Kiểm tra lỗi TypeScript**:
   ```bash
   npx tsc --noEmit
   ```

6. **Kiểm tra ứng dụng**:
   ```bash
   npm run start
   ```

## Khắc phục sự cố

Nếu gặp lỗi liên quan đến import sau khi chuyển đổi, hãy thử các bước sau:

1. **Chạy lại script cập nhật import**:
   ```bash
   npm run update-imports
   ```

2. **Tạo lại các symbolic links**:
   ```bash
   npm run create-symlinks
   ```

3. **Xóa cache Metro**:
   ```bash
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
- **Thư mục trong app**: Sử dụng ngoặc đơn và kebab-case (ví dụ: `(product-details)`)
- **Thư mục trong src**: Sử dụng kebab-case cho thư mục (ví dụ: `components/product-cards`)

## Các tệp cấu hình đã cập nhật

- **tsconfig.json**: Đã thêm các đường dẫn alias mới.
- **metro.config.js**: Đã cấu hình Metro để hỗ trợ cấu trúc thư mục mới.
- **babel.config.js**: Đã cập nhật để hỗ trợ alias.

## Lời khuyên bổ sung

- **Sử dụng VSCode**: VSCode có hỗ trợ tốt cho TypeScript và sẽ giúp bạn điều hướng qua cấu trúc mới.
- **Làm quen với Expo Router**: Tìm hiểu cách Expo Router hoạt động để hiểu cấu trúc thư mục app/.
- **Git**: Cẩn thận khi commit các thay đổi vào symbolic links, đôi khi Git có thể xử lý chúng không như mong đợi.
- **TypeScript**: Sử dụng các type rõ ràng để IDE có thể giúp bạn phát hiện lỗi sớm.
- **Code splitting**: Sử dụng React.lazy và Suspense để tải code theo nhu cầu, giúp tối ưu hóa hiệu suất.
- **Progressive disclosure**: Tổ chức components theo nguyên tắc tiết lộ dần dần, từ đơn giản đến phức tạp. 