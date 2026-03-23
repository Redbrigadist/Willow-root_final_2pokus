interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string) => Promise<{ key: string; value: string } | null>;
      delete: (key: string) => Promise<{ key: string; deleted: boolean } | null>;
    };
  }