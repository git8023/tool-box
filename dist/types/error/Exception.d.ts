export declare class Exception implements Error {
    private root;
    private _message;
    get name(): string;
    get cause(): unknown;
    get message(): string;
    static of(s: string, e?: Error): Exception;
}
