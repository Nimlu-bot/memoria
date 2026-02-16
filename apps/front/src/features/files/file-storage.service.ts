import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface FileInfo {
  name: string;
  path: string;
  size?: number;
  type?: string;
  lastModified?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  private readonly dbName = 'memoria-files';

  constructor() {}

  /**
   * Save a file to storage
   */
  async saveFile(
    filename: string,
    content: string,
    directory: 'documents' | 'cache' = 'documents',
  ): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.saveFileNative(filename, content, directory);
    } else {
      await this.saveFileWeb(filename, content);
    }
  }

  /**
   * Read a file from storage
   */
  async readFile(
    filename: string,
    directory: 'documents' | 'cache' = 'documents',
  ): Promise<string> {
    if (Capacitor.isNativePlatform()) {
      return this.readFileNative(filename, directory);
    } else {
      return this.readFileWeb(filename);
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(
    filename: string,
    directory: 'documents' | 'cache' = 'documents',
  ): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.deleteFileNative(filename, directory);
    } else {
      await this.deleteFileWeb(filename);
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(directory: 'documents' | 'cache' = 'documents'): Promise<FileInfo[]> {
    if (Capacitor.isNativePlatform()) {
      return this.listFilesNative(directory);
    } else {
      return this.listFilesWeb();
    }
  }

  /**
   * Clear all files from storage
   */
  async clearStorage(directory: 'documents' | 'cache' = 'documents'): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.clearStorageNative(directory);
    } else {
      await this.clearStorageWeb();
    }
  }

  // ============ Native Implementation ============

  private async saveFileNative(
    filename: string,
    content: string,
    directory: 'documents' | 'cache',
  ): Promise<void> {
    try {
      const dir = directory === 'cache' ? Directory.Cache : Directory.Documents;
      await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: dir,
        encoding: Encoding.UTF8,
      });
      console.log(`✅ File saved: ${filename}`);
    } catch (error) {
      console.error(`Failed to save file ${filename}:`, error);
      throw error;
    }
  }

  private async readFileNative(
    filename: string,
    directory: 'documents' | 'cache',
  ): Promise<string> {
    try {
      const dir = directory === 'cache' ? Directory.Cache : Directory.Documents;
      const result = await Filesystem.readFile({
        path: filename,
        directory: dir,
        encoding: Encoding.UTF8,
      });
      return typeof result.data === 'string' ? result.data : '';
    } catch (error) {
      console.error(`Failed to read file ${filename}:`, error);
      throw error;
    }
  }

  private async deleteFileNative(
    filename: string,
    directory: 'documents' | 'cache',
  ): Promise<void> {
    try {
      const dir = directory === 'cache' ? Directory.Cache : Directory.Documents;
      await Filesystem.deleteFile({
        path: filename,
        directory: dir,
      });
      console.log(`✅ File deleted: ${filename}`);
    } catch (error) {
      console.error(`Failed to delete file ${filename}:`, error);
      throw error;
    }
  }

  private async listFilesNative(directory: 'documents' | 'cache'): Promise<FileInfo[]> {
    try {
      const dir = directory === 'cache' ? Directory.Cache : Directory.Documents;
      const result = await Filesystem.readdir({
        path: '',
        directory: dir,
      });

      return result.files.map((file) => ({
        name: file.name,
        path: file.name,
        type: file.type,
      }));
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  private async clearStorageNative(directory: 'documents' | 'cache'): Promise<void> {
    try {
      const files = await this.listFilesNative(directory);
      for (const file of files) {
        await this.deleteFileNative(file.name, directory);
      }
      console.log(`✅ Storage cleared: ${directory}`);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  // ============ Web Implementation (IndexedDB) ============

  private getDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'name' });
        }
      };
    });
  }

  private async saveFileWeb(filename: string, content: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');

      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          name: filename,
          data: content,
          timestamp: Date.now(),
        });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      console.log(`✅ File saved (web): ${filename}`);
    } catch (error) {
      console.error(`Failed to save file ${filename}:`, error);
      throw error;
    }
  }

  private async readFileWeb(filename: string): Promise<string> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');

      return new Promise<string>((resolve, reject) => {
        const request = store.get(filename);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result as any;
          resolve(result?.data || '');
        };
      });
    } catch (error) {
      console.error(`Failed to read file ${filename}:`, error);
      throw error;
    }
  }

  private async deleteFileWeb(filename: string): Promise<void> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(filename);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      console.log(`✅ File deleted (web): ${filename}`);
    } catch (error) {
      console.error(`Failed to delete file ${filename}:`, error);
      throw error;
    }
  }

  private async listFilesWeb(): Promise<FileInfo[]> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');

      return new Promise<FileInfo[]>((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const files = request.result as any[];
          resolve(
            files.map((file) => ({
              name: file.name,
              path: file.name,
              size: new Blob([file.data]).size,
              lastModified: file.timestamp,
            })),
          );
        };
      });
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  private async clearStorageWeb(): Promise<void> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');

      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      console.log('✅ Storage cleared (web)');
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }
}
