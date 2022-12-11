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
export declare class Storages {
    private static $;
    /** 会话级别存储 */
    static $session: IStorage;
    /** 域级别存储 */
    static $local: IStorage;
}
