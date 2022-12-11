export declare class Strings {
    /**
     * 字符串替换
     * @param s 字符串
     * @param cfg 属性名:正则表达式分组字符串, 属性值:要替换的值
     */
    static replaceAll(s?: string, cfg?: {
        [s: string]: string;
    }): string;
    /**
     * 校验是否包含空字符串
     * @param [useTrim=true] 是否去除两端空格
     * @param arr  被检测字符串
     * @return 包含至少一个空字符串返回true, 否则返回false
     */
    static hasBlank(useTrim?: boolean, ...arr: string[]): boolean;
    /**
     * 空字符串校验
     * @param s  字符串
     * @param [useTrim=true]  是否去除两端空格
     * @return 空字符串返回true, 否则返回false
     */
    static isBlank(s: string, useTrim?: boolean): boolean;
    /**
     * 生成唯一ID
     * @return 唯一字符串
     */
    static guid(): string;
    /**
     * 对象转string
     * @param o 对象
     */
    static toString(o: any): string;
    /**
     * 去掉两端空格, s为null/undefined时返回''
     * @param s 源字符串
     */
    static trimToEmpty(s: string): string;
    /**
     * HTML内容转义为普通文本
     * @param html HTML内容
     * @return HTML转义后字符串
     */
    static html2text(html: any): string;
    /**
     * 普通文本转HTML内容
     * @param text 普通文本
     * @return HTML标签(转义后)还原
     */
    static text2html(text: any): string;
}
