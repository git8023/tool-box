import { Docs } from '../src/decorator/docs';
import { Logs } from '../src/tools/Logs';

@Docs.c()
class DocsTest {

  @Docs.m()
  test() {
  }

  @Docs.m()
  test2() {
  }

}

describe('docs', () => {

  test('lib', () => {
    const doc = Array.from(Docs.libs).reduce((
      pv,
      [key, lib]
    ) => {

      const _apis = Array.from(lib._apis).reduce((
        pv,
        [k, l]
      ) => {
        pv[k] = l;
        return pv;
      }, {} as any);

      pv[key] = { ...lib, _apis };
      return pv;
    }, {} as any);

    Logs.info(JSON.stringify(doc, null, 4));
    expect(Docs.libs.size).toBe(1);
    expect(Docs.libs.get('DocsTest')).toBeTruthy();
    expect(Docs.libs.get('DocsTest')!._apis.size).toBe(2);
  });

});
