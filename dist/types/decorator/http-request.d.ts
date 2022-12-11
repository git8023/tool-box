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
