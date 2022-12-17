interface Bean {
  name: string;
  children?: Bean[];
  children2?: string[];
}

const fn = <
  // T extends Partial<{ [p in K]: T[] }>,
  // T extends Record<K, T[]>,
  T extends { [p in K]: T[] },
  K extends keyof T = keyof T
>(
  o: T,
  key: K
) => {
};

const bean: Bean = {} as any;

// OK
fn(bean, 'children');

// TS2345: Argument of type 'Bean' is not assignable to parameter of type '{ children2?: Bean[] | undefined; }'.
//   Types of property 'children2' are incompatible.
//     Type 'string[] | undefined' is not assignable to type 'Bean[] | undefined'.
//       Type 'string[]' is not assignable to type 'Bean[]'.
//         Type 'string' is not assignable to type 'Bean'.
// fn(bean, 'children2');
