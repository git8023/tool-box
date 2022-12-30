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

});
