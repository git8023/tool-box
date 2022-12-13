export declare class Request {
    /**
     * Axios服务实例
     */
    static get axiosServe(): any;
    /**
     * response前置数据提取
     * @example
     * DataPool.set('AXIOS_EXTRACT_RESPONSE', (resp: AxiosResponse):T => {
     *   // e.g: {data:{code:UnifyResultCode, data:RealData, errorMessage:string}}
     *   return resp.data;
     * });
     */
    static get extractResponseData(): any;
}
/**
 * GET 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
export declare function Get(uri: string): (target: any, fnKey: string) => void;
/**
 * DELETE 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
export declare function Delete(uri: string): (target: any, fnKey: string) => void;
/**
 * POST 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
export declare function Post(uri: string): (target: any, fnKey: string) => void;
/**
 * PUT 请求
 * @param uri 请求地址，直接从 Swagger 拷贝
 * @constructor
 */
export declare function Put(uri: string): (target: any, fnKey: string) => void;
