import { Promises } from '../src/tools/Promises';
import { Logs } from '../src/tools/Logs';

describe('Promises', () => {

  test('control', () => {
    const pc = Promises
      .control(new Promise((resolve) => {
        setTimeout(resolve, 3000, 1);
      }));
    pc.then(Logs.info).catch(Logs.warn);
    pc.abort();
  });

});
