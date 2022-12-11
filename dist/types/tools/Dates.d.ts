export declare class Dates {
    /**
     * 解析日期字符串或格式化为另一种日期规则字符串
     * @param dateStr 源日期字符串
     * @param inFmt 源日期字符串格式
     * @param [outFmt=undefined] 输出日期字符串格式
     * @return 当指定outFmt时输出日期字符串, 否则返回日期对象
     */
    static datePoF(dateStr: string, inFmt: string, outFmt?: string): Date | string | null;
    /**
     * 解析日期字符串
     * @param dateStr 源日期字符串
     * @param pattern 解析规则(yMDHmsS)
     * @return {Date | null} 解析成功返回日期对象, 否则返回null
     */
    static dateParse(dateStr: string, pattern: string): Date | null;
    /**
     * 日期格式化
     * @param date 日期对象或毫秒值
     * @param [format="yyyy-MM-dd HH:mm:ss"] 格式化规则, 默认: yyyy-MM-dd HH:mm:ss
     * @return成功返回日期字符串, 否则返回undefined
     */
    static dateFmt(date: Date | number | string, format?: string): string;
    /**
     * 比较两个日期
     * @param d1 第一个日期
     * @param [d2=now]  第二个日期
     * @return {number} 正数:d1>d2, 0:d1=d2, 负数:d1<d2, NaN:d1无效
     */
    static dateDiff(d1: Date, d2?: Date): number;
    /**
     * 格式化输出当前时间
     * @param format 日期格式
     * @return 日期格式字符串
     */
    static nowFmt(format?: string): string;
}
