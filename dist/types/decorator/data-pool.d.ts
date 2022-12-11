import { types } from '../types/types';
export declare class DataPoolKey {
    static readonly AXIOS_SERVICE: unique symbol;
}
declare type DataPoolKeys = types.KeyOfOnly<typeof DataPoolKey>;
export declare class DataPool {
    private static readonly POOL;
    static get(key: DataPoolKeys): any;
    static set(key: DataPoolKeys, o: any): void;
}
export {};
