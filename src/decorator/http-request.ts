import { vo } from '../types/vo';
import { vmsNet } from '../types/vms-net';
import { Validation } from '../tools/Validation';
import { DataPool } from './data-pool';

class Request {
  static get axios() {
    return DataPool.get('AXIOS_SERVICE');
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
      return Request.axios.get(filledUri, { params: args!.params }).then(extractResponseData);
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
    if (Validation.isNot(varVal, 'String') && Validation.isNot(varVal, 'Number'))
      throw new Error(`缺少路径变量[${varName}]配置`);
    return varVal.toString();
  });
};

/**
 * 从统一响应结构中提取目标数据
 * @param resp 响应数据
 */
const extractResponseData = <T>(resp: vo.AxiosResponse<T>): T => {
  return resp.data.data!;
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
      return Request.axios[method](filledUri, args.params).then(extractResponseData);
    };

  };
};
