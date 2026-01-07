import { DEFAULT_JSON_STATE } from './defaults/json.js';
import { DEFAULT_HTML_CONTENT } from './defaults/html.js';

export type ContentFormat = 'json' | 'html';

export interface StoreContent {
  json: string;
  html: string;
}

class MemoryStore {
  private content: Record<string, StoreContent>;
  private delay: number;

  constructor(delay = 300) {
    this.delay = delay;
    this.content = {};
  }

  private ensureDemoType(demoType: string): void {
    if (!this.content[demoType]) {
      this.content[demoType] = {
        json: JSON.stringify(DEFAULT_JSON_STATE),
        html: DEFAULT_HTML_CONTENT
      };
    }
  }

  // Type guard to ensure content exists after ensureDemoType
  private getContent(demoType: string): StoreContent {
    this.ensureDemoType(demoType);
    const content = this.content[demoType];
    if (!content) {
      // This should never happen after ensureDemoType, but satisfies TypeScript
      throw new Error(`Content for demoType "${demoType}" should exist`);
    }
    return content;
  }

  // Get content in specific format for a demo type
  // Supports both new API: get(demoType, format) and old API: get(format)
  async get(demoTypeOrFormat?: string, format?: ContentFormat): Promise<string> {
    await this.simulateDelay();
    
    // Backward compatibility: if first arg is 'json' or 'html', treat it as format
    let demoType: string;
    let actualFormat: ContentFormat;
    
    if (demoTypeOrFormat === 'json' || demoTypeOrFormat === 'html') {
      // Old API: get(format)
      demoType = 'default';
      actualFormat = demoTypeOrFormat as ContentFormat;
    } else {
      // New API: get(demoType, format)
      demoType = demoTypeOrFormat || 'default';
      actualFormat = format || 'json';
    }
    
    const content = this.getContent(demoType);
    return content[actualFormat] || '';
  }

  // Set content in specific format for a demo type
  // Supports both new API: set(content, demoType, format) and old API: set(content, format)
  async set(content: string, demoTypeOrFormat?: string, format?: ContentFormat): Promise<void> {
    await this.simulateDelay();
    
    // Backward compatibility: if second arg is 'json' or 'html', treat it as format
    let demoType: string;
    let actualFormat: ContentFormat;
    
    if (demoTypeOrFormat === 'json' || demoTypeOrFormat === 'html') {
      // Old API: set(content, format)
      demoType = 'default';
      actualFormat = demoTypeOrFormat as ContentFormat;
    } else {
      // New API: set(content, demoType, format)
      demoType = demoTypeOrFormat || 'default';
      actualFormat = format || 'json';
    }
    
    const storeContent = this.getContent(demoType);
    storeContent[actualFormat] = content;
  }

  // Get both formats at once for a demo type (useful for testing)
  async getAll(demoType = 'default'): Promise<StoreContent> {
    await this.simulateDelay();
    return { ...this.getContent(demoType) };
  }

  // Set both formats at once for a demo type
  async setAll(content: StoreContent, demoType = 'default'): Promise<void> {
    await this.simulateDelay();
    this.content[demoType] = { ...content };
  }

  // Reset to defaults for a demo type
  async reset(demoType = 'default', format?: ContentFormat): Promise<void> {
    await this.simulateDelay();
    
    if (format) {
      const storeContent = this.getContent(demoType);
      storeContent[format] = format === 'json' 
        ? JSON.stringify(DEFAULT_JSON_STATE)
        : DEFAULT_HTML_CONTENT;
    } else {
      // Reset both
      this.content[demoType] = {
        json: JSON.stringify(DEFAULT_JSON_STATE),
        html: DEFAULT_HTML_CONTENT
      };
    }
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  setDelay(ms: number): void {
    this.delay = ms;
  }
}

export const memoryStore = new MemoryStore();
export default MemoryStore;