import { DEFAULT_JSON_STATE } from './defaults/json.js';
import { DEFAULT_HTML_CONTENT } from './defaults/html.js';

export type ContentFormat = 'json' | 'html';

export interface StoreContent {
  json: string;
  html: string;
}

class MemoryStore {
  private content: StoreContent;
  private delay: number;

  constructor(delay = 300) {
    this.delay = delay;
    this.content = {
      json: JSON.stringify(DEFAULT_JSON_STATE),
      html: DEFAULT_HTML_CONTENT
    };
  }

  // Get content in specific format
  async get(format: ContentFormat = 'json'): Promise<string> {
    await this.simulateDelay();
    return this.content[format];
  }

  // Set content in specific format
  async set(content: string, format: ContentFormat = 'json'): Promise<void> {
    await this.simulateDelay();
    this.content[format] = content;
  }

  // Get both formats at once (useful for testing)
  async getAll(): Promise<StoreContent> {
    await this.simulateDelay();
    return { ...this.content };
  }

  // Set both formats at once
  async setAll(content: StoreContent): Promise<void> {
    await this.simulateDelay();
    this.content = { ...content };
  }

  // Reset to defaults
  async reset(format?: ContentFormat): Promise<void> {
    await this.simulateDelay();
    
    if (format) {
      this.content[format] = format === 'json' 
        ? JSON.stringify(DEFAULT_JSON_STATE)
        : DEFAULT_HTML_CONTENT;
    } else {
      // Reset both
      this.content = {
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