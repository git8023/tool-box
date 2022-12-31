import { Functions } from '../src/tools/Functions';
import { Logs } from '../src/tools/Logs';
import { Builders } from '../src/tools/Builders';
import { Cast } from '../src/tools/Cast';
import { Jsons } from '../src/tools/Jsons';


describe('Jsons test', () => {

  test('foreach: Syntax Checking', () => {
    const t: {
      a: object;
      b: string;
      c: number;
    } = Cast.anyO;
    Jsons.foreach(t, Builders.getterSelf);

    const t1 = t as Partial<typeof t>;
    Jsons.foreach(t1, Builders.getterSelf);

    expect(0).toEqual(0);
  });

  test('foreach: Async', () => {
    const data = { foo: 1, bar: 2 };
    Logs.debug('>> 1');
    Jsons
      .foreach(data, ({ item, index }) => {
        return new Promise(resolve => {
          Functions.timer(resolve,false, 1000);
        });
      }, false)
      .then((data) => {
        Logs.debug('>> 2', data);
        expect(1).toEqual(1);
      });
    Logs.debug('>> 3');
  });

});
