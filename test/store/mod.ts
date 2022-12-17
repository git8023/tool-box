import { fns, StoreTools } from '../../src';
// @ts-ignore
import { sys, SysS } from './mod/sys2';

export class mod {
  static readonly sys = StoreTools.namespaceT<SysS>('sys');
  static readonly sys2 = StoreTools.namespaceX(sys);
}


class ModUse {
  @mod.sys.Getter('token') token!: string;
  @mod.sys.Action('token') setToken!: fns.Consume<string>;
}

describe('StoreTool', () => {

  test('StoreTools.namespaceX', () => {
    expect(typeof mod.sys2).toBe('function');
  });

});
