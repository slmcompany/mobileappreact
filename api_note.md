# API Documentation for SLM App

## Base URL
```
https://api.slmglobal.vn/api
```

## Authentication APIs
- **GET /users**: Lấy danh sách người dùng
  - Endpoint: `https://api.slmglobal.vn/api/users`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Danh sách người dùng
  - Được sử dụng trong: `AuthService.ts`

- **GET /users/{id}**: Lấy thông tin chi tiết người dùng
  - Endpoint: `https://api.slmglobal.vn/api/users/{id}`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Thông tin chi tiết người dùng
  - Được sử dụng trong: `AuthService.ts`

- **GET /auth/me**: Lấy thông tin người dùng hiện tại
  - Endpoint: `https://api.slmglobal.vn/api/auth/me`
  - Method: GET
  - Headers: 
    - `Content-Type: application/json`
    - `Authorization: Bearer {token}`
  - Response: Thông tin người dùng hiện tại
  - Được sử dụng trong: `quotation_success.tsx`

## Content APIs
- **GET /content**: Lấy danh sách nội dung
  - Endpoint: `https://api.slmglobal.vn/api/content`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Danh sách bài đăng/nội dung
  - Được sử dụng trong: `gallery.tsx`, `post_category.tsx`

## Sector APIs
- **GET /sector**: Lấy tất cả sector và combo
  - Endpoint: `https://api.slmglobal.vn/api/sector`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Danh sách sector
  - Được sử dụng trong: `gallery.tsx`, `sectorApi.ts`

- **GET /sector/{id}**: Lấy thông tin chi tiết sector
  - Endpoint: `https://api.slmglobal.vn/api/sector/{id}`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Thông tin chi tiết sector
  - Được sử dụng trong: `sectorApi.ts`

## APIs bên ngoài
- **GET https://provinces.open-api.vn/api/d/{districtCode}?depth=2**: Lấy thông tin phường/xã theo quận/huyện
  - Endpoint: `https://provinces.open-api.vn/api/d/{districtCode}?depth=2`
  - Method: GET
  - Response: Danh sách phường/xã thuộc quận/huyện

## Các API được định nghĩa nhưng chưa thấy sử dụng
### Products
- **GET /products**: Lấy danh sách sản phẩm
- **GET /products/{id}**: Lấy chi tiết sản phẩm
- **GET /products/categories**: Lấy danh mục sản phẩm
- **GET /products/search**: Tìm kiếm sản phẩm
- **GET /products/healthcheck**: Kiểm tra tình trạng API sản phẩm

### Categories
- **GET /categories**: Lấy danh sách danh mục
- **GET /categories/{id}**: Lấy chi tiết danh mục
- **GET /categories/{id}/products**: Lấy sản phẩm thuộc danh mục

### Orders
- **GET /orders**: Lấy danh sách đơn hàng
- **GET /orders/{id}**: Lấy chi tiết đơn hàng
- **POST /orders**: Tạo đơn hàng mới
- **PUT /orders/{id}**: Cập nhật đơn hàng
- **DELETE /orders/{id}**: Xóa đơn hàng

### Users
- **GET /users/profile**: Lấy thông tin hồ sơ người dùng
- **PUT /users/profile**: Cập nhật hồ sơ người dùng
- **GET /users/orders**: Lấy đơn hàng của người dùng
- **GET /users/favorites**: Lấy danh sách yêu thích của người dùng

### Customer
- **POST /agents/create-new-potential-customer**: Tạo khách hàng tiềm năng mới
  - Endpoint: `https://api.slmglobal.vn/api/agents/create-new-potential-customer`
  - Method: POST
  - Headers: 
    - `Content-Type: application/json`
    - `Accept: application/json`
    - `Authorization: Bearer {token}`
  - Body: Thông tin khách hàng tiềm năng
  - Response: Kết quả tạo khách hàng

## Cách sử dụng API trong dự án
API được gọi bằng 2 phương thức chủ yếu:
1. Sử dụng **axios**:
   ```typescript
   const response = await axios.get<Sector[]>(`${API_BASE_URL}/sector`);
   return response.data;
   ```

2. Sử dụng **fetch** API:
   ```typescript
   const response = await fetch('https://api.slmglobal.vn/api/users', {
     method: 'GET',
     headers: API_CONFIG.HEADERS
   });
   const data = await response.json();
   ```

## Lưu ý quan trọng
1. **Cấu hình API**:
   - Base URL được cấu hình trong file `src/config/api.ts` và `app/config/api.ts`
   - Timeout mặc định: 30 giây
   - Headers mặc định:
     - `Accept: application/json`
     - `Content-Type: application/json`

2. **Vấn đề cần cải thiện**:
   - Có sự khác biệt nhỏ giữa cấu hình API trong `src/config/api.ts` và `app/config/api.ts`
   - Một số API call sử dụng hardcoded URL thay vì sử dụng cấu hình từ file config
   - Cần thống nhất việc sử dụng axios hoặc fetch API để tránh code không đồng nhất
   - Nhiều API được định nghĩa nhưng chưa được sử dụng trong code

3. **Best Practices**:
   - Nên sử dụng cấu hình API từ file config thay vì hardcoded URL
   - Thống nhất sử dụng một phương thức gọi API (axios hoặc fetch)
   - Thêm xử lý lỗi và retry logic cho các API call quan trọng
   - Implement caching cho các API call thường xuyên
   - Sử dụng TypeScript interfaces cho response types
