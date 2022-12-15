import { fns } from '../types/fns';
import { types } from '../types/types';
export declare type ProxyMethodParameter = {
    /**目标对象*/
    target: any;
    /**目标函数属性名*/
    key: string;
    /**
     * 属性值或函数, 未绑定到target
     *
     * vof: Value Or Function
     */
    vof: any;
};
/**
 * 装饰器工具类
 */
export declare class Decorators {
    /**
     * 生成类(class)装饰
     * @param call 装饰器逻辑
     */
    static readonly class: <T = Function>(call: fns.Consume<types.DecoratorClassParameter<T>>) => (target: T) => void;
    /**
     * 生成函数(Function)装饰器
     * @param call 装饰器逻辑
     */
    static readonly method: <T = any>(call: fns.Consume<types.DecoratorMethodParameter<T>>) => (target: T, fnKey: string) => void;
    /**
     * 代理
     * @param call 属性代理逻辑
     */
    static readonly proxy: (call: fns.HandlerT9<any, any, ProxyMethodParameter, any[]>) => (target: any, fnKey: string) => void;
}
