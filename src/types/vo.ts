export namespace vo {

  /**
   * 服务器返回数据统一结构
   */
  export interface R<T = any> {
    code?: number;
    data?: T;
    message?: string;
  }

  export type AxiosResponse<T> = {
    data: {
      data?: T
    }
  }

}
