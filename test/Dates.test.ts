import Dates from '../src/tools/Dates';

describe('Dates.ts', () => {

  it('dateParse', () => {
    const date = Dates.dateParse('2022/11-09 13:34/56', 'yyyy/MM-dd HH:mm/ss')!;
    expect(date.getTime()).toBe(new Date('2022-11-09 13:34:56').getTime());
  });

});
