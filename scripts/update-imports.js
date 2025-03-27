#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Các ánh xạ đường dẫn cũ sang mới
const pathMappings = [
  // Sửa lỗi import với ./src/ (nên là @ hoặc ./)
  { from: /from\s+['"]\.\/(src\/.*)['"]/g, to: 'from \'@/$1\'' },
  { from: /from\s+['"]\.\.\/src\/(.+)['"]/g, to: 'from \'@/src/$1\'' },
  
  // Sửa lỗi đặc biệt với @/src/
  { from: /from\s+['"]@\/src\/config\/(.+)['"]/g, to: 'from \'@/config/$1\'' },
  { from: /from\s+['"]@\/src\/components\/(.+)['"]/g, to: 'from \'@/components/$1\'' },
  { from: /from\s+['"]@\/src\/context\/(.+)['"]/g, to: 'from \'@/context/$1\'' },
  { from: /from\s+['"]@\/src\/hooks\/(.+)['"]/g, to: 'from \'@/hooks/$1\'' },
  { from: /from\s+['"]@\/src\/models\/(.+)['"]/g, to: 'from \'@/models/$1\'' },
  { from: /from\s+['"]@\/src\/services\/(.+)['"]/g, to: 'from \'@/services/$1\'' },
  { from: /from\s+['"]@\/src\/constants\/(.+)['"]/g, to: 'from \'@/constants/$1\'' },
  { from: /from\s+['"]@\/src\/utils\/(.+)['"]/g, to: 'from \'@/utils/$1\'' },
  { from: /from\s+['"]@\/src\/styles\/(.+)['"]/g, to: 'from \'@/styles/$1\'' },
  
  // Components
  { from: /from\s+['"]@\/components\/(.+)['"]/g, to: 'from \'@/components/$1\'' },
  { from: /from\s+['"]\.\.\/components\/(.+)['"]/g, to: 'from \'../components/$1\'' },
  { from: /from\s+['"]\.\/(components\/.*)['"]/g, to: 'from \'./components/$1\'' },
  
  // Đường dẫn trong src/components 
  { from: /from\s+['"]@\/src\/components\/(.+)['"]/g, to: 'from \'@/components/$1\'' },
  
  // Context
  { from: /from\s+['"]\.\/context\/(.+)['"]/g, to: 'from \'./context/$1\'' },
  { from: /from\s+['"]\.\.\/context\/(.+)['"]/g, to: 'from \'../context/$1\'' },
  { from: /from\s+['"]@\/context\/(.+)['"]/g, to: 'from \'@/context/$1\'' },
  
  // Hooks
  { from: /from\s+['"]@\/hooks\/(.+)['"]/g, to: 'from \'@/hooks/$1\'' },
  { from: /from\s+['"]\.\.\/hooks\/(.+)['"]/g, to: 'from \'../hooks/$1\'' },
  { from: /from\s+['"]\.\/(hooks\/.*)['"]/g, to: 'from \'./hooks/$1\'' },
  
  // Constants
  { from: /from\s+['"]@\/constants\/(.+)['"]/g, to: 'from \'@/constants/$1\'' },
  { from: /from\s+['"]\.\.\/constants\/(.+)['"]/g, to: 'from \'../constants/$1\'' },
  { from: /from\s+['"]\.\/(constants\/.*)['"]/g, to: 'from \'./constants/$1\'' },
  
  // Services
  { from: /from\s+['"]\.\/services\/(.+)['"]/g, to: 'from \'./services/$1\'' },
  { from: /from\s+['"]\.\.\/services\/(.+)['"]/g, to: 'from \'../services/$1\'' },
  { from: /from\s+['"]@\/services\/(.+)['"]/g, to: 'from \'@/services/$1\'' },
  
  // Models
  { from: /from\s+['"]\.\.\/models\/(.+)['"]/g, to: 'from \'../models/$1\'' },
  { from: /from\s+['"]\.\/models\/(.+)['"]/g, to: 'from \'./models/$1\'' },
  
  // Config
  { from: /from\s+['"]\.\.\/config\/(.+)['"]/g, to: 'from \'../config/$1\'' },
  { from: /from\s+['"]\.\/config\/(.+)['"]/g, to: 'from \'./config/$1\'' },
];

// Tìm tất cả các file TypeScript và TSX trong dự án
console.log('Đang tìm kiếm các file TypeScript và TSX...');
const findCommand = 'find . -type f -name "*.ts" -o -name "*.tsx" | grep -v "node_modules" | grep -v ".expo" | grep -v ".git"';
const filePaths = execSync(findCommand).toString().trim().split('\n');

console.log(`Tìm thấy ${filePaths.length} file cần cập nhật.`);

// Đếm số lượng file và đường dẫn đã cập nhật
let updatedFiles = 0;
let updatedPaths = 0;

// Cập nhật từng file
filePaths.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // Áp dụng các ánh xạ đường dẫn
    pathMappings.forEach(mapping => {
      content = content.replace(mapping.from, mapping.to);
    });
    
    // Sửa các import đến ThemedText, ThemedView trong các components
    if (filePath.includes('components')) {
      content = content.replace(/from\s+['"]@\/components\/ThemedText['"]/g, 'from \'@/components/ui/shared/ThemedText\'');
      content = content.replace(/from\s+['"]@\/components\/ThemedView['"]/g, 'from \'@/components/ui/shared/ThemedView\'');
      content = content.replace(/from\s+['"]@\/src\/components\/ThemedText['"]/g, 'from \'@/components/ui/shared/ThemedText\'');
      content = content.replace(/from\s+['"]@\/src\/components\/ThemedView['"]/g, 'from \'@/components/ui/shared/ThemedView\'');
    }
    
    // Fix các import paths trong app directory
    if (filePath.startsWith('./app/')) {
      content = content.replace(/from\s+['"]\.\/(context\/.*)['"]/g, 'from \'@/context/$1\'');
      content = content.replace(/from\s+['"]\.\/(services\/.*)['"]/g, 'from \'@/services/$1\'');
      content = content.replace(/from\s+['"]\.\/(config\/.*)['"]/g, 'from \'@/config/$1\'');
      content = content.replace(/from\s+['"]\.\/(models\/.*)['"]/g, 'from \'@/models/$1\'');
      content = content.replace(/from\s+['"]\.\.\/context\/.*['"]/g, 'from \'@/context/AuthContext\'');
      content = content.replace(/from\s+['"]\.\.\/services\/.*['"]/g, 'from \'@/services/AuthService\'');
      content = content.replace(/from\s+['"]\.\.\/config\/.*['"]/g, 'from \'@/config/api\'');
      content = content.replace(/from\s+['"]\.\.\/models\/.*['"]/g, 'from \'@/models/User\'');
    }
    
    // Nếu nội dung đã thay đổi, ghi lại file
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      updatedFiles++;
      
      // Đếm số lượng đường dẫn đã cập nhật trong file
      const matchCount = (content.match(/from '@\//g) || []).length;
      updatedPaths += matchCount;
      
      console.log(`Đã cập nhật ${filePath} (${matchCount} đường dẫn)`);
    }
  } catch (error) {
    console.error(`Lỗi khi xử lý file ${filePath}:`, error);
  }
});

console.log(`\nHoàn tất! Đã cập nhật ${updatedPaths} đường dẫn trong ${updatedFiles} file.`);
console.log('Lưu ý: Bạn cần kiểm tra lại các đường dẫn import để đảm bảo hoạt động đúng.'); 