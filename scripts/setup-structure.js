#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=====================================================');
console.log('      Thiết lập cấu trúc thư mục mới cho SLM App     ');
console.log('=====================================================\n');

console.log('Bước 1: Tạo cấu trúc thư mục...');
try {
  execSync('mkdir -p src/components/{auth,layout,products,profile,ui/{buttons,cards,forms,modals,typography},shared} src/hooks src/context src/services src/utils/{helpers,formatters,validation} src/constants src/models src/styles', { stdio: 'inherit' });
  console.log('✅ Tạo cấu trúc thư mục thành công.\n');
} catch (error) {
  console.error('❌ Lỗi khi tạo cấu trúc thư mục:', error);
  process.exit(1);
}

console.log('Bước 2: Tổ chức lại thư mục app...');
try {
  execSync('mkdir -p app/\\(auth\\) app/\\(profile\\) app/\\(products\\) app/\\(brands\\) app/\\(quotes\\) app/\\(contacts\\) app/\\(stats\\)', { stdio: 'inherit' });
  console.log('✅ Tổ chức lại thư mục app thành công.\n');
} catch (error) {
  console.error('❌ Lỗi khi tổ chức lại thư mục app:', error);
  process.exit(1);
}

console.log('Bước 3: Cập nhật các đường dẫn import...');
try {
  execSync('node scripts/update-imports.js', { stdio: 'inherit' });
  console.log('✅ Cập nhật các đường dẫn import thành công.\n');
} catch (error) {
  console.error('❌ Lỗi khi cập nhật các đường dẫn import:', error);
  process.exit(1);
}

console.log('Bước 4: Tạo các symbolic links...');
try {
  execSync('node scripts/create-symlinks.js', { stdio: 'inherit' });
  console.log('✅ Tạo các symbolic links thành công.\n');
} catch (error) {
  console.error('❌ Lỗi khi tạo các symbolic links:', error);
  process.exit(1);
}

console.log('Bước 5: Kiểm tra lỗi TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ Kiểm tra lỗi TypeScript thành công.\n');
} catch (error) {
  console.error('❌ Lỗi TypeScript được phát hiện. Vui lòng kiểm tra lại.\n');
  console.error('   Bạn có thể chạy "npx tsc --noEmit" để xem chi tiết lỗi.');
  console.error('   Sau khi sửa lỗi, hãy chạy "npm run update-imports && npm run create-symlinks".\n');
}

console.log('=====================================================');
console.log('      Thiết lập cấu trúc thư mục mới hoàn tất!      ');
console.log('=====================================================\n');

console.log('📝 Lưu ý:');
console.log('1. Hãy đọc file MIGRATION_GUIDE.md để biết thêm chi tiết về cấu trúc mới.');
console.log('2. Để cập nhật lại đường dẫn import, chạy "npm run update-imports".');
console.log('3. Để tạo lại các symbolic links, chạy "npm run create-symlinks".');
console.log('4. Để xóa cache Metro, chạy "npm run clear-cache".');
console.log('5. Để thiết lập lại toàn bộ dự án, chạy "npm run setup".\n');

console.log('Chúc bạn có trải nghiệm tốt với cấu trúc thư mục mới! 🚀'); 