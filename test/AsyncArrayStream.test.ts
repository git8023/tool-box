import AsyncArrayStream from '../src/tools/AsyncArrayStream';

describe('AsyncArrayStream', () => {

  test('from data', () => {
    let times = 3;

    AsyncArrayStream
      .from([] as number[])
      .onBegin(data => {
        console.log('onBegin', data);
      })
      .onElement(data => {
        console.log('onElement', data);
      })
      .onEmpty(data => {
        console.log('onEmpty', data);
        return --times > 0 ? [] : [1, 2, 3];
      })
      .onDone(data => {
        console.log('onDone', data);
        return '1';
      })
      .getResult()
      .then((evt) => {
        expect(evt.result).toBe(1);
      });
  });

});
