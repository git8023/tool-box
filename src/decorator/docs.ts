import { Decorators } from './decorators';
import { BError } from '../tools/BError';
import { Strings } from '../tools/Strings';
import { Jsons } from '../tools/Jsons';
import { Cast } from '../tools/Cast';

type Target = (Function | Object) & { __lib_name__?: string, [s: string]: any };
type Api = {
  _name: string,
  _params: any[],
  _returnType: any,
  _note: string,
  _fn: Function
}
type Lib = {
  _name: string,
  _core: Function | any,
  _apis: Map<string, Api>
}

export class Docs {

  static readonly libs = new Map<string, Lib>();

  /**
   * 类注解
   * @param [name] 类(别)名
   */
  static readonly c =
    (name?: string) =>
      Decorators.class(({ target }) => this.setC(name ?? (target as Function).name, target));

  /**
   * 函数注解
   * @param [name] 函数(别)名
   */
  static readonly m =
    (name?: string) =>
      Decorators.method(({ target, fnKey }) => this.setF(target, fnKey, name));

  /**
   * 设置类标识
   * @param name 类名或类别名
   * @param target 类定义对象
   * @param [resetName=true] 是否重命名标记
   * @private
   */
  private static setC(
    name: string,
    target: Target,
    resetName = true
  ) {
    // BError.iff(this.libs.has(name), `文档库标识已存在: ${name}`);

    const libName = target.__lib_name__! || Jsons.get(target, 'prototype.__lib_name__');

    // 是否已经存在
    let lib = this.libs.get(libName);
    if (lib) {
      if (resetName && name !== libName) {
        this.libs.delete(libName);
        lib._name = name;
      }
      target.__lib_name__ = name;
      this.libs.set(name, lib);
      return lib;
    }

    target.__lib_name__ = name;
    lib = {
      _name: name,
      _core: target,
      _apis: new Map()
    };
    this.libs.set(name, lib);
    return lib;
  }

  /**
   * 设置函数文档
   * @param target 类对象或类自身
   * @param fnKey 源函数属性名
   * @param [name] 别名
   * @private
   */
  private static setF(
    target: Target,
    fnKey: string,
    name?: string,
  ) {
    const originFn = target[fnKey] as Function;

    let lib = this.libs.get(target.__lib_name__!)!;
    // BError.iff(!lib, `文档库标识不存${originFn.name}, 是否缺失class装饰器? @Docs.c()`);
    lib = lib || this.setC(Strings.guid(), target, false);

    const api = lib._apis.get(fnKey!)!;
    BError.iff(!api, `文档库标识[${name}]已存在同名函数标识[${fnKey}], 源函数名: ${Jsons.get(api, '_fn.name')}`);

    lib._apis.set(fnKey!, {
      _name: name ?? fnKey,
      _fn: originFn,
      _note: originFn.name,
      _params: Cast.nil,
      _returnType: originFn.name
    });
  }

}
