import Arrays from '@/tools/Arrays';
import Validation from '@/tools/Validation';
import Dates from '@/tools/Dates';

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
  OFF,
}

/**日志级别类型*/
type ILogLevel = typeof LogLevel;

// @ts-ignore
const MAX_NAME_LENGTH = Object.keys(LogLevel)
  .filter(e => isNaN(Number(e)))
  .sort((
    a,
    b
  ) => a.length - b.length)
  .pop()
  .length;

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
 * 日志颜色定义
 */
const ConsoleFontColor: Record<keyof ILogLevel, string> = {
  TRACE: '#999',
  DEBUG: '#333',
  INFO: '#40c740',
  WARN: '#8f8f00',
  ERROR: '#ac001c',
  FATAL: '#ff0000',
  OFF: 'transparent'
};

/**
 * 日志工具类
 */
export class ConsoleLogger implements ILogger {
  private static _instance: ILogger;

  /**
   * 获取单例实例
   */
  static get instance() {
    if (!ConsoleLogger._instance) {
      ConsoleLogger._instance = new ConsoleLogger();
    }
    return ConsoleLogger._instance;
  }

  level: LogLevel = LogLevel.TRACE;
  cacheSize = 200;
  enableTrace = false;
  cacheStore: Array<{ lv: LogLevel, args: any[] }> = [];

  trace = (...args: any[]) => this.log(LogLevel.TRACE, Array.from(args), true);
  debug = (...args: any[]) => this.log(LogLevel.DEBUG, Array.from(args));
  info = (...args: any[]) => this.log(LogLevel.INFO, Array.from(args));
  warn = (...args: any[]) => this.log(LogLevel.WARN, Array.from(args));
  error = (...args: any[]) => this.log(LogLevel.ERROR, Array.from(args));
  fatal = (...args: any[]) => this.log(LogLevel.FATAL, Array.from(args));

  constructor() {

    if (LogLevel.DEBUG === this.level) {
      // this.enableTrace = true;

      // @ts-ignore
      window.logs = this;

      // @ts-ignore
      this.dir = {
        LogLevel,
        ConsoleFontColor,
        filter: (lv: LogLevel) => {
          this.cacheStore
            .filter(e => e.lv === lv)
            .map(e => e.args)
            .forEach(this.print.bind(this));
        }
      };
    }

  }

  /**
   * 输出日志信息
   * @param lv 打印等级
   * @param args 参数
   * @param enableTrace 是否打印堆栈
   * @private
   */
  private log(
    lv: LogLevel,
    args: any[],
    enableTrace = false
  ) {
    if (lv < this.level)
      return;
    this.enableTrace = enableTrace;

    const lvName: keyof ILogLevel = LogLevel[lv] as any;
    const lvColor = ConsoleFontColor[lvName];

    let spCount = 0;
    Arrays.foreach(args, el => {
      const isStrParam = Validation.is(el.item, 'String');
      if (isStrParam) {
        spCount++;
      }
      return isStrParam;
    });
    const spacedLvName = lvName.padStart(MAX_NAME_LENGTH);

    const date = Dates.nowFmt('yyyy-MM-dd HH:mm:ss:S');
    const param = [
      `%c[${spacedLvName}]%c -- [${date}]:` + ' %s'.repeat(spCount),
      `padding:5px; background:${lvColor}; color:#fff; font-size:12px;`,
      `color:${lvColor}; border:0;background:transparent; font-size:14px;`,
      ...args
    ];
    this.cache(lv, param);

    this.print(param);
  }

  /**
   * 打印日志
   * @param param 参数
   * @private
   */
  private print(param: any[]) {
    // 实现简单定位
    const sp = new Error().stack!.split('\n');
    const callerTxt = sp[4] || '';
    const ema = callerTxt.match(/\((.*)\)/) || [];
    const atSrc = ema[1] || '';
    console.log(...param, atSrc);

    const isDebug = (this.level <= LogLevel.DEBUG);
    if (isDebug && this.enableTrace) {
      console.groupCollapsed('Debug Trance');
      console.trace();
      console.groupEnd();
    }
  }

  /**
   * 缓存日志
   * @param lv 日志等级
   * @param args 打印参数
   * @private
   */
  private cache(
    lv: LogLevel,
    args: any[]
  ) {
    this.cacheStore.push({
      lv,
      args
    });
    while (this.cacheStore.length > this.cacheSize) {
      this.cacheStore.pop();
    }
  }
}

export default ConsoleLogger.instance;
