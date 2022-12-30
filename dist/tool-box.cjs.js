'use strict';

var vueClassComponent = require('vue-class-component');
var vuexClass = require('vuex-class');

class Cast {
    /**
     * undefined 初始化为任意类型
     */
    static get nil() {
        return undefined;
    }
    /**
     * [] as any[]
     */
    static get anyA() {
        return [];
    }
    /**
     * Object() as any
     */
    static get anyO() {
        return this.as();
    }
    /**
     * 指定对象转换为目标类型
     * @param [o] 对象
     * @return 目标类型
     */
    static as(o = {}) {
        return o;
    }
    /**
     * 包装为错误对象
     * @param err 错误消息或错误对象
     */
    static error(err) {
        if (err instanceof Error) {
            return err;
        }
        else if (typeof err === 'string') {
            return Error(err);
        }
        else {
            return Error('undefined');
        }
    }
    /**
     * 对象安全代理，防止出现在 undefined 目标上获取属性
     * @param o 目标对象
     * @param [dv] 目标对象为nil时代替目标对象成为被代理对象
     * @param [settable=true] 是否允许执行setter
     * @return 代理对象
     */
    static asSafety(o, dv = {}, settable = true) {
        return new Proxy(o ?? Cast.as(dv), {
            set() {
                return settable;
            }
        });
    }
}

