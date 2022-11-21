import { types } from '@/types/types';

export class DataPoolKey {
  static readonly AXIOS_SERVICE = Symbol('AXIOS_SERVICE');
}

type DataPoolKeys = types.KeyOfOnly<typeof DataPoolKey>;

export class DataPool {
  private static readonly POOL = new Map<DataPoolKeys, any>();

  static get(key: DataPoolKeys) {
    return this.POOL.get(key);
  }

  static set(
    key: DataPoolKeys,
    o: any
  ) {
    this.POOL.set(key, o);
  }
}
