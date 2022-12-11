import { namespace } from 'vuex-class';
import { reactive, ref } from 'vue';

export class Store {

  static readonly sys = namespace('sys');

}

const x = ref(1);
x.value;

const o = reactive({x});
