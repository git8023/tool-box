import { types } from '../types/types';
import { fns } from '../types/fns';
import { vo } from '../types/vo';

export class DataPoolKey {
  static readonly AXIOS_SERVICE = Symbol('AXIOS_SERVICE');
  static readonly AXIOS_EXTRACT_RESPONSE = Symbol('AXIOS_EXTRACT_RESPONSE');
}

type DataPoolKeys = types.KeyOfOnly<typeof DataPoolKey>;
type AxiosInstance = any;

export class DataPool {
  private static readonly POOL = new Map<DataPoolKeys, any>();

  /**
   * 获取配置
   * @param key 配置项
   */
  static get(key: DataPoolKeys) {
    return this.POOL.get(key);
  }

  /**
   * 设置Axios实例
   * @param key AXIOS_SERVICE
   * @param axiosInstance 实例对象
   */
  static set(
    key: 'AXIOS_SERVICE',
    axiosInstance: AxiosInstance
  ): typeof DataPool;

  /**
   * 设置AxiosResponse数据前置处理
   * @param key AXIOS_EXTRACT_RESPONSE
   * @param handle 处理逻辑
   */
  static set<T>(
    key: 'AXIOS_EXTRACT_RESPONSE',
    handle: fns.Handler<vo.AxiosResponse, T>
  ): typeof DataPool;

  /**
   * 设置配置
   * @param key 配置项
   * @param o 配置值
   */
  static set(
    key: DataPoolKeys,
    o: any
  ): typeof DataPool {
    this.POOL.set(key, o);
    return this;
  }
}
