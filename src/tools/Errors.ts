import Validation from '@/tools/Validation';

export default class Errors {

  /**
   * 包装为错误对象
   * @param e 错误信息或错误对象
   */
  static from(e: any): Error {
    return Validation.is(e, 'Error') ? e : Error(e);
  }
}
