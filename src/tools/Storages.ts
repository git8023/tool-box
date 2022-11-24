import { Validation } from '../tools/Validation';

export interface $Storage {
  /**
   * 保存数据
   * @param key {string} 关键字
   * @param value {any} 数据
   */
  save<T>(key: string, value: T): any;

  /**
   * 获取数据
   * @param key {string} 关键字
   * @return {any} 数据
   */
  get<T>(key: string): T;

  /**
   * 删除数据
   * @param key {string} 关键字
   * @return {any} 数据
   */
  remove<T>(key: string): T;

  /**
   * 清空数据
   */
  clear(): void;
}

export class Storages {

  private static $(storage: Storage): $Storage {
    const that: $Storage = {
      save<T>(key: string, value: T) {
        const oldV = that.get(key);
        storage.setItem(key, JSON.stringify(value));
        return oldV;
      },
      get<T>(key: string): T {
        const v = storage.getItem(key);
        return Validation.isNullOrUndefined(v) ? null : JSON.parse(v as string);
      },
      remove<T>(key: string): T {
        const v = that.get<T>(key);
        storage.removeItem(key);
        return v;
      },
      clear() {
        storage.clear();
      }
    };

    return that;
  }

  /** Session Storage */
  static $session = Storages.$(sessionStorage);

  /** Local Storage */
  static $local = Storages.$(localStorage);

}
