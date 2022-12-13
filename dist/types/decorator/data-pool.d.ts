import { types } from '../types/types';
import { fns } from '../types/fns';
import { vo } from '../types/vo';
export declare class DataPoolKey {
    static readonly AXIOS_SERVICE: unique symbol;
    static readonly AXIOS_EXTRACT_RESPONSE: unique symbol;
}
declare type DataPoolKeys = types.KeyOfOnly<typeof DataPoolKey>;
declare type AxiosInstance = any;
export declare class DataPool {
    private static readonly POOL;
    /**
     * 获取配置
     * @param key 配置项
     */
    static get(key: DataPoolKeys): any;
    /**
     * 设置Axios实例
     * @param key AXIOS_SERVICE
     * @param axiosInstance 实例对象
     */
    static set(key: 'AXIOS_SERVICE', axiosInstance: AxiosInstance): typeof DataPool;
    /**
     * 设置AxiosResponse数据前置处理
     * @param key AXIOS_EXTRACT_RESPONSE
     * @param handle 处理逻辑
     */
    static set<T>(key: 'AXIOS_EXTRACT_RESPONSE', handle: fns.Handler<vo.AxiosResponse, T>): typeof DataPool;
}
export {};
