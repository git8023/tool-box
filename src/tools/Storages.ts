import { Validation } from './Validation';

export interface IStorage {
  /**
   * 保存数据
   * @param key  关键字
   * @param value  数据
   */
  save<T>(key: string, value: T): any;

  /**
   * 获取数据
   * @param key  关键字
   * @return 数据
   */
  get<T>(key: string): T;

  /**
   * 删除数据
   * @param key 关键字
   * @return 数据
   */
  remove<T>(key: string): T;

  /**
   * 清空数据
   */
  clear(): void;
}

/**
 * 本地存储工具
 */
export class Storages {

  private static $(storage: Storage): IStorage {
    const that: IStorage = {
      save<T>(key: string, value: T) {
        const oldV = that.get(key);
        storage.setItem(key, JSON.stringify(value));
        return oldV;
      },
      get<T>(key: string): T {
        const v = storage.getItem(key);
        return Validation.isNil(v) ? null : JSON.parse(v as string);
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

  /** 会话级别存储 */
  static $session = Storages.$(sessionStorage);

  /** 域级别存储 */
  static $local = Storages.$(localStorage);

}
