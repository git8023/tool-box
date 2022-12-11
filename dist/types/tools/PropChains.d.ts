/**
 * 属性链工具
 */
export declare class PropChains {
    /**
     * 获取数组对象的值
     * @param data 数据对象
     * @param ognl ognl表达式
     */
    static getArrOgnlVal(data: any, ognl: string): any;
    /**
     * 获取属性值
     * @param data 数据对象
     * @param ognl ognl表达式
     */
    static getValue<R>(data: any, ognl: string): R;
}
