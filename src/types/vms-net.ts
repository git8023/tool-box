export namespace vmsNet {

  /**
   * GET 请求参数
   *
   * @param P Parameter, 请求参数
   *
   * @param PV PathVariable, 路径参数常用于RESTFul实现
   *
   * @function
   */
  export interface Parameters<P = void, PV = void> {
    /**
     * 路径变量
     * @example
     *
     * class NetApi {
     *   @Put('/api/{id}/{status}')
     *   static readonly get:vmsNet.Parameters<any, {id:string, status:'ENABLE'|'DISABLE'}}>;
     * }
     *
     * NetApi.get({pathVariables: {id:1, status:'DISABLE'}})
     */
    pathVariables?: PV;

    /**
     * 常规参数
     * @see AxiosRequestConfig.params
     */
    params?: P;
  }

  /**
   * GET 请求函数定义
   *
   * @param R Return,返回值类型
   *
   * @param P Parameter, 请求参数
   *
   * @param PV PathVariable, 路径参数常用于RESTFul实现
   *
   * @function
   */
  export interface GetMapping<R = void, P = void, PV = void> {
    (args?: Parameters<P, PV>): Promise<R>
  }

  /**
   * POST 请求函数定义
   *
   * @param R Return,返回值类型
   *
   * @param P Parameter, 请求参数
   *
   * @param PV PathVariable, 路径参数常用于RESTFul实现
   *
   * @function
   */
  export interface PostMapping<R = void, P = void, PV = void> extends GetMapping<R, P, PV> {
  }

}
