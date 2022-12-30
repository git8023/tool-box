# API文档
[API说明文档](https://git8023.github.io/tool-box/doc/index.html)

# 特别说明

收集日常工作中用到提取的工具函数, 方案提取自 Vue3.x + TS + VCS(Vue-Class-Component) 项目类型。
如果有疑问或一些想法(比如期望得到某种类型的工具)欢迎留言: [Discussions](https://github.com/git8023/tool-box/discussions)

- 规则：
    - 原生类增强工具：原始类型后添加`s`  
      例如：`Objects`/`Arrays`/`Promises`等
    - 其他工具：尽量与`增强`类型区分开
    - 尽量使用类型约束, 减少错误产生概率
    - 基于一些个人爱好创造一些特殊轮子

# 安装

```shell
$ npm install @hyong8023/tool-box@latest
# or
$ yarn add @hyong8023/tool-box@latest
```

# 目的

## 抽取重复逻辑隔离变化

```ts
// 数组Key映射，提高元素查询速度
interface User {
  id: any;
  name: string;
  age?: number;
}

type Users = User[];
const users: Users = [
  { id: 1, name: 'ZShan' },
  { id: 2, name: 'LSi', age: 23 }
];
let userIdMapper = Arrays.toMap(users, 'id');
// userIdMapper => {
//   1:{id:1, name:'ZShan'},
//   2:{id:2, name:'LSi', age:23}
// }

// JSON操作
let data = {
  name: 'Foo',
  address: {
    city: 'ChengDu'
  }
}
let city = Jsons.get(data, 'address.city');
// city => ChengDu
Jsons.computeIfAbsent(data, 'address.province', 'SiChuan');
// data.address.province => SiChuan
Jsons.computeIfAbsent(data, 'address.province', 'YunNan');
// data.address.province => SiChuan
```

## 简化模板代码

### Axios

```ts
// http-request.ts 提供的装饰器简化axios模板代码
export class UserServeApi {

  // 常规方案
  static readonly update = (
    id: string,
    user: User,
  ) => axiosRequest.post(`/users/update/${id}`, user).then(({ data }) => data);

  // 装饰器方案
  @Post('/users/update/{id}')
  static readonly update: vmsNet.PostMapping<boolean, User, Pick<User, 'id'>>;
}
```

### Vuex

```ts
// ----------------------------
// file: store/mod/sys.ts
// ----------------------------
let sys = StoreTools.generate({
  token: ''
}, true, 'sys');
// 导出类型
export type SysT = ReturnType<typeof sys.__state_type__>;
export type SysP = ReturnType<typeof sys.__state_type_key__>;
// 导出对象
export { sys };


// ----------------------------
// file: store/index.ts
// ----------------------------
export default createStore({
  modules: {
    [sys.__name__]: sys
  });


// ----------------------------
// file: store/mod.ts
// ----------------------------
export class mod {
  // 手动指定类型
  static readonly sysMan = StoreTools.namespaceT<SysS>('sys');
  // 推导类型
  static readonly sysInfer = StoreTools.namespaceX(sys);
}


// ----------------------------
// file: views/System.vue
// ----------------------------
import { Vue } from 'vue-class-component';

export default System
extends
Vue
{
  // 参数类型为 ReturnType<typeof sys.__state_type_key__>
@mod.sysMan.Getter('token')
  tokenMan!
:
  string;
  // 参数类型为 ReturnType<typeof sysInfer.__state_type_key__>
@mod.sysInfer.Action('token')
  tokenInfer!
:
  fns.Consume<string>;
}
```

# 其他工具

## Vue方法增强 (`Event`)

```ts
import { Events } from "./events";

export default class UserList extends Vue {
  users: User[] = [];

  onSearch() {
    UserServeApi.listAll().then((data) => this.users = data);
  }

  // 服务器数据有变化时, 总是需要更新页面列表
  @Events.observeRun<UserList>({ after: 'onSearch' })
  onDel(id: string) {
    return UserServeApi.delById(id);
  }
}
```

- 数组异步处理 (`AsyncArrayStream`)
- 单频段广播 (`Broadcast`)
- 逻辑包装 (`Switcher`, `Condition`)
- 验证器 (`Validation`)
