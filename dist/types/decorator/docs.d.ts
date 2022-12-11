declare type Api = {
    _name: string;
    _params: any[];
    _returnType: any;
    _note: string;
    _fn: Function;
};
declare type Lib = {
    _name: string;
    _core: Function | any;
    _apis: Map<string, Api>;
};
export declare class Docs {
    static readonly libs: Map<string, Lib>;
    /**
     * 类注解
     * @param [name] 类(别)名
     */
    static readonly c: (name?: string) => (target: Function) => void;
    /**
     * 函数注解
     * @param [name] 函数(别)名
     */
    static readonly m: (name?: string) => (target: any, fnKey: string) => void;
    /**
     * 设置类标识
     * @param name 类名或类别名
     * @param target 类定义对象
     * @param [resetName=true] 是否重命名标记
     * @private
     */
    private static setC;
    /**
     * 设置函数文档
     * @param target 类对象或类自身
     * @param fnKey 源函数属性名
     * @param [name] 别名
     * @private
     */
    private static setF;
}
export {};
