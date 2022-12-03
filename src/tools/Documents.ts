import { Logs } from './Logs';

export class Documents {

  /**
   * 复制文本
   * @param text 文本内容
   */
  static copyText(text: string): Promise<boolean> {
    return navigator.clipboard.writeText(text)
      .then(() => {
        Logs.debug('[CodeHL] navigator.clipboard 复制成功!');
        return true;
      })
      .catch(() => {
        const tmp = document.createElement('textarea');
        tmp.value = text;
        tmp.select();
        document.execCommand('copy');
        Logs.debug('[CodeHL ] document.execCommand 复制成功');
        return true;
      });
  }

}
