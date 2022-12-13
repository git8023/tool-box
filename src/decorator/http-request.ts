import { vmsNet } from '../types/vms-net';
import { Validation } from '../tools/Validation';
import { DataPool } from './data-pool';
import { Logs } from '../tools/Logs';
import { Builders } from '../tools/Builders';

export class Request {

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
export function Get(uri: string) {
  return (
    target: any,
    fnKey: string,
  ) => {
    target[fnKey] = (args?: vmsNet.Parameters) => {
      args = args || {};
      const filledUri = setPathVariable(uri, args);
      return Request.axiosServe.get(filledUri, { params: args!.params }).then(Request.extractResponseData);
    };
  };
}

/**
 * DELETE 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
export function Delete(uri: string) {
  return generateWithPost(uri, 'delete');
}

/**
 * POST 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
export function Post(uri: string) {
  return generateWithPost(uri, 'post');
}

/**
 * PUT 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
export function Put(uri: string) {
  return generateWithPost(uri, 'put');
}

/**
 * 设置路径参数
 * @param uri 请求地址
 * @param args 请求参数
 */
const setPathVariable = (
  uri: string,
  args: vmsNet.Parameters,
): string => {
  const pathVariables: any = args.pathVariables || {};
  return uri.replaceAll(/({[^/]+})/g, (varUnit) => {
    const varName = varUnit.match(/{(.+)}/)![1];
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
const generateWithPost = (
  uri: string,
  method: 'post' | 'put' | 'delete',
) => {
  return (
    target: any,
    fnKey: string,
  ) => {

    target[fnKey] = (args?: vmsNet.Parameters<any, any>) => {
      args = args || {};
      const filledUri = setPathVariable(uri, args);
      return Request.axiosServe[method](filledUri, args.params).then(Request.extractResponseData);
    };

  };
};
