import { expect } from 'chai';
import fs from 'fs/promises';
import path from 'path';
import copy from '../index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Получаем текущую директорию
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Пути для тестов
const srcPath = path.join(__dirname, '../src');
const distPath = path.join(__dirname, '../dist');

// Вспомогательная функция для очистки папки dist перед каждым тестом
async function clearDist() {
  try {
    await fs.rm(distPath, { recursive: true, force: true });
    await fs.mkdir(distPath);
  } catch (err) {
    console.error('Error clearing dist folder:', err);
  }
}

describe('Copy Script Tests', () => {
  beforeEach(async () => {
    await clearDist(); // Очищаем папку dist перед каждым тестом
  });

  it('should copy all files and folders recursively (depth = 0)', async () => {
    await copy([{ src: srcPath, dest: distPath, depth: 0 }]);

    const files = await fs.readdir(distPath);
    expect(files).to.include.members(['file1.txt', 'file2.txt', 'folder1', 'folder3']);
  });

  it('should copy files and folders up to depth = 1', async () => {
    await copy([{ src: srcPath, dest: distPath, depth: 1 }]);

    const files = await fs.readdir(distPath);
    expect(files).to.include.members(['file1.txt', 'file2.txt', 'folder1', 'folder3']);

    const folder1Files = await fs.readdir(path.join(distPath, 'folder1'));
    expect(folder1Files).to.include.members(['file3.txt']);
    expect(folder1Files).not.to.include('folder2'); // folder2 должна быть проигнорирована
  });

  it('should copy files and folders with height = 1', async () => {
    await copy([{ src: srcPath, dest: distPath, height: 1 }]);

    const files = await fs.readdir(distPath);
    expect(files).to.include.members(['file1.txt', 'file2.txt', 'folder1', 'folder3']);

    const folder1Files = await fs.readdir(path.join(distPath, 'folder1'));
    expect(folder1Files).to.be.empty; // Внутренние файлы и папки должны быть проигнорированы
  });

  it('should flatten the directory structure when flatten = true', async () => {
    await copy([{ src: srcPath, dest: distPath, flatten: true }]);

    const files = await fs.readdir(distPath);
    expect(files).to.include.members(['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'file5.txt']);
  });

  it('should rename files when conflictResolution = "rename"', async () => {
    // Создаём конфликт: копируем file1.txt дважды
    await copy([{ src: srcPath, dest: distPath, flatten: true, conflictResolution: 'rename' }]);
    await copy([{ src: srcPath, dest: distPath, flatten: true, conflictResolution: 'rename' }]);

    const files = await fs.readdir(distPath);
    expect(files).to.include.members(['file1.txt', 'file1_1.txt']);
  });

  it('should skip files when conflictResolution = "skip"', async () => {
    // Создаём конфликт: копируем file1.txt дважды
    await copy([{ src: srcPath, dest: distPath, flatten: true, conflictResolution: 'skip' }]);
    await copy([{ src: srcPath, dest: distPath, flatten: true, conflictResolution: 'skip' }]);

    const files = await fs.readdir(distPath);
    expect(files).to.include.members(['file1.txt']);
    expect(files).not.to.include('file1_1.txt');
  });

  it('should overwrite files when conflictResolution = "overwrite"', async () => {
    // Создаём конфликт: копируем file1.txt дважды
    await copy([{ src: srcPath, dest: distPath, flatten: true, conflictResolution: 'overwrite' }]);
    await copy([{ src: srcPath, dest: distPath, flatten: true, conflictResolution: 'overwrite' }]);

    const files = await fs.readdir(distPath);
    expect(files).to.include.members(['file1.txt']);
    expect(files).not.to.include('file1_1.txt');
  });

  it('should handle empty source directory', async () => {
    await copy([{ src: path.join(srcPath, 'emptyFolder'), dest: distPath }]);

    const files = await fs.readdir(distPath);
    expect(files).to.be.empty;
  });

  it('should handle non-existent source directory', async () => {
    try {
      await copy([{ src: path.join(srcPath, 'nonExistentFolder'), dest: distPath }]);
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });
});
