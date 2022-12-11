# HttpRequest装饰器基本用法

1. 注入`AXIOS_SERVICE`

```ts
import { DataPool } from "./data-pool";

// 参考axios官网配置
const axiosRequestService = {};
DataPool.set('AXIOS_SERVICE', axiosRequestService)
```

2. 定义网络请求api

```ts
import { Get, Put, Post, Delete } from "./http-request";

export default class UserApi {

  @Get('/profile')
  static readonly profile: vmsNet.GetMapping<entity.UserEntity>;

  @Put('/profile')
  static readonly updateProfile: vmsNet.PostMapping<void, Pick<entity.UserEntity, 'telephone'>>;

  @Post('/login')
  static login: vmsNet.PostMapping<entity.UserEntity, Pick<entity.UserEntity, 'account' | 'password'>>;

  @Delete('/remove/{id}')
  static readonly remove: vmsNet.GetMapping<void, void, Pick<entity.UserEntity, 'id'>>;
}

```
