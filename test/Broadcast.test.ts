import { Broadcast } from '../src/tools/Broadcast';

describe('Broadcast.ts', () => {

  test('on()', () => {
    const broadcast = new Broadcast<string, any>();
    const fn1 = () => console.log('executed fn1');
    const fn2 = () => console.log('executed fn2');

    broadcast.on('foo', fn1);
    broadcast.on('foo', fn2);

    const fns = broadcast.subscribers.get('foo');
    expect(fns).toEqual([fn1, fn2]);
  });

  test('off()', () => {
    const broadcast = new Broadcast<string, any>();
    const fn1 = () => console.log('executed fn1');
    const fn2 = () => console.log('executed fn2');

    broadcast.on('foo', fn1);
    broadcast.on('foo', fn2);

    broadcast.off('foo', fn1);
    const fns = broadcast.subscribers.get('foo');
    expect(fns).toEqual([fn2]);
  });

});
