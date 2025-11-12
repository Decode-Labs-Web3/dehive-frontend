export interface AsyncStorageLike {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

const memory: Record<string, string> = {};

const AsyncStorage: AsyncStorageLike = {
  async getItem(key) {
    return Object.prototype.hasOwnProperty.call(memory, key)
      ? memory[key]
      : null;
  },
  async setItem(key, value) {
    memory[key] = value;
  },
  async removeItem(key) {
    delete memory[key];
  },
  async clear() {
    for (const k of Object.keys(memory)) delete memory[k];
  },
};

export default AsyncStorage;
