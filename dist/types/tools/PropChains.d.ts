/**
 * 属性链工具
 */
export declare class PropChains {
    /**原始属性链*/
    origin: string;
    /**当前层级*/
    hierarchy: number;
    /**期望类型*/
    expectType: 'array' | 'object';
    /**当前节点属性名*/
    prop: string | number;
    /**值*/
    value: any;
    /**下个节点*/
    next: PropChains;
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
    /**
     * 设置对象属性值
     * @param o 数据对象
     * @param propChain 属性链
     * @param v 值
     */
    static setValue<T, R>(o: T, propChain: string, v: R): R;
    /**
     * 解析ognl表达式
     * @param chain 属性链表达式
     * @param [hierarchy=0] 属性层级, 外部调用不传
     */
    static parse(chain: string, hierarchy?: number): PropChains;
    /**
     * 设置每个层级对应值
     * @param o 对象
     * @param v 值
     * @private
     */
    private setValue;
}
