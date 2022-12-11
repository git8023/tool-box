export declare class BError extends Error {
    constructor(e: string | Error);
    /**
     * 包装为错误对象
     * @param e 错误信息或错误对象
     */
    static from(e: any): Error;
    /**
     * 判断一个对象是否为Error实例
     * @param e 目标对象
     */
    static isError(e: any): boolean;
    /**
     * 如果条件为false, 抛出异常
     * @param c 条件
     * @param [msg] 错误消息
     * @throws 条件为假时
     */
    static readonly iff: (c: boolean, msg: string) => void;
    /**
     * 抛出异常
     * @param [e] 错误消息或错误对象
     */
    static readonly throwError: (e?: string | Error) => never;
}
