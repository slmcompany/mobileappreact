# API Documentation for SLM App

## Base URL
```
https://id.slmsolar.com/api
```

## Authentication APIs
- **GET /users**: Lấy danh sách người dùng
  - Endpoint: `https://id.slmsolar.com/api/users`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Danh sách người dùng

- **GET /users/{id}**: Lấy thông tin chi tiết người dùng
  - Endpoint: `https://id.slmsolar.com/api/users/{id}`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Thông tin chi tiết người dùng

## Content APIs
- **GET /content**: Lấy danh sách nội dung
  - Endpoint: `https://id.slmsolar.com/api/content`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Danh sách bài đăng/nội dung

## Sector APIs
- **GET /sector**: Lấy tất cả sector và combo
  - Endpoint: `https://id.slmsolar.com/api/sector`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Danh sách sector

- **GET /sector/{id}**: Lấy thông tin chi tiết sector
  - Endpoint: `https://id.slmsolar.com/api/sector/{id}`
  - Method: GET
  - Headers: `Accept: application/json`
  - Response: Thông tin chi tiết sector

## Customer APIs
- **POST /agents/create-new-potential-customer**: Tạo khách hàng tiềm năng mới
  - Endpoint: `https://id.slmsolar.com/api/agents/create-new-potential-customer`
  - Method: POST
  - Headers: 
    - `Content-Type: application/json`
    - `Accept: application/json`
    - `Authorization: Bearer {token}`
  - Body: Thông tin khách hàng tiềm năng
  - Response: Kết quả tạo khách hàng

## API Endpoints (Được định nghĩa nhưng chưa thấy sử dụng)
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

## APIs bên ngoài
- **GET https://provinces.open-api.vn/api/d/{districtCode}?depth=2**: Lấy thông tin phường/xã theo quận/huyện
  - Endpoint: `https://provinces.open-api.vn/api/d/{districtCode}?depth=2`
  - Method: GET
  - Response: Danh sách phường/xã thuộc quận/huyện

## Cách sử dụng API trong dự án
API được gọi bằng 2 phương thức chủ yếu:
1. Sử dụng **axios**:
   ```typescript
   const response = await axios.get<Sector[]>(`${API_BASE_URL}/sector`);
   return response.data;
   ```

2. Sử dụng **fetch** API:
   ```typescript
   const response = await fetch('https://id.slmsolar.com/api/users', {
     method: 'GET',
     headers: API_CONFIG.HEADERS
   });
   const data = await response.json();
   ```
