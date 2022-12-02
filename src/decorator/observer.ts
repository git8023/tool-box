import { Logs } from '../tools/Logs';

export class Observer {

  /**
   * 记录日志
   * @param [params=true] 打印请求参数
   * @param [returns=false] 打印返回值
   */
  static log(
    params = true,
    returns = true
  ) {
    return (
      target: any,
      fnKey: string
    ) => {

      const prefix = `[${fnKey}] `;
      const fn = target[fnKey];
      target[fnKey] = (...args: any[]) => {
        if (params)
          Logs.debug(prefix, ' Parameters: ', args);

        const data = fn(...args);
        if (returns)
          Logs.debug(prefix, ' Returns: ', data);

        return data;
      };

    };
  }

}
