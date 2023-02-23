export class Store {
  private static instance: Store;
  private store: Map<string, Set<string>>;

  private constructor() {
    this.store = new Map();
  }

  public static getStore() {
    if (!Store.instance) {
      Store.instance = new Store();
    }

    return Store.instance;
  }

  public get(key: string): Set<string> {
    return this.store.get(key);
  }

  public set(key: string, value: string): void {
    if (this.store.has(key)) {
      this.store.get(key).add(value);
      return;
    }

    this.store.set(key, new Set([value]));
  }

  public has(key: string): boolean {
    return this.store.has(key);
  }

  public remove(value: string): void {
    this.store.forEach((set, key) => {
      if (set.has(value)) {
        set.delete(value);
        if (set.size === 0) {
          this.store.delete(key);
        }
      }
    });
  }

  public delete(key: string) {
    this.store.delete(key);
  }

  public getAll(): Map<string, Set<string>> {
    return this.store;
  }
}

const test = new Set(['1', '2', '3']);
