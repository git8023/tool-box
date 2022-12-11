export declare enum LogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5,
    OFF = 6
}
/**
 * 日志记录接口
 */
export interface ILogger {
    /**
     * 日志等级
     *
     * 屏蔽当前等级以下的日志:
     *
     * TRACE > DEBUG > INFO > WARN > ERROR > FATAL
     *
     * 默认: DEBUG
     */
    level: LogLevel;
    /**
     * 消息缓存数量
     *
     * 默认: 200
     */
    cacheSize: number;
    /**
     * 是否打印调用堆栈
     *
     * 默认: false, level==LogLevel.DEBUG 时默认true
     */
    enableTrace: boolean;
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    fatal(...args: any[]): void;
}
/**
 * 日志工具类
 */
export declare class ConsoleLogger implements ILogger {
    private static _instance;
    /**
     * 获取单例实例
     */
    static get instance(): ILogger;
    level: LogLevel;
    cacheSize: number;
    enableTrace: boolean;
    cacheStore: Array<{
        lv: LogLevel;
        args: any[];
    }>;
    trace: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    fatal: (...args: any[]) => void;
    constructor();
    /**
     * 输出日志信息
     * @param lv 打印等级
     * @param args 参数
     * @param enableTrace 是否打印堆栈
     * @private
     */
    private log;
    /**
     * 打印日志
     * @param param 参数
     * @private
     */
    private print;
    /**
     * 缓存日志
     * @param lv 日志等级
     * @param args 打印参数
     * @private
     */
    private cache;
}
export declare const Logs: ILogger;
