# 特别说明

收集日常工作中用到提取的工具函数, 方案提取自 Vue3.x + TS + VCS(Vue-Class-Component) 项目类型。
如果有疑问或一些想法(比如期望得到某种类型的工具)欢迎留言: [Discussions](https://github.com/git8023/tool-box/discussions)

- 规则：
    - 原生类增强工具：原始类型后添加`s`  
      例如：`Objects`/`Arrays`/`Promises`等
    - 其他工具：尽量与`增强`类型区分开
    - 尽量使用类型约束, 减少错误产生概率
    - 基于一些个人爱好创造一些特殊轮子

# 目的

1. 抽取重复逻辑隔离变化
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

2. 简化模板代码

    - Axios([http-request](./src/decorator/http-request.md))
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

    - Vuex
   ```ts
    // @file: store/mod/user.ts
    // 定义通用状态类
    import {
      ActionTree, GetterTree, Module, MutationTree,
    } from 'vuex';
    import { StoreTools, types } from '@hyong8023/tool-box';
    // 通过函数生成可以很方便还原初始状态
    function getDefaultState() {
      return {
        token: '',
      };
    }
    const state = getDefaultState();
    type T = typeof state;
    class UserStore implements Module<T, any> {
      namespaced = true;
      state = state;
      mutations: MutationTree<T> = { ...StoreTools.generateMutations(state) };
      actions: ActionTree<T, any> = { ...StoreTools.generateActions(state) };
      getters: GetterTree<T, any> = { ...StoreTools.generateGetters(state) };
    }
    export type UserState = T;
    export type UserStateK = keyof UserState;
    export const user = new UserStore();
    
    
    // @file: store/index.ts
    // 注册到vuex
    import { createStore } from 'vuex';
    import system from '@/store/mod/user'; 
    import { namespace } from "vuex-class";
    export default createStore({
      modules: {
        user,
      },
    });
   
    // @file: store/mod/index.ts
    // 使用vuex-class工具
    export class mod {
      static readonly user = namespace('user')
    }
   
    // @file: views/user/UserInfo.vue
    export default class UseInfo extends Vue {
      // '' as Type: 类型推导, 可以通过IDE实现智能提示, 防止单词写错
      @mod.user.Getter('token' as UserStoreK) token!:string;
    }
    ```

3. 其他工具
    - Vue方法增强 (`Event`)
    ```ts
    import { Events } from "./events";
    export default class UserList extends Vue {
      users:User[] = [];
   
      onSearch() {
        UserServeApi.listAll().then((data)=>this.users = data);
      }
   
      // 服务器数据有变化时, 总是需要更新页面列表
      @Events.observeRun<UserList>({after: 'onSearch'})
      onDel(id:string) {
        return UserServeApi.delById(id);
      }
    }
    ```
    - 数组异步处理 (`AsyncArrayStream`)
    - 单频段广播 (`Broadcast`)
    - 逻辑包装 (`Switcher`, `Condition`)
    - 验证器 (`Validation`)
