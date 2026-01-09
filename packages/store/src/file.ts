import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DEFAULT_JSON_STATE } from './defaults/json.js';
import { DEFAULT_HTML_CONTENT } from './defaults/html.js';

export type ContentFormat = 'json' | 'html';

export interface StoreContent {
  json: string;
  html: string;
}

// Store files in a fixed location within the store package directory
// This makes it easy to clean up and ensures consistency across different execution contexts
const getStoreDir = () => {
  // Get the directory where this file is located (packages/store/src)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  
  // Go up one level from src/ to get packages/store/
  const storePackageDir = resolve(__dirname, '..');
  
  // Store files in packages/store/.store
  return join(storePackageDir, '.store');
};

const getFilePath = (demoType: string, format: ContentFormat): string => {
  const dir = getStoreDir();
  return join(dir, `${demoType}.${format}.json`);
};

class FileStore {
  private delay: number;
  private cache: Map<string, StoreContent> = new Map();

  constructor(delay = 0) {
    this.delay = delay;
  }

  private async ensureDir(): Promise<void> {
    const dir = getStoreDir();
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  private async simulateDelay(): Promise<void> {
    if (this.delay > 0) {
      return new Promise(resolve => setTimeout(resolve, this.delay));
    }
  }

  private async loadFromFile(demoType: string): Promise<StoreContent | null> {
    try {
      await this.ensureDir();
      const jsonPath = getFilePath(demoType, 'json');
      const htmlPath = getFilePath(demoType, 'html');
      
      const [jsonContent, htmlContent] = await Promise.all([
        existsSync(jsonPath) ? readFile(jsonPath, 'utf-8') : null,
        existsSync(htmlPath) ? readFile(htmlPath, 'utf-8') : null,
      ]);

      if (jsonContent || htmlContent) {
        return {
          json: jsonContent || JSON.stringify(DEFAULT_JSON_STATE),
          html: htmlContent || DEFAULT_HTML_CONTENT,
        };
      }
      return null;
    } catch (error) {
      console.error(`[FileStore] Error loading from file for ${demoType}:`, error);
      return null;
    }
  }

  private async saveToFile(demoType: string, content: StoreContent): Promise<void> {
    try {
      await this.ensureDir();
      const jsonPath = getFilePath(demoType, 'json');
      const htmlPath = getFilePath(demoType, 'html');
      
      await Promise.all([
        writeFile(jsonPath, content.json, 'utf-8'),
        writeFile(htmlPath, content.html, 'utf-8'),
      ]);
    } catch (error) {
      console.error(`[FileStore] Error saving to file for ${demoType}:`, error);
      throw error;
    }
  }

  private async getContent(demoType: string): Promise<StoreContent> {
    // Check cache first
    if (this.cache.has(demoType)) {
      return this.cache.get(demoType)!;
    }

    // Try to load from file
    const fileContent = await this.loadFromFile(demoType);
    if (fileContent) {
      this.cache.set(demoType, fileContent);
      return fileContent;
    }

    // Return defaults
    const defaults: StoreContent = {
      json: JSON.stringify(DEFAULT_JSON_STATE),
      html: DEFAULT_HTML_CONTENT,
    };
    this.cache.set(demoType, defaults);
    return defaults;
  }

  async get(demoTypeOrFormat?: string, format?: ContentFormat): Promise<string> {
    await this.simulateDelay();
    
    // Backward compatibility: if first arg is 'json' or 'html', treat it as format
    let demoType: string;
    let actualFormat: ContentFormat;
    
    if (demoTypeOrFormat === 'json' || demoTypeOrFormat === 'html') {
      demoType = 'default';
      actualFormat = demoTypeOrFormat as ContentFormat;
    } else {
      demoType = demoTypeOrFormat || 'default';
      actualFormat = format || 'json';
    }
    
    const content = await this.getContent(demoType);
    return content[actualFormat] || '';
  }

  async set(content: string, demoTypeOrFormat?: string, format?: ContentFormat): Promise<void> {
    await this.simulateDelay();
    
    // Backward compatibility: if second arg is 'json' or 'html', treat it as format
    let demoType: string;
    let actualFormat: ContentFormat;
    
    if (demoTypeOrFormat === 'json' || demoTypeOrFormat === 'html') {
      demoType = 'default';
      actualFormat = demoTypeOrFormat as ContentFormat;
    } else {
      demoType = demoTypeOrFormat || 'default';
      actualFormat = format || 'json';
    }
    
    const storeContent = await this.getContent(demoType);
    storeContent[actualFormat] = content;
    
    // Update cache
    this.cache.set(demoType, storeContent);
    
    // Save to file
    await this.saveToFile(demoType, storeContent);
  }

  async getAll(demoType = 'default'): Promise<StoreContent> {
    await this.simulateDelay();
    return { ...await this.getContent(demoType) };
  }

  async setAll(content: StoreContent, demoType = 'default'): Promise<void> {
    await this.simulateDelay();
    this.cache.set(demoType, { ...content });
    await this.saveToFile(demoType, content);
  }

  async reset(demoType = 'default', format?: ContentFormat): Promise<void> {
    await this.simulateDelay();
    
    const storeContent = await this.getContent(demoType);
    
    if (format) {
      storeContent[format] = format === 'json' 
        ? JSON.stringify(DEFAULT_JSON_STATE)
        : DEFAULT_HTML_CONTENT;
    } else {
      storeContent.json = JSON.stringify(DEFAULT_JSON_STATE);
      storeContent.html = DEFAULT_HTML_CONTENT;
    }
    
    this.cache.set(demoType, storeContent);
    await this.saveToFile(demoType, storeContent);
  }
}

export const fileStore = new FileStore();
export default FileStore;
