export declare class Cast {
    /**
     * undefined 初始化为任意类型
     */
    static get nil(): any;
    /**
     * [] as any[]
     */
    static get anyA(): any[];
    /**
     * Object() as any
     */
    static get anyO(): any;
    /**
     * 指定对象转换为目标类型
     * @param [o=Object()] 对象
     * @return 目标类型
     */
    static as<T>(o?: any): T;
    /**
     * 包装为错误对象
     * @param err 错误消息或错误对象
     */
    static error(err?: string | Error): Error;
}