class Dates {
    /**
     * 解析日期字符串或格式化为另一种日期规则字符串
     * @param dateStr 源日期字符串
     * @param inFmt 源日期字符串格式
     * @param [outFmt=undefined] 输出日期字符串格式
     * @return 当指定outFmt时输出日期字符串, 否则返回日期对象
     */
    static datePoF(dateStr, inFmt, outFmt) {
        const d = this.dateParse(dateStr, inFmt);
        // @ts-ignore
        if (d && validators.is(outFmt, 'String') && outFmt.trim().length) {
            return this.dateFmt(d, outFmt);
        }
        return d;
    }
    /**
     * 解析日期字符串
     * @param dateStr 源日期字符串
     * @param pattern 解析规则(yMDHmsS)
     * @return {Date | null} 解析成功返回日期对象, 否则返回null
     */
    static dateParse(dateStr, pattern) {
        const metaPatterns = {
            /**
             * 元规则决策表, 每项决策中会新增三个属性:
             */
            metas: {
                /** 年规则 */
                y: {
                    name: 'Year',
                    setYear: function (date) {
                        date.setFullYear(this.original || 0);
                    }
                },
                /** 月规则 */
                M: {
                    name: 'Month',
                    setMonth: function (date) {
                        date.setMonth(isNaN(this.original) ? 0 : (this.original - 1));
                    }
                },
                /** 月中的天数规则 */
                d: {
                    name: 'Day',
                    setDay: function (date) {
                        date.setDate(this.original || 0);
                    }
                },
                /** 小时规则 */
                H: {
                    name: 'Hour',
                    setHour: function (date) {
                        date.setHours(this.original || 0);
                    }
                },
                /** 分钟规则 */
                m: {
                    name: 'Minute',
                    setMinute: function (date) {
                        date.setMinutes(this.original || 0);
                    }
                },
                /** 秒规则 */
                s: {
                    name: 'Second',
                    setSecond: function (date) {
                        date.setSeconds(this.original || 0);
                    }
                },
                /** 毫秒规则 */
                S: {
                    name: 'Millisecond',
                    setMillisecond: function (date) {
                        date.setMilliseconds(this.original || 0);
                    }
                }
            },
            /**
             * 设值
             * @param date {Date|*} 目标日期
             * @returns {Date} 修改后日期
             */
            setValues: function (date) {
                this.metas.y.setYear(date);
                this.metas.M.setMonth(date);
                this.metas.d.setDay(date);
                this.metas.H.setHour(date);
                this.metas.m.setMinute(date);
                this.metas.s.setSecond(date);
                this.metas.S.setMillisecond(date);
                return date;
            },
            /**
             * 校验器
             * @param originDateStr 日期字符串
             * @param tgtPattern 解析规则
             * @returns true-解析成功, false-规则不能匹配日期字符串
             */
            validate: function (originDateStr, tgtPattern) {
                const NUMBER_PATTERN = '\\d';
                const MX_PATTERN = '\\d+';
                let replacedPattern = (tgtPattern || '') + '';
                if (!replacedPattern)
                    return false;
                // 记录当前所能支持的所有元字符
                const metasStr = [];
                Jsons.foreach(this.metas, el => {
                    metasStr.push(el.index);
                });
                // 替换pattern中年月日时分秒的字符为\d
                replacedPattern = replacedPattern.replace(/\//g, '\\/');
                Arrays.foreach(metasStr, el => {
                    replacedPattern = replacedPattern.replace(eval(`(/${el.item}/g)`), 'S' === el.item ? MX_PATTERN : NUMBER_PATTERN);
                });
                replacedPattern = replacedPattern.replace(/\\\\/g, '\\').replace(/\//g, '/');
                // 使用替换后的pattern校验dateStr是否有效
                const result = eval('(/^' + replacedPattern + '$/)').test(originDateStr);
                if (result) {
                    const _this = this;
                    // 校验通过, 按顺序设置元规则开始索引和值
                    // > 按元规则分组
                    const metasGroup = metasStr.join('');
                    // /([yMdhms])\1*/g: 提取的元规则
                    const groupRegExp = eval('(/([' + metasGroup + '])\\1*/g)');
                    // 替换掉日期字符串分隔符字符
                    const onlyNumberDateStr = originDateStr.replace(/\D+/g, '');
                    // 把原pattern中的年月日时分秒解为有序的正则表达式数组,
                    let originValueIndex = 0;
                    Jsons.foreach(tgtPattern.match(groupRegExp), function (el) {
                        // :> 设置每个组的 beginIndex, pLength, original
                        const meta = _this.metas[el.item[0]];
                        meta.beginIndex = tgtPattern.indexOf(el.item);
                        meta.pLength = el.item.length;
                        if ('S' !== el.item[0]) {
                            meta.original = onlyNumberDateStr.substring(originValueIndex, (originValueIndex + meta.pLength));
                        }
                        else {
                            meta.original = onlyNumberDateStr.substring(originValueIndex);
                        }
                        originValueIndex += meta.pLength;
                    });
                }
                return result;
            }
        };
        const success = metaPatterns.validate(dateStr, pattern);
        return success ? metaPatterns.setValues(new Date()) : null;
    }
    /**
     * 日期格式化
     * @param date 日期对象或毫秒值
     * @param [format="yyyy-MM-dd HH:mm:ss"] 格式化规则, 默认: yyyy-MM-dd HH:mm:ss
     * @return成功返回日期字符串, 否则返回undefined
     */
    static dateFmt(date, format) {
        function formatter(format) {
            // @ts-ignore
            const $this = this;
            format = (format || 'yyyy-MM-dd HH:mm:ss');
            const time = $this.getTime();
            if (isNaN(time)) {
                return;
            }
            const o = {
                'M+': $this.getMonth() + 1,
                'd+': $this.getDate(),
                'H+': $this.getHours(),
                'm+': $this.getMinutes(),
                's+': $this.getSeconds(),
                'q+': Math.floor(($this.getMonth() + 3) / 3),
                S: $this.getMilliseconds()
            };
            if (/(y+)/.test(format))
                format = format.replace(RegExp.$1, ($this.getFullYear() + '').substr(4 - RegExp.$1.length));
            for (const k in o) {
                if (new RegExp('(' + k + ')').test(format)) {
                    if (RegExp.$1.length === 1) {
                        format = format.replace(RegExp.$1, o[k].toString());
                    }
                    else {
                        format = format.replace(RegExp.$1, ('00' + o[k]).substr(o[k].toString().length));
                    }
                }
            }
            return format;
        }
        if (Validation.isNullOrUndefined(date))
            return '';
        if (Validation.is(date, 'Number'))
            date = new Date(date);
        else if (Validation.is(date, 'String'))
            date = new Date(date);
        if (Validation.isNot(date, 'Date'))
            throw new Error('Error Type: Parameters \'date\' must be a Date type');
        // @ts-ignore
        return formatter.call(date, format);
    }
    /**
     * 比较两个日期
     * @param d1 第一个日期
     * @param [d2=now]  第二个日期
     * @return {number} 正数:d1>d2, 0:d1=d2, 负数:d1<d2, NaN:d1无效
     */
    static dateDiff(d1, d2 = new Date()) {
        if (Validation.isNot(d1, 'Date') && Validation.isNot(d2, 'Date'))
            return NaN;
        return (d1.getTime() - d2.getTime());
    }
    /**
     * 格式化输出当前时间
     * @param format 日期格式
     * @return 日期格式字符串
     */
    static nowFmt(format) {
        return this.dateFmt(new Date(), format);
    }
}

exports.LogLevel = void 0;
(function (LogLevel) {
    LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 5] = "FATAL";
    LogLevel[LogLevel["OFF"] = 6] = "OFF";
})(exports.LogLevel || (exports.LogLevel = {}));
// @ts-ignore
const MAX_NAME_LENGTH = Object.keys(exports.LogLevel)
    .filter(e => isNaN(Number(e)))
    .sort((a, b) => a.length - b.length)
    .pop()
    .length;
/**
 * 日志颜色定义
 */
const ConsoleFontColor = {
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
class ConsoleLogger {
    static _instance;
    /**
     * 获取单例实例
     */
    static get instance() {
        if (!ConsoleLogger._instance) {
            ConsoleLogger._instance = new ConsoleLogger();
        }
        return ConsoleLogger._instance;
    }
    level = exports.LogLevel.TRACE;
    cacheSize = 200;
    enableTrace = false;
    cacheStore = [];
    trace = (...args) => this.log(exports.LogLevel.TRACE, Array.from(args), true);
    debug = (...args) => this.log(exports.LogLevel.DEBUG, Array.from(args));
    info = (...args) => this.log(exports.LogLevel.INFO, Array.from(args));
    warn = (...args) => this.log(exports.LogLevel.WARN, Array.from(args));
    error = (...args) => this.log(exports.LogLevel.ERROR, Array.from(args));
    fatal = (...args) => this.log(exports.LogLevel.FATAL, Array.from(args));
    constructor() {
        if (exports.LogLevel.DEBUG === this.level) {
            // this.enableTrace = true;
            // @ts-ignore
            window.logs = this;
            // @ts-ignore
            this.dir = {
                LogLevel: exports.LogLevel,
                ConsoleFontColor,
                filter: (lv) => {
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
    log(lv, args, enableTrace = false) {
        if (lv < this.level)
            return;
        this.enableTrace = enableTrace;
        const lvName = exports.LogLevel[lv];
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
    print(param) {
        // 实现简单定位
        const sp = new Error().stack.split('\n');
        const callerTxt = sp[4] || '';
        const ema = callerTxt.match(/\((.*)\)/) || [];
        const atSrc = ema[1] || '';
        console.log(...param, atSrc);
        const isDebug = (this.level <= exports.LogLevel.DEBUG);
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
    cache(lv, args) {
        this.cacheStore.push({
            lv,
            args
        });
        while (this.cacheStore.length > this.cacheSize) {
            this.cacheStore.pop();
        }
    }
}
const Logs = ConsoleLogger.instance;

class Promises {
    /**
     * 数据包装为异步
     * @param data 目标数据
     */
    static from(data) {
        return Promise.resolve(data);
    }
    /**
     * 包装数据或数据获取器
     * @param og 数据或数据获取器
     */
    static of(og) {
        if (Validation.isFunction(og))
            return new Promise((resolve, reject) => {
                try {
                    const data = Functions.call(og);
                    resolve(data);
                }
                catch (e) {
                    reject(e);
                }
            });
        return this.from(og);
    }
    /**
     * 增强原生Promise功能
     * @param src 原始Promise
     */
    static control(src) {
        const control = Cast.as();
        const promise = Promise.race([
            src || Promise.resolve(undefined),
            new Promise((resolve, reject) => {
                control.abort = reject;
            }).catch(() => Logs.debug('异步数据被取消!'))
        ]);
        promise.abort = () => control.abort();
        return promise;
    }
}

class Functions {
    /**
     * 调用函数
     * @param fn 函数引用，如果要指定上下文需要传递Lambda函数
     * @param [args] 参数
     * @return 函数返回值
     */
    static call(fn, ...args) {
        // return (fn && Validation.isFunction(fn)) ? Cast.as<Function>(fn).call(undefined, ...args) : undefined;
        return this.exec(fn, undefined, ...args);
    }
    /**
     * 调用函数
     * @param fn 函数引用，如果要指定上下文需要传递Lambda函数
     * @param [thisArg=undefined] 执行上下文
     * @param [args] 参数
     * @return 函数返回值
     */
    static exec(fn, thisArg, ...args) {
        return (fn && Validation.isFunction(fn)) ? Cast.as(fn).call(thisArg, ...args) : undefined;
    }
    /**
     * 执行数据获取函数
     * @param vog 数据或数据获取函数
     * @param [args] 执行参数
     */
    static execOrGetter(vog, ...args) {
        return vog instanceof Function ? Functions.call(vog, ...args) : vog;
    }
    /**
     * 执行异步获取函数
     * @param oag 数据或同步/异步数据获取函数
     * @param [args] 函数执行参数
     */
    static execOrAsyncGetter(oag, ...args) {
        if (oag instanceof Promise) {
            return oag;
        }
        const data = this.execOrGetter(oag, ...args);
        return Promises.from(data);
    }
    /**
     * 延迟执行
     * @param call 函数体
     * @param [loop=false] 是否持续执行
     * @param [lazy=0] 延迟时间(ms)
     * @param [immediate=false] 立即执行一次(异步)
     * @param [args=undefined] 执行参数
     */
    static timer(call, loop = false, lazy = 0, immediate = false, ...args) {
        if (immediate) {
            Functions.call(call, ...args);
            if (!loop) {
                return;
            }
        }
        setTimeout(() => {
            Promises.of(() => call(...args)).then(() => {
                loop && this.timer(call, loop, lazy);
            });
        }, lazy);
    }
}

class Objects {
    /**
     * 比较两个对象是否相等
     * @param src 源对象
     * @param target 目标对象
     * @param [prop] 匹配特定值。如果没有指定则比较引用是否同一个
     */
    static equals(src, target, prop) {
        if (prop) {
            const srcVal = Jsons.get(src, `${String(prop)}`);
            const tgtVal = Jsons.get(target, `${String(prop)}`);
            return srcVal === tgtVal;
        }
        return src === target;
    }
}

/**
 * 条件赋值逻辑
 */
class Switcher {
    condition;
    valueInner;
    constructor(condition, value) {
        this.condition = condition;
        this.setValue(condition, value);
    }
    /**
     * 如果上个条件为假且参数条件为真时，设置为当前值
     * @param condition 当前条件
     * @param value 值
     */
    case(condition, value) {
        if (this.condition)
            return this;
        this.setValue(condition, value);
        return this;
    }
    /**
     * 当所有条件都不满足时设置为参数值
     * @param value 默认值
     */
    otherwise(value) {
        return this.setValue(!this.condition, value);
    }
    /**
     * 当参数条件为真时抛出异常
     * @param condition 当前条件
     * @param err 错误信息
     */
    throw(condition, err) {
        if (this.condition)
            return this;
        if (condition)
            throw Cast.error(err);
        return this;
    }
    /**
     * 不匹配任意case时抛出异常. 该函数调用时机应当在获取数据之前
     * @param err 错误信息
     * @see getValue
     */
    otherwiseThrow(err) {
        return this.throw(true, err);
    }
    /**
     * 当参数条件为真时设置值，否则抛出异常
     * @param condition 当前条件
     * @param value 值
     * @param err 错误信息
     */
    broken(condition, value, err) {
        if (!this.condition)
            throw Cast.error(err);
        return this.setValue(condition, value);
    }
    getValue(handler) {
        if (Validation.isNot(handler, 'Function'))
            return this.valueInner;
        return handler(this.valueInner);
    }
    /**
     * 当前条件为真时设置指定值
     * @param condition 条件
     * @param value 指定值
     * @private
     */
    setValue(condition, value) {
        this.condition = condition ?? this.condition;
        if (this.condition)
            this.valueInner = Functions.execOrGetter(value);
        return this;
    }
}
/**
 * 条件记录器
 */
class Condition {
    c;
    negativeDesc;
    positiveDesc;
    constructor(c = true) {
        this.c = c;
    }
    // @formatter:on
    //</editor-fold>
    /**
     * 逻辑与
     * @param c 参考条件
     * @param positiveDesc 正面描述数据
     * @param negativeDesc 负面描述数据
     * @param effect 运算结果是否影响当前条件
     * @param returns 返回值类型
     */
    and(c, positiveDesc, negativeDesc, effect = true, returns = 'CHAIN') {
        return this.exec(this.c && c, positiveDesc, negativeDesc, effect, returns, c);
    }
    // @formatter:on
    //</editor-fold>
    /**
     * 逻辑或
     * @param c 参考条件
     * @param positiveDesc 正面描述数据
     * @param negativeDesc 负面描述数据
     * @param effect 运算结果是否影响当前条件
     * @param returns 返回值类型
     */
    or(c, positiveDesc, negativeDesc, effect = true, returns = 'CHAIN') {
        return this.exec(this.c || c, positiveDesc, negativeDesc, effect, returns, c);
    }
    // @formatter:on
    //</editor-fold>
    /**
     * 逻辑非
     * @param value 值
     * @param effect 运算结果是否影响当前条件
     * @param returns 返回值类型
     */
    not(positiveDesc, negativeDesc, effect = true, returns = 'CHAIN') {
        return this.exec(!this.c, positiveDesc, negativeDesc, effect, returns);
    }
    /**
     * 处理运算结果
     * @param handler 处理器
     * @return 处理器执行结果
     */
    result(handler) {
        return Functions.call(handler, this.c, this.positiveDesc, this.negativeDesc);
    }
    /**
     * 执行处理
     * @param rc 参考条件
     * @param value 值
     * @param effect 运算结果是否影响当前条件
     * @param returns 返回值类型
     * @param [paramCondition] 参数中的条件, 未指定时返回当前条件
     * @private
     */
    exec(rc, positiveDesc, negativeDesc, effect, returns, paramCondition) {
        if (rc) {
            this.positiveDesc = positiveDesc;
        }
        else {
            this.negativeDesc = negativeDesc;
        }
        this.c = effect ? rc : this.c;
        switch (returns) {
            case 'PARAMETER':
                return paramCondition ?? this.c;
            case 'CONDITION':
                return this.c;
            case 'CHAIN':
                return this;
            default:
                return this;
        }
    }
}
class Logics {
    /**
     * 构建条件赋值逻辑对象
     * @param condition 条件
     * @param value 值
     * @see Switcher
     */
    static case(condition, value) {
        return new Switcher(condition, value);
    }
    /**
     * 条件记录器
     * @param [c=true] 默认条件
     */
    static condition(c = true) {
        return new Condition(c);
    }
}

class Builders {
    /**
     * 构建返回参数值的函数
     * @example
     *
     * Builders.getterSelf(1);  // () => 1
     * Builders.getterSelf();   // (param) => param
     *
     * @param [returnValue] 返回值, 默认返回第一个参数
     * @return returnValue ?? param
     */
    static getterSelf(returnValue) {
        return ((param) => returnValue ?? param);
    }
    /**
     * 构建单个参数提取指定属性值的函数
     * @param key 属性名
     * @return (bean: I) => bean[key]
     */
    static getter(key) {
        return ((bean) => Jsons.get(bean, key.toString()));
    }
    /**
     * 构建迭代器元素属性值获取函数
     * @param [key=undefined] 元素属性名
     * @return key ? (e=>e[key]) : (e=>e)
     */
    static iteratorGetter(key) {
        const fn = (e) => {
            if (Validation.notEmpty(key))
                return Jsons.get(e.item, key.toString());
            return e.item;
        };
        return fn;
    }
    /**
     * 构建判断两个对象是否相等的函数, 其中一个对象来自返回函数第一个参数
     * @param target 匹配源对象
     * @param [prop] 匹配特定值, 如果没有指定则比较引用是否同一个
     */
    static equalsOther(target, prop) {
        return (input) => Objects.equals(input, target, prop);
    }
    /**
     * 构建判断两个对象是否相等的函数, 其中返回函数的参数是一个迭代元素对象
     * @param target 匹配源对象
     * @param [predictor=(el=>el===target)] 断言属性或断言函数
     */
    static equalsOtherElement(target, predictor) {
        return (input) => {
            if (input.item === target)
                return true;
            if (typeof predictor === 'string')
                return Objects.equals(input.item, target, predictor);
            if (Validation.isFunction(predictor)) {
                const r = Functions.call(predictor, input, target);
                return !!r;
            }
            return false;
        };
    }
    /**
     * 对象映射键
     * @param key 对象映射键或自定义返回对象映射键
     */
    static iteratorMapper(key) {
        const isSingleKey = Validation.isOr(key, 'String', 'Number');
        if (isSingleKey)
            return Builders.iteratorGetter(key);
        return key;
    }
    /**
     * 转换为数组键映射器
     * @param [akm=undefined] 数组元素属性名或数组键映射器
     * @param [mod='throw'] 当akm未定义时处理方式
     */
    static toArrayKeyMapperHandler(akm, mod = 'throw') {
        return Logics
            .case(akm instanceof Function, () => akm)
            .case(Validation.is(akm, 'String'), () => Builders.iteratorGetter(akm))
            .case(mod === 'element', () => Builders.iteratorGetter())
            .otherwiseThrow(Error('predictor无效. 仅支持String|Function'))
            .getValue();
    }
    /**
     * 构建具有固定参数的调用函数
     * @param fn 函数引用
     * @param [args] 参数
     */
    static runner(fn, ...args) {
        return Cast.as(() => fn(...args));
    }
}

class Arrays {
    /**
     * 对象数组通过指定属性名转换为JSON对象
     * @param arr 目标数组
     * @param [keyMapper] 转换接口
     * @param [recover=true] 是否允许覆盖重复值
     * @param [recursion=()=>null] 子属性递归函数, 默认不递归
     */
    static toMap(arr, keyMapper, recover = true, recursion) {
        const result = Cast.anyO;
        if (Validation.nullOrUndefined(arr, keyMapper)) {
            return result;
        }
        const handler = Builders.iteratorMapper(keyMapper);
        arr.forEach((item, index) => {
            const key = handler({ item, index });
            if (result[key] && !recover) {
                throw new Error(`不允许重复Key [${String(key)}]`);
            }
            result[key] = item;
            const children = Functions.call(recursion, item) || [];
            if (Validation.notEmpty(children)) {
                const childrenMap = Arrays.toMap(children, key, recover, recursion);
                Jsons.merge(childrenMap, result, recover);
            }
        });
        return result;
    }
    /**
     * 获取所有数组交集元素(引用或值判断)
     * @param args 二维数组
     */
    static intersectionSimple(args) {
        if (!args || !args.length || Validation.isEmpty(args)) {
            return [];
        }
        // 仅一个数组
        const first = args[0];
        if (1 === args.length) {
            return first;
        }
        // 获取最大数组长度
        args.sort((a, b) => a.length - b.length);
        const maxLenArr = args.pop() || [];
        // 使用最长的数组与其他数组取交集
        return maxLenArr.filter(el => {
            let isInclude = true;
            args.forEach(oel => {
                if (isInclude) {
                    isInclude = isInclude && oel.includes(el);
                }
            });
            return isInclude;
        });
    }
    /**
     * 获取两个数组的交集
     * @param a 数组a
     * @param b 数组b
     * @param [convertor] 可比较值值转换器
     */
    static intersection(a, b, convertor) {
        if (a === b) {
            return a;
        }
        const itemHandler = Builders.toArrayKeyMapperHandler(convertor, 'element');
        const data = [];
        if (Validation.isNot(a, 'Array') || Validation.isEmpty(a)
            || Validation.isNot(b, 'Array') || Validation.isEmpty(b)) {
            return data;
        }
        return Logics
            .case(a.length >= b.length, { src: a, other: b })
            .otherwise({ src: b, other: a })
            .getValue(({ src, other }) => {
            const result = [];
            this.foreach(src, itemA => {
                const av = itemHandler(itemA);
                this.foreach(other, itemB => {
                    const bv = itemHandler(itemB);
                    if (av === bv) {
                        result.push(itemA.item);
                    }
                });
            });
            return result;
        });
    }
    /**
     * 查找元素(或递归满足条件的数组元素属性值)
     * @param arr 数组或元素(数组)属性值
     * @param observer 值观察者. 成功true否则返回false.
     * @param recursion 递归属性提取检视器. 没有递归属性返回null否则返回需要递归的数组属性值
     * @returns 查询成功返回目标数据, 否则返回null
     */
    static seek(arr, observer, recursion) {
        let result = Cast.nil;
        Arrays.foreach(arr, (item) => {
            // 已经查询到需要的元素
            if (observer(item)) {
                result = item;
                return false;
            }
            // 检测是否需要递归查询
            const children = Functions.call(recursion, item);
            if (Validation.is(children, 'Array')) {
                result = Arrays.seek(children, observer, recursion);
                if (Validation.notEmpty(result)) {
                    return false;
                }
            }
            return true;
        });
        return result;
    }
    /**
     * 数组遍历
     * @param arr 数组
     * @param handler 迭代处理器
     * @return 原始数组
     */
    static foreach(arr, handler) {
        if (Validation.isNot(arr, 'Array')) {
            return arr;
        }
        for (let index = 0, len = arr.length; index < len; index++) {
            if (false === handler({ item: arr[index], index })) {
                break;
            }
        }
        return arr;
    }
    /**
     * 追加唯一目标值, 如果校验存在则跳过
     * @param arr 数组
     * @param el 新元素
     * @param predictor 唯一值属性名或比较器函数(返回true表示存在)
     * @return 与e匹配的元素索引
     */
    static pushUnique(arr, el, predictor) {
        const item = Arrays.index(arr, el, predictor);
        if (-1 !== item.index) {
            return item.index;
        }
        return arr.push(el) - 1;
    }
    /**
     * 查找索引
     * @param arr 数组
     * @param el 查找条件
     * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
     * @return 索引, -1表示未找到
     */
    static index(arr, el, predictor) {
        let index = -1;
        const itemHandler = Builders.equalsOtherElement(el, predictor);
        Arrays.foreach(arr, (item) => {
            if (itemHandler(item)) {
                index = item.index;
                return false;
            }
        });
        const item = Logics.case(-1 !== index, arr[index]).getValue();
        return { index: index, item };
    }
    /**
     * 查找目标值
     * @param arr 数组
     * @param el 查找条件
     * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
     * @return  查找成功返回目标值, 否则返回null
     */
    static find(arr, el, predictor) {
        return Arrays.index(arr, el, predictor);
    }
    /**
     * 合并
     * @param dist 目标数组
     * @param src 元素组
     * @return 目标数组
     */
    static concat(dist, src) {
        if (Validation.isNot(dist, 'Array') || Validation.isNot(src, 'Array')) {
            throw new Error('无效数组参数');
        }
        Array.prototype.push.apply(dist, src);
        return dist;
    }
    /**
     * 删除
     * @param arr 数组
     * @param condition 查找条件
     * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
     * @return 删除成功返回被删除目标值, 否则返回null
     */
    static remove(arr, condition, predictor) {
        const el = Arrays.index(arr, condition, predictor);
        return Logics.case(this.validateIndex(el), () => arr.splice(el.index, 1)[0]).getValue();
    }
    /**
     * 数组减法运算(arrA - arrB), 对象匹配通过引用判定
     * @param arrA 被修改数据
     * @param arrB 目标数组
     * @return 结果(新)数组
     */
    static removeAll(arrA, arrB) {
        return arrA.filter(av => !arrB.includes(av));
    }
    /**
     * 是否包含指定值
     * @param arr 数组
     * @param el 数组元素
     * @param predictor 唯一值属性名或比较器函数(返回true表示找到)
     * @return true-已包含, false-未包含
     */
    static contains(arr, el, predictor) {
        return this.validateIndex(Arrays.index(arr, el, predictor));
    }
    /**
     * 数组过滤
     * @param arr 目标数组
     * @param call 回调函数, false-删除, 其他-保留
     */
    static filter(arr, call) {
        let delKeys = [];
        Arrays.foreach(arr, (item) => {
            if (false === Functions.call(call, item)) {
                delKeys.push(item.index);
            }
        });
        delKeys = delKeys.reverse();
        Arrays.foreach(delKeys, (item) => {
            arr.splice(item.index, 1);
        });
    }
    /**
     * 数组按指定关键字分组
     * @param arr 数组
     * @param mapper 关键字或者转换器
     */
    static group(arr, mapper) {
        const ret = Cast.as();
        const itemHandler = Builders.toArrayKeyMapperHandler(mapper);
        Arrays.foreach(arr, (el) => {
            const rk = itemHandler(el);
            Jsons.computeIfAbsent(ret, rk, []).push(el.item);
        });
        return ret;
    }
    /**
     * 提取数组中每个元素的指定属性值到一个数组中
     * @param arr 数组
     * @param propChain 元素中的属性名
     * @return 属性值数组
     */
    static extractProps(arr, propChain) {
        const vs = [];
        Arrays.foreach(arr, (item) => {
            const val = Jsons.get(item.item, propChain);
            if (Validation.notEmpty(val)) {
                vs.push(val);
            }
        });
        return vs;
    }
    /**
     * 去重复
     * @param src 数组
     * @param [cover=true] 是否对参数数组产生副作用
     * @param [akm] 元素唯一值生成器
     * @return 处理结果. 如果 <i>cover===false</i> 结果为新数组, 否则返回 <i>src</i>
     */
    static unique(src, cover = true, akm) {
        if (0 === src.length) {
            return src;
        }
        const keyMapper = Builders.toArrayKeyMapperHandler(akm, 'element');
        const result = [];
        const keys = [];
        this.foreach(src, el => {
            const key = keyMapper(el);
            if (!keys.includes(key)) {
                keys.push(key);
                result.push(el.item);
            }
        });
        if (cover) {
            src.length = 0;
            Arrays.concat(src, result);
        }
        return src;
    }
    /**
     * 生成一组连续值数组. 如果 <i> start >= end</i> 总是返回0长度数组.
     * @param start 开始值(包含)
     * @param end 结束值(包含)
     * @return 数组长度: end - start + 1
     */
    static genNums(start, end) {
        if (0 >= end - start) {
            return [];
        }
        const keyIter = new Array(end + 1).keys();
        return [...keyIter].slice(start);
    }
    /**
     * 树形映射
     * @param arr 目标数组
     * @param childKey 子节点在父节点的属性名, 覆盖现有属性名会报错.
     * @param parentIndex 子节点指向父节点属性名.
     * @param parentKey 被子节点指向的父节点属性名.
     * @param [onlyRoot=false] 是否从根节点移除所有子节点.
     */
    static tree(arr, childKey, parentIndex, parentKey, onlyRoot = false) {
        // 按parentKey映射所有节点
        const keyMapper = Arrays.toMap(arr, parentKey);
        // 所有子节点映射值
        const childrenIds = [];
        Arrays.foreach(arr, el => {
            const pid = Jsons.get(el.item, parentIndex.toString());
            const parent = keyMapper[pid];
            if (!parent) {
                return;
            }
            childrenIds.push(Jsons.get(el.item, parentKey.toString()));
            const children = Jsons.computeIfAbsent(parent, childKey, []);
            children.push(el.item);
            parent[childKey] = Arrays.unique(children);
        });
        // 移除子节点
        if (onlyRoot) {
            Arrays.foreach(childrenIds, el => {
                delete keyMapper[el.item];
            });
        }
        return Object.values(keyMapper);
    }
    /**
     * 树结构转列表
     * @param root 根节点
     * @param childKey 子节点列表属性
     * @param [hasRoot=true] 是否包含根节点
     * @param [delChildren=false] 是否删除子节点
     */
    static flatTreeSR(root, childKey, hasRoot = true, delChildren = false) {
        const arr = hasRoot ? [root] : [];
        if (Validation.isNot(root, 'Object')) {
            return arr;
        }
        Arrays.foreach(root[childKey], (el) => {
            arr.push(el.item);
            const children = Arrays.flatTreeSR(el.item, childKey, false, delChildren);
            if (Validation.notEmpty(children)) {
                arr.push(...children);
            }
        });
        if (delChildren) {
            delete root[childKey];
        }
        return arr;
    }
    /**
     * (多根)树结构转列表
     * @param root 根节点
     * @param childKey 子节点列表属性
     * @param [hasRoot=true] 是否包含根节点
     * @param [delChildren=false] 是否删除子节点
     * @param [akm] 列表去重判定属性名或元素映射函数
     */
    static flatTreeMR(root, childKey, hasRoot = true, delChildren = false, akm) {
        const result = [];
        this.foreach(root, el => {
            const nodes = this.flatTreeSR(el.item, childKey, hasRoot, delChildren);
            this.concat(result, nodes);
        });
        return akm ? this.unique(result, false, akm) : result;
    }
    /**
     * 校验数组元素索引是否有效
     * @param element 数组元素
     * @return 有效返回true，否则返回false
     * @private
     */
    static validateIndex(element) {
        return 0 <= element.index;
    }
}

class BError extends Error {
    constructor(e) {
        const msg = BError.isError(e) ? e.message : e;
        super(msg);
        this.name = 'BError';
    }
    /**
     * 包装为错误对象
     * @param e 错误信息或错误对象
     */
    static from(e) {
        return this.isError(e) ? e : new BError(e);
    }
    /**
     * 判断一个对象是否为Error实例
     * @param e 目标对象
     */
    static isError(e) {
        return Validation.is(e, 'Error');
    }
    /**
     * 如果条件为false, 抛出异常
     * @param c 条件
     * @param [msg] 错误消息
     * @throws 条件为假时
     */
    static iff = (c, msg) => {
        if (!c)
            this.throwError(msg);
    };
    /**
     * 抛出异常
     * @param [e] 错误消息或错误对象
     */
    static throwError = (e) => {
        throw this.from(e);
    };
}

/**
 * 属性链工具
 */
class PropChains {
    /**原始属性链*/
    origin;
    /**当前层级*/
    hierarchy;
    /**期望类型*/
    expectType;
    /**当前节点属性名*/
    prop;
    /**值*/
    value;
    /**下个节点*/
    next;
    /**
     * 获取数组对象的值
     * @param data 数据对象
     * @param ognl ognl表达式
     */
    static getArrOgnlVal(data, ognl) {
        // 获取数组对象
        const sIdx = ognl.indexOf('[');
        let arr;
        // 数组对象需要从data子属性获取
        if (0 < sIdx) {
            const arrK = ognl.substring(0, sIdx);
            arr = data[arrK];
        }
        // ognl指向data自身
        else {
            arr = data;
        }
        const idxStr = ognl.substring(sIdx);
        const idxReg = /^(\[\d+])+$/;
        if (!idxReg.test(idxStr)) {
            throw new Error('非法下标索引:' + idxStr);
        }
        // 获取值[1], [0][2]...
        const idxes = idxStr.split('][');
        // 一维数组
        if (1 === idxes.length) {
            const arrIndex = +idxStr.replace('[', '').replace(']', '');
            return arr[arrIndex];
        }
        // 多维数组
        let val = arr;
        // jstAPI.common.eachValue(idxes, function (v) {
        Arrays.foreach(idxes, (v) => {
            if (Validation.isNot(val, 'Array')) {
                return false;
            }
            val = val[parseInt((v + '').replace('[', '').replace(']', ''))];
        });
        return val;
    }
    /**
     * 获取属性值
     * @param data 数据对象
     * @param ognl ognl表达式
     */
    static getValue(data, ognl) {
        if (Validation.nullOrUndefined(data)) {
            return null;
        }
        ognl = ognl.trim();
        const keys = ognl.split('.');
        if (1 === keys.length) {
            // 非数组
            const regex = /\[/;
            if (!regex.test(ognl)) {
                return data ? data[ognl] : data;
            }
            return PropChains.getArrOgnlVal(data, ognl);
        }
        const idx = ognl.indexOf('.');
        const key = ognl.substring(0, idx);
        const isArr = /\[\d+]/.test(key);
        const valObj = isArr ? PropChains.getArrOgnlVal(data, key) : data[key];
        const newOgnl = ognl.substring(idx + 1);
        return PropChains.getValue(valObj, newOgnl);
    }
    /**
     * 设置对象属性值
     * @param o 数据对象
     * @param propChain 属性链
     * @param v 值
     */
    static setValue(o, propChain, v) {
        if (Validation.isNil(o)) {
            return Cast.nil;
        }
        return PropChains.parse(propChain).setValue(o, v);
    }
    /**
     * 解析ognl表达式
     * @param chain 属性链表达式
     * @param [hierarchy=0] 属性层级, 外部调用不传
     */
    static parse(chain, hierarchy = 0) {
        const propChains = new PropChains();
        propChains.origin = chain;
        propChains.hierarchy = hierarchy;
        const validOk = !chain.startsWith('.'); // 不能以.开头
        // validOk = validOk && /^\D/.test(chain); // 不能以数字开头
        BError.iff(validOk, '属性链无效');
        // 提取：Array
        if (chain.startsWith('[')) {
            const arrIdx = chain.match(/^\[(.+)]/);
            propChains.prop = +arrIdx[1];
            BError.iff(Validation.is(propChains.prop, 'Number'), `索引无效: ${chain}, 期望类型 Number`);
            propChains.expectType = 'array';
            // 截取已消费节点
            const nextStartIndex = chain.indexOf(']');
            const surplus = chain.substring(nextStartIndex + 1);
            if (surplus) {
                const chainSurplus = surplus.replace(/^\./, '');
                propChains.next = PropChains.parse(chainSurplus, hierarchy + 1);
            }
            return propChains;
        }
        // 提取: Object
        const omr = chain.match(/^(.+)[.[]/) || [undefined, chain];
        propChains.prop = omr[1];
        propChains.expectType = propChains.prop.includes('[') ? 'array' : 'object';
        const surplus = chain.substring(propChains.prop.length);
        if (surplus) {
            const chainSurplus = surplus.replace(/^\./, '');
            propChains.next = PropChains.parse(chainSurplus, hierarchy + 1);
        }
        return propChains;
    }
    /**
     * 设置每个层级对应值
     * @param o 对象
     * @param v 值
     * @private
     */
    setValue(o, v) {
        const to = o;
        const val = to[this.prop];
        const originValType = Object.prototype.toString.call(val);
        // 只有一层属性
        if (!this.next) {
            switch (this.expectType) {
                case 'array':
                    BError.iff(Validation.is(o, 'Array'), `但类型错误. 期望[Array]实际[${originValType}]`);
                    break;
                case 'object':
                    BError.iff(Validation.is(o, 'Object'), `但类型错误. 期望[Object]实际[${originValType}]`);
                    break;
            }
            this.value = to[this.prop] = v;
            return this.value;
        }
        // 多层属性
        const hasVal = Validation.notNil(val);
        switch (this.expectType) {
            case 'array': {
                // if (hasVal) {
                //   BError.iff(
                //     Validation.is(this.value, 'Array'),
                //     `目标属性已存在, 但类型错误. 期望[Array]实际[${originValType}]`,
                //   );
                //   return v;
                // }
                // e.g: foo[0]
                const sp = String(this.prop).split('[');
                if (sp.length === 2) {
                    this.value = to[this.prop] = to[this.prop] ?? [];
                    if (this.next) {
                        const index = parseInt(sp[1]);
                        this.value = this.value[index] = (this.next.expectType === 'object' ? {} : []);
                    }
                }
                // e.g: foo[0][1]
                else if (sp.length > 2) {
                    const arrProp = sp[0];
                    let arrTmp = to[arrProp] = to[arrProp] ?? [];
                    const lastArrIndex = parseInt(sp.pop());
                    for (let i = 1; i < sp.length; i++) {
                        const index = parseInt(sp[i]);
                        const oldVal = arrTmp[index];
                        if (Validation.notNil(oldVal)) {
                            BError.iff(Validation.is(oldVal, 'Array'), `数据[${this.prop}]类型错误, 期望[[object Array]]实际[${Object.prototype.toString.call(oldVal)}]`);
                        }
                        arrTmp[index] = oldVal ?? [];
                        arrTmp = arrTmp[index];
                    }
                    if (this.next) {
                        this.value = arrTmp[lastArrIndex] = (this.next.expectType === 'object' ? {} : []);
                    }
                }
                else {
                    this.value = to[this.prop] = [];
                }
                break;
            }
            case 'object':
                if (hasVal) {
                    BError.iff(Validation.is(o, 'Object'), `目标属性已存在, 但类型错误. 期望[Object]实际[${originValType}]`);
                }
                else {
                    this.value = to[this.prop] = {};
                }
                break;
        }
        return this.next.setValue(this.value, v);
    }
}

class Jsons {
    /**
     * 浅层合并两个对象
     * @param src 数据提供者
     * @param dest 数据接受者
     * @param [recover=true] 出现同名属性是否允许覆盖；
     *                        指定为false时不会执行合并操作, 并可通过返回值获取具体重复的属性名列表
     * @returns 检测到重复的属性名, 如果不存在重复属性名总是返回空数组
     */
    static merge(src, dest, recover = true) {
        const repeatedKeys = this.extractRepeatKeys(src, dest);
        if (repeatedKeys.length) {
            if (!recover) {
                return repeatedKeys;
            }
        }
        Object.assign(dest, src);
        return [];
    }
    /**
     * 提取对象列表中重复的属性名
     * @param vs 对象列表
     * @returns 通过枚举方式查找的重复属性名列表
     */
    static extractRepeatKeys(...vs) {
        const keysArr = new Array();
        const vsR = vs || [];
        if (undefined === vsR) {
            return [];
        }
        vsR.forEach(value => {
            if (Validation.notNullOrUndefined(value)) {
                keysArr.push(Object.keys(value));
            }
        });
        return Arrays.intersectionSimple(keysArr);
    }
    /**
     * 对象深拷贝, 只针对JSON对象有效
     * @param o 目标对象
     * @returns 拷贝后对象
     */
    static simpleClone(o) {
        if (Validation.isNullOrUndefined(o)) {
            // @ts-ignore
            return null;
        }
        return JSON.parse(JSON.stringify(o));
    }
    /**
     * 便利对象属性
     * @param o 目标对象
     * @param handler 迭代处理器
     */
    static foreach(o, handler) {
        if (Validation.nullOrUndefined(o)) {
            return;
        }
        Arrays.foreach(Object.keys(o), el => {
            return handler({ item: o[el.item], index: el.item });
        });
    }
    /**
     * 把src浅克隆到dist中
     * @param src 数据对象
     * @param dist 目标对象
     */
    static cover(src = {}, dist = Cast.as({})) {
        this.foreach(dist, el => {
            dist[el.index] = src[el.index] ?? el.item;
        });
        return dist;
    }
    /**
     * 从对象中获取值, 如果没有就计算并保存新值
     * @param store 数据仓库
     * @param key 属性名
     * @param fp 属性值计算过程
     */
    static computeIfAbsent(store, key, fp) {
        // 数组
        if (Validation.is(store, 'Array') && store instanceof Array) {
            const val = this.get(store, key);
            if (Validation.notNil(val)) {
                return val;
            }
            const newlyVal = Functions.execOrGetter(fp, store, key);
            Jsons.set(store, key, newlyVal);
            return newlyVal;
        }
        if (key in store) {
            return store[key];
        }
        const newlyVal = Functions.execOrGetter(fp, store, key);
        Jsons.set(store, key, newlyVal);
        return newlyVal;
    }
    /**
     * 对象紧凑处理
     * @param data 数据对象(无副作用)
     * @param [recursion] 是否递归处理
     * @param [nullable] 是否保留null|undefined
     * @param [emptyStr] 是否保留空字符串
     * @param [emptyObj] 是否保留空对象
     * @param [emptyArray] 是否保留空数组
     * @return 数据对象克隆对象
     */
    static compact(data, recursion = false, nullable = false, emptyStr = false, emptyObj = false, emptyArray = false) {
        if (!data) {
            return data;
        }
        const delKey = (o, k) => {
            if (Validation.is(o, 'Object')) {
                delete o[k];
            }
            else if (Validation.is(o, 'Array')) {
                o.splice(+k, 1);
            }
        };
        this.foreach(data, el => {
            if (Validation.isEmpty(el.item)) {
                if (Validation.isNullOrUndefined(el.item) && !nullable) {
                    delKey(data, el.index);
                    return;
                }
                if (Validation.is(el.item, 'String') && !emptyStr) {
                    delKey(data, el.index);
                    return;
                }
                if (Validation.is(el.item, 'Object') && !emptyObj) {
                    delKey(data, el.index);
                    return;
                }
                if (Validation.is(el.item, 'Array') && !emptyArray) {
                    delKey(data, el.index);
                    return;
                }
            }
            // recursion
            if (el.item instanceof Object && recursion) {
                el.item = this.compact(el.item);
                if (Validation.notEmpty(el.item)) {
                    data[el.index] = el.item;
                    return;
                }
                if (Validation.is(el.item, 'Object') && !emptyObj) {
                    delKey(data, el.index);
                    return;
                }
                if (Validation.is(el.item, 'Array') && !emptyArray) {
                    delKey(data, el.index);
                    return;
                }
            }
        });
        return data;
    }
    /**
     * 获取对象属性值
     * @param o json对象
     * @param propChain 属性链; e.g: foo.bar, foo[0].bar, ...
     * @return 属性值
     */
    static get(o, propChain) {
        return PropChains.getValue(o, String(propChain));
    }
    /**
     * 设置属性值
     * @param o 目标对象
     * @param propChain 属性链
     * @param v 值
     */
    static set(o, propChain, v) {
        return PropChains.setValue(o, String(propChain), v);
    }
    /**
     * 对象属性平铺
     * @param src 目标对象
     * @param convert 转换函数
     * @return 转换结果
     */
    static flat(src, convert) {
        const results = [];
        this.foreach(src, iter => {
            const result = convert(iter);
            results.push(result);
        });
        return results;
    }
    /**
     * 清空对象所有属性
     * @param o 目标对象
     */
    static clear(o) {
        this.foreach(o, iter => {
            o[iter.index] = undefined;
        });
        return o;
    }
}

/**
 * 数组异步迭代器
 */
class AsyncArrayStream {
    /**
     * 游标
     * @private
     */
    cursor = 0;
    /**
     * 事件
     * @private
     */
    events = {};
    /**
     * 目标数据异步获取器
     * @private
     */
    array$;
    /**
     * 最终获取的数据
     * @private
     */
    elements;
    /**
     * 最终处理结果
     * @private
     */
    result;
    /**
     * 是否已经结束
     * @private
     */
    isOver = false;
    /**
     * 中断信息
     * @private
     */
    brokenInfo;
    /**
     * 中断类型
     * @private
     */
    brokenType;
    /**
     * 结果委托
     * @private
     */
    delegateResult;
    /**
     * 等待处理结果的Promise
     * @private
     */
    waitPromise;
    /**
     * 将一个数组(或数据获取函数)包装为异步处理
     * @param arrayGetter 目标数组
     */
    constructor(arrayGetter) {
        this.init(arrayGetter);
    }
    /**
     * 将一个数组(或数据获取函数)包装为异步处理
     * @param array 目标数组
     */
    static from(array) {
        return new AsyncArrayStream(array);
    }
    /**
     * 监听开始处理元素前事件
     * @param handler 事件处理器
     */
    onBegin(handler) {
        this.events.begin = handler;
        return this;
    }
    /**
     * 监听节点事件
     * @param handler 事件处理器
     */
    onElement(handler) {
        this.events.element = handler;
        return this;
    }
    /**
     * 如果目标数组是空或无效时
     * @param handler 事件处理器
     */
    onEmpty(handler) {
        this.events.empty = handler;
        return this;
    }
    /**
     * 处理完成
     * @param handler 事件处理器
     */
    onDone(handler) {
        this.events.done = handler;
        return this;
    }
    /**
     * 获取下一个元素
     */
    next() {
        return Functions.execOrAsyncGetter(() => {
            if (this.isOver) {
                return Promise.reject('数据已经处理完成');
            }
            // 首次调用前
            if (this.cursor === 0) {
                this.isOver = (false === Functions.call(this.events.begin, this));
                if (this.isOver) {
                    return;
                }
            }
            // 空数组
            const elements = this.elements || [];
            if (0 === elements.length) {
                const valOfSecond = Functions.execOrAsyncGetter(this.events.empty, this);
                if (Validation.isNil(valOfSecond)) {
                    this.isOver = true;
                    return;
                }
                else {
                    this.reset();
                    this.array$ = valOfSecond;
                    return this.next();
                }
            }
            // 递归结束
            if (this.cursor === elements.length) {
                return;
            }
            // 遍历每个元素
            const item = elements[this.cursor];
            const itemData = {
                index: this.cursor++,
                item,
                self: this,
                broken: this.broken.bind(this)
            };
            const itemHandleResult = Functions.call(this.events.element, itemData);
            return Functions
                .execOrAsyncGetter(itemHandleResult)
                .then((itemResult) => {
                if (!itemResult) {
                    Logs.debug(`元素迭代返回结果:[${itemResult}], 是否终止后续处理:[${!itemResult}]`, itemData);
                    this.broken({ ...itemData, self: undefined }, 'ELEMENT_ITERATOR_HANDLE:FALSE');
                    return;
                }
                return this.next();
            });
        });
    }
    /**
     * 手动中断
     * @param brokenData 终端携带的数据
     * @param [type='MANUAL'] 中断类型
     */
    broken(brokenData, type = 'MANUAL') {
        this.isOver = true;
        this.brokenInfo = brokenData;
        this.brokenType = type;
    }
    /**
     * 获取最终处理结果, 如果结果中包含 broken 表示处理被中断
     */
    getResult() {
        return new Promise((resolve) => this.delegateResult = resolve);
    }
    /**
     * 初始化
     * @param arrayGetter 数据或数据获取函数
     */
    init(arrayGetter) {
        this.reset();
        this.array$ = Functions.execOrAsyncGetter(arrayGetter);
        return this.await();
    }
    /**
     * 重置为初始化状态
     * @private
     */
    reset() {
        this.cursor = 0;
        this.isOver = false;
        this.result = undefined;
    }
    /**
     * 等待数据返回
     * @private
     */
    await() {
        if (this.waitPromise) {
            this.waitPromise.abort();
        }
        this.waitPromise = Promises.control(this.array$
            .then((data) => {
            this.elements = data;
            return this.next();
        })
            .then(() => {
            this.result = Functions.call(this.events.done, this);
            this.events.done = undefined;
            this.callDelegateResult();
        })
            .catch((e) => {
            this.catch(e);
        }));
        return this.waitPromise;
    }
    /**
     * 捕获异常中断
     * @param error 异常信息
     * @private
     */
    catch(error) {
        const args = { self: this, error: BError.from(error) };
        this.result = Functions.call(this.events.error, args);
        this.broken(error);
        this.callDelegateResult();
    }
    /**
     * 执行结果委托函数
     * @private
     */
    callDelegateResult() {
        const result = {
            result: this.result,
            broken: this.brokenInfo,
            brokenType: this.brokenType
        };
        Functions.call(this.delegateResult, result);
        this.delegateResult = undefined;
    }
}

class Validation {
    /**
     * @deprecated
     * 校验单个值是否为null/undefined
     * @param v 目标值
     * @returns true-目标值是null/undefined, false-目标值不是null/undefined
     * @see isNil
     */
    static isNullOrUndefined(v) {
        return this.isNil(v);
    }
    /**
     * @deprecated
     * 校验指定值是否已定义(非null/undefined)
     * @param v 目标值
     * @returns true-值已定义, false-值未定义
     * @see notNil
     */
    static notNullOrUndefined(v) {
        return !this.notNil(v);
    }
    /**
     * 校验一系列值是否为不可用的值(null/undefined)
     * @param vs 值列表
     * @returns true-全部都是null/undefined, false-当找到至少一个不是null/undefined
     */
    static nullOrUndefined(...vs) {
        for (const vsKey in vs) {
            if (!this.isNullOrUndefined(vs[vsKey])) {
                return false;
            }
        }
        return true;
    }
    /**
     * 校验单个值是否为null/undefined
     * @param v 目标值
     * @returns true-目标值是null/undefined, false-目标值不是null/undefined
     */
    static isNil(v) {
        return null === v || undefined === v;
    }
    /**
     * 校验指定值是否已定义(非null/undefined)
     * @param v 目标值
     * @returns true-值已定义, false-值未定义
     */
    static notNil(v) {
        return !this.isNil(v);
    }
    /**
     * 校验目标值是否真值
     * @param v 目标值
     * @returns true-目标值为真值, false-目标值为假值
     */
    static isTruthy(v) {
        return !this.isFalsy(v);
    }
    /**
     * 校验目标值是否假值
     * @param v 目标值
     * @returns true-目标值为假值 false-目标值为真值,
     */
    static isFalsy(v) {
        return !v;
    }
    /**
     * 校验是否为指定类型
     * @param v 目标值
     * @param type 类型
     */
    static is(v, type) {
        return (`[object ${type}]` === Object.prototype.toString.call(v));
    }
    /**
     * 校验值是否为指定类型之一
     * @param v 目标数据
     * @param type 类型A
     * @param [types] 其他类型
     * @return 目标数据满足任意指定类型返回true,否则返回false
     */
    static isOr(v, type, ...types) {
        types = types || [];
        types.push(type);
        for (const t of types) {
            if (this.is(v, t)) {
                return true;
            }
        }
        return false;
    }
    /**
     * 校验是否不是指定类型
     * @param v 值
     * @param type 类型
     * @return 如果是指定类型返回true, 否则返回false
     */
    static isNot(v, type) {
        return !this.is(v, type);
    }
    /**
     * 校验对象是否为: null/undefined/空字符串/空数组/空对象
     * @param o 被校验对象
     */
    static isEmpty(o) {
        if (this.isNullOrUndefined(o)) {
            return true;
        }
        if (this.isOr(o, 'Array', 'String')) {
            return 0 === o.length;
        }
        if (this.is(o, 'Object')) {
            return 0 === Object.keys(o).length;
        }
        return false;
    }
    /**
     * 校验对象是否不为: null/undefined/空字符串/空数组/空对象
     * @param o 被校验对象
     * @return {boolean}
     * @see isEmpty
     */
    static notEmpty(o) {
        return !this.isEmpty(o);
    }
    /**
     * 校验两个对象是否具有相同属性
     * <pre>
     * isEq(null, null);        // true
     * isEq(null, undefined);   // true
     *
     * let b = a;
     * isEq(a, b);    // true
     *
     * leb b = JSON.parse(JSON.stringify(a));
     * isEq(a, b);    // true
     *
     * </pre>
     * @param a 对象a
     * @param b 对象b
     * @return 校验通过返回true, 否则返回false
     */
    static isEq(a, b) {
        // same reference or primary value
        if (a === b) {
            return true;
        }
        if (this.isNullOrUndefined(a) && this.isNullOrUndefined(b)) {
            return true;
        }
        // other
        return JSON.stringify(a) === JSON.stringify(b);
    }
    /**
     * 校验对象是否为可执行函数
     * @param o 目标对象
     * @return 是可执行函数返回true, 否则返回false
     */
    static isFunction(o) {
        return this.is(o, 'Function');
    }
    /**
     * 校验对象属性值是否有效
     * @param o 目标对象
     * @param validator 校验器
     * @param [async=false] 同步验证指定为true，否则指定为false
     * @return 成功返回true，失败返回false
     */
    static validate(o, validator, async = false) {
        const validators = Jsons.flat(validator, iter => ({
            index: iter.index,
            validate: iter.item,
            iter: {
                item: Jsons.get(o, iter.index),
                index: iter.index
            }
        }));
        if (!async) {
            return validators.reduce((pv, el) => pv && false !== el.validate(el.iter), true);
        }
        return AsyncArrayStream
            .from(validators)
            .onElement((evt) => evt.item.validate(Cast.as(evt.item.iter)))
            .getResult()
            .then((result) => Validation.isEmpty(result.broken) || Validation.isEmpty(result.brokenType));
    }
}

class DataPoolKey {
    static AXIOS_SERVICE = Symbol('AXIOS_SERVICE');
    static AXIOS_EXTRACT_RESPONSE = Symbol('AXIOS_EXTRACT_RESPONSE');
}
class DataPool {
    static POOL = new Map();
    /**
     * 获取配置
     * @param key 配置项
     */
    static get(key) {
        return this.POOL.get(key);
    }
    /**
     * 设置配置
     * @param key 配置项
     * @param o 配置值
     */
    static set(key, o) {
        this.POOL.set(key, o);
        return this;
    }
}

/**
 * 装饰器工具类
 */
class Decorators {
    /**
     * 生成类(class)装饰
     * @param call 装饰器逻辑
     */
    static class = (call) => (target) => call({ target });
    /**
     * 生成函数(Function)装饰器
     * @param call 装饰器逻辑
     */
    static method = (call) => (target, fnKey) => call({ target, fnKey });
    /**
     * 代理
     * @param call 属性代理逻辑
     */
    static proxy = (call) => {
        return Decorators.method(({ target, fnKey }) => {
            const vof = target[fnKey];
            target[fnKey] = function (...args) {
                return call(this, { target, key: fnKey, vof }, args);
            };
        });
    };
}

class Request {
    /**
     * Axios服务实例
     */
    static get axiosServe() {
        return DataPool.get('AXIOS_SERVICE');
    }
    /**
     * response前置数据提取
     * @example
     * DataPool.set('AXIOS_EXTRACT_RESPONSE', (resp: AxiosResponse):T => {
     *   // e.g: {data:{code:UnifyResultCode, data:RealData, errorMessage:string}}
     *   return resp.data;
     * });
     */
    static get extractResponseData() {
        return DataPool.get('AXIOS_EXTRACT_RESPONSE') || Builders.getterSelf();
    }
}
/**
 * GET 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
function Get(uri) {
    return (target, fnKey) => {
        target[fnKey] = (args) => {
            args = args || {};
            const filledUri = setPathVariable(uri, args);
            return Request.axiosServe.get(filledUri, { params: args.params }).then(Request.extractResponseData);
        };
    };
}
/**
 * DELETE 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
function Delete(uri) {
    return generateWithPost(uri, 'delete');
}
/**
 * POST 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
function Post(uri) {
    return generateWithPost(uri, 'post');
}
/**
 * PUT 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
function Put(uri) {
    return generateWithPost(uri, 'put');
}
/**
 * 响应结果拦截
 * @param observer 默认值
 * @constructor
 */
function Filter(observer) {
    return Decorators.proxy((thisArg, { target, vof }, args) => {
        const fn = vof.bind(target);
        const resp = fn(...args);
        return resp.then((data) => Functions.call(observer, data, args));
    });
}
/**
 * 设置路径参数
 * @param uri 请求地址
 * @param args 请求参数
 */
const setPathVariable = (uri, args) => {
    const pathVariables = args.pathVariables || {};
    return uri.replaceAll(/({[^/]+})/g, (varUnit) => {
        const varName = varUnit.match(/{(.+)}/)[1];
        const varVal = pathVariables[varName];
        if (Validation.isNullOrUndefined(varVal))
            Logs.error(`缺少路径变量[${varName}]配置`);
        return String(varVal);
    });
};
/**
 * 生成POST相关请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @param method 请求方式
 */
const generateWithPost = (uri, method) => {
    return (target, fnKey) => {
        target[fnKey] = (args) => {
            args = args || {};
            const filledUri = setPathVariable(uri, args);
            return Request.axiosServe[method](filledUri, args.params).then(Request.extractResponseData);
        };
    };
};

class Strings {
    /**
     * 字符串替换
     * @param s 字符串
     * @param cfg 属性名:正则表达式分组字符串, 属性值:要替换的值
     */
    static replaceAll(s = '', cfg = {}) {
        let tmp = s;
        Jsons.foreach(cfg, el => {
            const regExp = new RegExp(`${el.index}`, 'g');
            tmp = tmp.replace(regExp, el.item);
        });
        return tmp;
    }
    /**
     * 校验是否包含空字符串
     * @param [useTrim=true] 是否去除两端空格
     * @param arr  被检测字符串
     * @return 包含至少一个空字符串返回true, 否则返回false
     */
    static hasBlank(useTrim = true, ...arr) {
        let isFoundBlank = false;
        Arrays.foreach(arr, el => {
            if (this.isBlank(el.item, useTrim)) {
                isFoundBlank = true;
                return false;
            }
        });
        return isFoundBlank;
    }
    /**
     * 空字符串校验
     * @param s  字符串
     * @param [useTrim=true]  是否去除两端空格
     * @return 空字符串返回true, 否则返回false
     */
    static isBlank(s, useTrim = true) {
        if (Validation.isNot(s, 'String')) {
            return false;
        }
        if (Validation.isNullOrUndefined(s)) {
            return true;
        }
        if (useTrim) {
            s = s.trim();
        }
        return 0 === s.length;
    }
    /**
     * 生成唯一ID
     * @return 唯一字符串
     */
    static guid() {
        const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    }
    /**
     * 对象转string
     * @param o 对象
     */
    static toString(o) {
        return `${o}`;
    }
    /**
     * 去掉两端空格, s为null/undefined时返回''
     * @param s 源字符串
     */
    static trimToEmpty(s) {
        if (Validation.isNullOrUndefined(s))
            return '';
        return s.toString().trim();
    }
    /**
     * HTML内容转义为普通文本
     * @param html HTML内容
     * @return HTML转义后字符串
     */
    static html2text(html) {
        let temp = document.createElement('i');
        (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
        const output = temp.innerHTML;
        temp = null;
        return output;
    }
    /**
     * 普通文本转HTML内容
     * @param text 普通文本
     * @return HTML标签(转义后)还原
     */
    static text2html(text) {
        let temp = document.createElement('i');
        temp.innerHTML = text;
        const output = temp.innerText || temp.textContent;
        temp = null;
        return output;
    }
}

/**
 * 针对Vue函数
 */
class Events {
    /**
     * 防抖, 指定时间内只执行第一次
     * @param duration 持续时长
     * @param debounceProp 防抖属性(执行期间设值为true, 等待 <i>duration</i> 毫秒后设值为false)
     */
    static debouncer(duration = 100, debounceProp) {
        Logs.info('[Events.debouncer] Execute debouncer');
        return vueClassComponent.createDecorator((options, fnKey) => {
            const fn = options.methods[fnKey];
            debounceProp = (debounceProp || `__${fnKey}__${Strings.guid()}`);
            Logs.info('[Events.debouncer] Redefine function: ', fnKey);
            options.methods[fnKey] = function (...args) {
                if (this[debounceProp] === true) {
                    Logs.info(`[Events.debouncer] 函数[${fnKey}]需要等待上次防抖结束`);
                    return;
                }
                this[debounceProp] = true;
                Logs.info('[Events.debouncer] Executing function: ', fnKey);
                fn.apply(this, args);
                setTimeout(() => this[debounceProp] = false, duration);
            };
        });
    }
    /**
     * 防抖可中断的, 目标函数会等待指定时间后执行. 期间如果执行了中断函数就会打断目标函数的执行.
     * @param interrupt 中断函数名
     * @param [duration=300] 等待持续时长(ms)
     */
    static debounceController(interrupt, duration = 300) {
        return vueClassComponent.createDecorator((target, fnKey) => {
            const originFn = target.methods[fnKey];
            if (!(originFn instanceof Function)) {
                throw new Error(`[Events.debounceController] 目标属性不是可执行函数: ${fnKey}`);
            }
            const interrupter = target.methods[interrupt];
            if (!(interrupter instanceof Function)) {
                throw new Error(`[Events.debounceController] 中断函数无效, 指定属性不是可执行函数: ${String(interrupt)}`);
            }
            let originFnTimer;
            target.methods[fnKey] = function (...args) {
                Logs.info(`[Events.debounceController] 函数[${fnKey}]延迟执行 ${duration} ms`);
                originFnTimer = setTimeout(() => originFn.bind(this)(...args), duration);
            };
            target.methods[interrupt] = function (...args) {
                Logs.info(`[Events.debounceController] 函数[${fnKey}]执行被[${String(interrupt)}]中断, 执行函数[${String(interrupt)}]`);
                clearTimeout(originFnTimer);
                interrupter.bind(this)(...args);
            };
        });
    }
    /**
     * 记录日志
     * @param [params=true] 打印请求参数
     * @param [returns=false] 打印返回值
     */
    static log(params = true, returns = true) {
        return vueClassComponent.createDecorator((vm, fnKey) => {
            const fn = vm.methods[fnKey];
            vm.methods[fnKey] = (...args) => {
                const filename = String(vm.__file).split('/').pop();
                const vmClsName = String(filename).split('.')[0];
                const prefix = `[${vmClsName}.${fnKey}]`;
                if (params) {
                    Logs.debug(prefix, ' Parameters: ', args);
                }
                const data = fn(...args);
                if (returns && Validation.notNullOrUndefined(data)) {
                    Logs.debug(prefix, ' Returns: ', data);
                }
                return data;
            };
        });
    }
    /**
     * 延迟执行直到断言成功
     * @param predicate 断言函数
     * @param [lazy=10] 首次执行延迟时间(ms)
     * @param [interval=10] 第N+1次断言间隔时间(ms)
     */
    static lazy(predicate, lazy = 10, interval) {
        lazy = (0 < lazy) ? lazy : 10;
        interval = interval ?? lazy;
        interval = (0 <= interval) ? interval : lazy;
        return vueClassComponent.createDecorator((options, fnKey) => {
            const fn = options.methods[fnKey];
            options.methods[fnKey] = function (...args) {
                const vm = this;
                const fnWrapper = () => {
                    const result = !!Functions.call(predicate, vm);
                    result && fn.bind(vm)(...args);
                    return result;
                };
                setTimeout(() => {
                    fnWrapper();
                    const intervalId = setInterval(() => fnWrapper() && clearInterval(intervalId), interval);
                }, lazy);
            };
        });
    }
    /**
     * 观察者
     * @param observe 观察逻辑
     * @param [beforeBroken=true] 当state==='before'时observe返回false是否允许中断目标函数执行
     * @param [useResult=false] 是否使用观察结果
     */
    static observe(observe, beforeBroken = true, useResult = false) {
        return vueClassComponent.createDecorator((options, key) => {
            const fn = options.methods[key];
            options.methods[key] = function (...args) {
                observe = observe.bind(this);
                const obsBR = observe({ stage: 'before', args: args, thisArg: this });
                if (beforeBroken && obsBR === false) {
                    return;
                }
                try {
                    const data = fn.bind(this)(...args);
                    if (Validation.is(data, 'Promise')) {
                        return data
                            .then((data$) => {
                            const obsAR = observe({ stage: 'after', data: data$, thisArg: this });
                            return useResult ? obsAR : data$;
                        })
                            .catch((e) => {
                            observe({ stage: 'error', error: e, thisArg: this });
                            return Promise.reject(e);
                        });
                    }
                    const obsAR = observe({ stage: 'after', data, thisArg: this });
                    return useResult ? obsAR : data;
                }
                catch (e) {
                    return observe({ stage: 'after', error: e, thisArg: this });
                }
            };
        });
    }
    /**
     * 观察者
     * @param points 切入点配置项
     * @see observe
     */
    static observeRun(points) {
        return this.observe(function ({ stage, thisArg }) {
            // @ts-ignore
            const ctx = this;
            switch (stage) {
                case 'before':
                    return Functions.exec(Jsons.get(ctx, points.before), thisArg);
                case 'after':
                    Functions.exec(Jsons.get(ctx, points.after), thisArg);
                    return;
                case 'error':
                    Functions.exec(Jsons.get(ctx, points.catcher), thisArg);
                    break;
                default:
                    Logs.warn(`[Events] 未处理状态: ${stage}`);
                    return;
            }
        }, false, false);
    }
    /**
     * 闪烁指定属性. 执行前熄灭执行后亮起.
     * @param blinkProp 闪烁属性
     * @param [duration=10] 熄灭持续时长(ms)
     */
    static blink(blinkProp, duration = 10) {
        return vueClassComponent.createDecorator((options, key) => {
            const fn = options.methods[key];
            options.methods[key] = function (...args) {
                this[blinkProp] = false;
                Promises
                    .of(() => fn.bind(this)(...args))
                    .then(() => Functions.timer(() => this[blinkProp] = true, false, duration));
            };
        });
    }
}

class Observer {
    /**
     * 记录日志
     * @param [params=true] 打印请求参数
     * @param [returns=false] 打印返回值
     */
    static log(params = true, returns = true) {
        return (target, fnKey) => {
            const prefix = `[${fnKey}] `;
            const fn = target[fnKey];
            target[fnKey] = (...args) => {
                if (params)
                    Logs.debug(prefix, ' Parameters: ', args);
                const data = fn(...args);
                if (returns)
                    Logs.debug(prefix, ' Returns: ', data);
                return data;
            };
        };
    }
    /**
     * 延迟执行直到断言成功
     * @param predicate 断言函数
     * @param [lazy=10] 首次执行延迟时间(ms)
     * @param [interval=10] 第N+1次断言间隔时间(ms)
     */
    static lazy = (predicate, lazy = 10, interval) => {
        lazy = (0 < lazy) ? lazy : 10;
        interval = interval ?? lazy;
        interval = (0 <= interval) ? interval : lazy;
        return Decorators.method(({ target, fnKey }) => {
            const fn = target[fnKey];
            target[fnKey] = function (...args) {
                const thisInner = this;
                const fnWrapper = () => {
                    // const result = !!Functions.call(predicate, thisInner);
                    const result = predicate.bind(thisInner)(thisInner, ...args);
                    result && fn.bind(thisInner)(...args);
                    return result;
                };
                setTimeout(() => {
                    fnWrapper();
                    const intervalId = setInterval(() => fnWrapper() && clearInterval(intervalId), interval);
                }, lazy);
            };
        });
    };
}

/**
 * 本地存储工具
 */
class Storages {
    static $(storage) {
        const that = {
            save(key, value) {
                const oldV = that.get(key);
                storage.setItem(key, JSON.stringify(value));
                return oldV;
            },
            get(key) {
                const v = storage.getItem(key);
                return Validation.isNullOrUndefined(v) ? null : JSON.parse(v);
            },
            remove(key) {
                const v = that.get(key);
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

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/**
 * @example
 * # 依赖条件
 * $ yarn add vuex
 * $ yarn add vuex-class
 */
class StoreTools {
    /**
     * 提交同步操作
     * @param ctx 上下文
     * @param key typeof keyof MUTATIONS
     * @param payload 数据
     */
    static commit(ctx, key, payload) {
        ctx.commit(String(key), payload);
    }
    /**
     * 生成默认MUTATIONS，函数名为state属性名
     * @param defineState 必须定义所有属性值
     */
    static generateMutations(defineState) {
        const result = {};
        Object.keys(defineState).forEach((key) => {
            result[key] = (state, payload) => state[key] = payload;
        });
        return result;
    }
    /**
     * 生成默认actions，函数名为state属性名
     * @param defineState 必须定义所有属性值
     */
    static generateActions(defineState) {
        const result = {};
        Object.keys(defineState).forEach((key) => {
            result[key] = (ctx, payload) => this.commit(ctx, key, payload);
        });
        return result;
    }
    /**
     * 生成默认GETTERS，函数名为state属性名
     * @param defineState 必须定义所有属性值
     */
    static generateGetters(defineState) {
        const result = {};
        Object.keys(defineState).forEach((key) => {
            result[key] = (state) => state[key];
        });
        return result;
    }
    /**
     * 生成Vuex实例
     *
     * @example
     * // ----------------------------
     * // file: store/mod/sys.ts
     * // ----------------------------
     * // 生成 Vuex.Module 规范对象
     * let sys = StoreTools.generate({
     *   token: '',
     *   resetTokenAction: null,
     * }, true, 'sys');
     * // 添加额外逻辑
     * sys = {
     *   ...sys,
     *   mutations: {
     *     ...sys.mutations,
     *     resetTokenAction: (state) => Jsons.clear(state)
     *   },
     *   actions: { ...sys.actions },
     *   getters: { ...sys.getters },
     * };
     * // 导出类型
     * export type SysT = ReturnType<typeof sys.__state_type__>;
     * export type SysP = ReturnType<typeof sys.__state_type_key__>;
     * // 导出对象
     * export { sys };
     *
     *
     * // ----------------------------
     * // file: store/index.ts
     * // ----------------------------
     *  export default createStore({
     *    modules: {
     *      [sys.__name__]: sys,
     *    },
     *  });
     *
     * @param og 状态对象或状态对象获取函数
     * @param [namespaced=true] 是否使用命名空间隔离
     * @param [name] 命名空间名称
     */
    static generate(og, namespaced = true, name = 'store') {
        const defaultState = Functions.execOrGetter(og);
        let state = { ...defaultState };
        return {
            namespaced: namespaced,
            get state() {
                return state;
            },
            mutations: { ...StoreTools.generateMutations(state) },
            actions: { ...StoreTools.generateActions(state) },
            getters: { ...StoreTools.generateGetters(state) },
            __reset__() {
                state = { ...defaultState };
            },
            __state_type__: Builders.getterSelf,
            __state_type_key__: Builders.getterSelf,
            __name__: name,
        };
    }
    /**
     * 给 BindingHelpers 添加参数类型提示
     * @param namespaced vuex.modules 注册的名称
     * @see namespace
     * @see namespaceX
     */
    static namespaceT(namespaced) {
        return Cast.as(vuexClass.namespace(namespaced));
    }
    /**
     * 从 Vuex.Module 实体获取命名空间注册名称, 并返回带类型 BindingHelpers。
     *
     * @example
     * // ----------------------------
     * // file: store/mod.ts
     * // ----------------------------
     * export class mod {
     *   // 手动指定类型
     *   static readonly sysMan = StoreTools.namespaceT<SysS>('sys');
     *   // 推导类型
     *   static readonly sysInfer = StoreTools.namespaceX(sys);
     * }
     *
     *
     * // ----------------------------
     * // file: views/System.vue
     * // ----------------------------
     * import { Vue } from 'vue-class-component';
     * export default System extends Vue {
     *   // 参数类型为 ReturnType<typeof sys.__state_type_key__>
     *   \@mod.sysMan.Getter('token') tokenMan!:string;
     *   // 参数类型为 ReturnType<typeof sysInfer.__state_type_key__>
     *   \@mod.sysInfer.Action('token') tokenInfer!:fns.Consume<string>;
     * }
     *
     * @function
     * @see StoreTools.generate
     */
    static namespaceX = Cast.nil;
}
__decorate([
    Decorators.proxy((thisArg, pmp, args) => {
        const store = args[0];
        return StoreTools.namespaceT(store.__name__);
    })
], StoreTools, "namespaceX", void 0);

class Broadcast {
    /**
     * 订阅关系
     *
     * K - 频道
     *
     * V - 处理器
     */
    subscribers = new Map();
    /**
     * 发送事件
     * @param channel 频道
     * @param args 事件参数
     */
    emit(channel, args) {
        const handlers = this.get(channel);
        Arrays.foreach(handlers, (el) => {
            Functions.call(el.item, args);
        });
        return this;
    }
    /**
     * 监听
     * @param channel 频道
     * @param fn 处理函数
     * @param [immediate=false] 是否立即执行一次
     * @param [lazy=0] 延迟执行, 仅<i>immediate===true</i>时有效
     * @param [args=undefined] 执行参数
     */
    on(channel, fn, immediate = false, lazy = 0, ...args) {
        this.get(channel).push(fn);
        if (immediate)
            Functions.timer(fn, false, lazy, false, ...args);
        return this;
    }
    /**
     * 取消监听
     * @param channel 频道
     * @param fn 处理函数
     */
    off(channel, fn) {
        const handlers = this.get(channel);
        Arrays.remove(handlers, fn);
        return this;
    }
    /**
     * 获取处理器数组
     * @param channel 频道
     * @private
     */
    get(channel) {
        let handlers = this.subscribers.get(channel);
        if (!handlers)
            this.subscribers.set(channel, handlers = []);
        return handlers;
    }
}

class Documents {
    /**
     * 复制文本
     * @param text 文本内容
     */
    static copyText(text) {
        return navigator.clipboard.writeText(text)
            .then(() => {
            Logs.debug('[CodeHL] navigator.clipboard 复制成功!');
            return true;
        })
            .catch(() => {
            const tmp = document.createElement('textarea');
            tmp.value = text;
            tmp.select();
            document.execCommand('copy');
            Logs.debug('[CodeHL ] document.execCommand 复制成功');
            return true;
        });
    }
}

exports.Arrays = Arrays;
exports.AsyncArrayStream = AsyncArrayStream;
exports.BError = BError;
exports.Broadcast = Broadcast;
exports.Builders = Builders;
exports.Cast = Cast;
exports.Condition = Condition;
exports.ConsoleLogger = ConsoleLogger;
exports.DataPool = DataPool;
exports.DataPoolKey = DataPoolKey;
exports.Dates = Dates;
exports.Decorators = Decorators;
exports.Delete = Delete;
exports.Documents = Documents;
exports.Events = Events;
exports.Filter = Filter;
exports.Functions = Functions;
exports.Get = Get;
exports.Jsons = Jsons;
exports.Logics = Logics;
exports.Logs = Logs;
exports.Objects = Objects;
exports.Observer = Observer;
exports.Post = Post;
exports.Promises = Promises;
exports.PropChains = PropChains;
exports.Put = Put;
exports.Request = Request;
exports.Storages = Storages;
exports.StoreTools = StoreTools;
exports.Strings = Strings;
exports.Switcher = Switcher;
exports.Validation = Validation;
