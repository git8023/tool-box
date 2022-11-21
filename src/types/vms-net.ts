export namespace vmsNet {

  /**
   * GET 请求参数
   *
   * @param P Parameter
   *
   * @param PV Path Variable
   *
   * @function
   */
  export interface Parameters<P = void, PV = void> {
    /**
     * 路径变量
     * - /api/{id} => {id:1}
     * - /api/{companyId}/{organizeId} => {company:1, organizeId:2}
     */
    pathVariables?: PV;

    /**
     * 常规参数
     * - 数据追加到 {params}
     * @see AxiosRequestConfig.params
     */
    params?: P;
  }

  /**
   * GET 请求函数定义
   *
   * @param R Return
   *
   * @param P Parameter
   *
   * @param PV Path Variable
   *
   * @function
   */
  export interface GetMapping<R, P = void, PV = void> {
    (args?: Parameters<P, PV>): Promise<R>
  }

  /**
   * POST 请求函数定义
   *
   * @param R Return
   *
   * @param P Parameter
   *
   * @param PV Path Variable
   *
   * @function
   */
  export interface PostMapping<R = void, P = void, PV = void> {
    (args?: Parameters<P, PV>): Promise<R>
  }

}
