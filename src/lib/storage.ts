/** Tiny key/value abstraction so sync + feedback logic can be tested without the browser. */
export interface KV {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

export const browserKV: KV = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage full / private mode — ignore */
    }
  },
  remove(k) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};

export class MemoryKV implements KV {
  private m = new Map<string, string>();
  get(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  set(k: string, v: string) {
    this.m.set(k, v);
  }
  remove(k: string) {
    this.m.delete(k);
  }
}
