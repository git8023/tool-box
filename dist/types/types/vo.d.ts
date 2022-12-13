export declare namespace vo {
    /**
     * 服务器返回数据统一结构
     */
    interface R<T = any> {
        code?: number;
        data?: T;
        message?: string;
    }
    type AxiosResponse<T = any> = {
        data?: {
            data?: T;
            [s: string | number]: any;
        };
        [s: string | number]: any;
    };
}
