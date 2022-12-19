import { Logs } from '../src/tools/Logs';
import { PropChains } from '../src/tools/PropChains';

describe('PropChains', () => {
  let testStr = 'a';

  test('parse ' + testStr, () => {
    const propChains = PropChains.parse(testStr);
    Logs.info(propChains);
    expect(propChains.prop).toBe('a');
  });


  testStr = 'a.b';
  test('parse ' + testStr, () => {
    const propChains = PropChains.parse(testStr);
    Logs.info(propChains);
    expect(propChains.prop).toBe('a');
  });


  testStr = 'a[0].b';
  test('parse ' + testStr, () => {
    const propChains = PropChains.parse(testStr);
    Logs.info(propChains);
    expect(propChains.prop).toBe('a');
  });

  test('setValue a.b', () => {
    const obj: any = {};
    PropChains.setValue(obj, 'a.b', 1);
    Logs.debug('a.b', obj);
    expect(obj.a.b).toBe(1);
  });

  test('setValue a[1].b', () => {
    const obj: any = {};
    PropChains.setValue(obj, 'a[1].b', 1);
    Logs.debug('a.b', obj);
    expect(obj.a[1].b).toBe(1);
  });

  test('setValue a[0][1].b', () => {
    const obj: any = {};
    PropChains.setValue(obj, 'a[0][1].b', 1);
    Logs.debug('a[0][1].b', obj);
    expect(obj.a[0][1].b).toBe(1);
  });


  test('setValue a[1][1].b 2', () => {
    const obj: any = { a: [{foo:'x'}] };
    PropChains.setValue(obj, 'a[1][1].b', 1);
    Logs.debug('a[1][1].b', obj);
    expect(obj.a[1][1].b).toBe(1);
  });

});
