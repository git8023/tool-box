import { Arrays } from '../src/tools/Arrays';

type User = {
  name: string,
  age: number
}

describe('Arrays.ts', () => {

  test('toMap by single key', () => {
    const users: User[] = [{ name: 'foo', age: 18 }, { name: 'bar', age: 22 }];
    const nameMapper = Arrays.toMap(users, 'name');
    const names = Object.keys(nameMapper);
    expect(names).toEqual(['foo', 'bar']);
  });

  test('toMap by handler', () => {
    const users: User[] = [{ name: 'foo', age: 18 }, { name: 'bar', age: 22 }];
    const mapper = Arrays.toMap(users, data => data.item.age);
    expect(Object.keys(mapper)).toEqual(['18', '22']);
    expect(Object.values(mapper)).toEqual(users);
  });

  test('intersectionSimple primary', () => {
    const a = [1, 2, 3];
    const b = [2, 3, 4];
    const c = Arrays.intersectionSimple([a, b]);
    expect([2, 3]).toEqual(c);
  });

  test('intersectionSimple object', () => {
    const el = { foo: -1 };
    const a = [{ foo: 1 }, { foo: 2 }, el];
    const b = [{ foo: 2 }, { foo: 3 }, el];
    const c = Arrays.intersectionSimple([a, b]);
    expect([el]).toEqual(c);
  });

  test('intersection', () => {
    const el = { foo: 3, bar: 3 };
    const a = [{ foo: 1, bar: 1 }, { foo: 2, bar: 2 }, { foo: 3, bar: 3 }, el];
    const b = [{ foo: 2, bar: 1 }, el];

    const r1 = Arrays.intersection(a, b, 'foo');
    expect(r1.map(e => e.foo)).toEqual([2, 3, el.foo]);

    const r2 = Arrays.intersection(a, b, 'bar');
    expect(r2.map(e => e.bar)).toEqual([1, 3, el.bar]);

    const r3 = Arrays.intersection(a, b);
    expect(r3[0]).toEqual(el);
  });

  test('seek', () => {
    const a = [{ foo: 1, bar: [{ foo: 1, x: 1 }] }, { foo: 2, bar: [{ foo: 21, x: 2 }] }];
    expect(Arrays.seek(a, e => e.item.foo === -1)).toBeUndefined();
    expect(Arrays.seek(a, e => e.item.foo === 1)!.item).toEqual(a[0]);
    const recursion = Arrays.seek(a, e => e.item.foo === 21, e => e.item.bar as any);
    expect(recursion!.item).toEqual({ foo: 21, x: 2 });
  });

  test('pushUnique', () => {
    {
      // primitive
      const primitiveA = [1, 2, 3];
      const appendIndex = Arrays.pushUnique(primitiveA, 4);
      expect(appendIndex).toBe(primitiveA.indexOf(4));
      expect(primitiveA.length).toBe(4);
      const existIndex = Arrays.pushUnique(primitiveA, 1);
      expect(existIndex).toBe(primitiveA.indexOf(1));
    }

    {
      // complex
      const data = [{ name: 'foo', children: [{ name: 'foo' }] }, { name: 'bar' }];
      expect(Arrays.pushUnique(data, { name: 'newly' }, 'name')).toBe(data.length - 1);
      expect(Arrays.pushUnique(data, { name: 'foo' }, el => el.item.name === 'foo')).toBe(0);
    }
  });

  test('index', () => {
    {
      // primitive
      const a = [1, 2, 3];
      const el = Arrays.index(a, 2);
      expect(el).toEqual({ item: 2, index: 1 });
    }

    {
      // complex
      const a = [{ foo: 1 }, { foo: 2 }];
      expect(Arrays.index(a, { foo: 2 }, 'foo')).toEqual({ item: { foo: 2 }, index: 1 });
      expect(Arrays.index(a, { foo: 3 }, 'foo')).toEqual({ item: undefined, index: -1 });
    }
  });

});
