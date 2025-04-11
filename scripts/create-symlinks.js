#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Các thư mục nguồn cần tạo symlink
const sourceTargetMap = [
  { src: 'src/components', target: 'components' },
  { src: 'src/context', target: 'context' },
  { src: 'src/hooks', target: 'hooks' },
  { src: 'src/constants', target: 'constants' },
  { src: 'src/services', target: 'services' },
  { src: 'src/models', target: 'models' },
  { src: 'src/utils', target: 'utils' },
  { src: 'src/styles', target: 'styles' },
  { src: 'src/config', target: 'config' }
];

// Tạo symlinks
console.log('Đang tạo các symlinks...');

sourceTargetMap.forEach(({ src, target }) => {
  const sourcePath = path.resolve(process.cwd(), src);
  const targetPath = path.resolve(process.cwd(), target);
  
  // Nếu thư mục nguồn không tồn tại, hãy tạo nó
  if (!fs.existsSync(sourcePath)) {
    console.log(`Tạo thư mục nguồn ${sourcePath}...`);
    fs.mkdirSync(sourcePath, { recursive: true });
  }
  
  // Nếu symlink đã tồn tại, xóa nó trước
  if (fs.existsSync(targetPath)) {
    try {
      const stats = fs.lstatSync(targetPath);
      if (stats.isSymbolicLink()) {
        console.log(`Xóa symlink cũ ${targetPath}...`);
        fs.unlinkSync(targetPath);
      } else if (stats.isDirectory()) {
        // Nếu là thư mục, di chuyển nội dung vào thư mục nguồn và xóa nó
        console.log(`Di chuyển nội dung của ${targetPath} vào ${sourcePath}...`);
        try {
          execSync(`cp -rf ${targetPath}/* ${sourcePath}/ 2>/dev/null || :`, { stdio: 'inherit' });
          execSync(`rm -rf ${targetPath}`, { stdio: 'inherit' });
        } catch (error) {
          console.error(`Lỗi khi di chuyển dữ liệu từ ${targetPath} vào ${sourcePath}:`, error);
        }
      }
    } catch (error) {
      console.error(`Lỗi khi kiểm tra ${targetPath}:`, error);
    }
  }
  
  // Tạo symlink
  try {
    console.log(`Tạo symlink từ ${sourcePath} đến ${targetPath}...`);
    fs.symlinkSync(sourcePath, targetPath, 'dir');
  } catch (error) {
    console.error(`Lỗi khi tạo symlink từ ${sourcePath} đến ${targetPath}:`, error);
  }
});

console.log('\nHoàn tất! Đã tạo các symlinks để hỗ trợ cấu trúc thư mục mới.'); 