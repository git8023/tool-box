import { Jsons } from '../tools/Jsons';

export class Exception implements Error {

  private root!: Error;
  private _message!: string;

  get name() {
    return Jsons.get<string>(this.root, 'name');
  }

  get cause() {
    return Jsons.get(this.root, 'cause');
  }

  get message() {
    return this._message;
  }

  static of(
    s: string,
    e?: Error
  ) {
    const me = new Exception();
    me._message = s;

    if (e) {
      me.root = e;
      me._message += '\n -> ' + e?.message;
    }

    return me;
  }

}
