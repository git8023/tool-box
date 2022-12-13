import axios from 'axios';
import { Logs } from '../src/tools/Logs';
import { DataPool } from '../src/decorator/data-pool';
import { Delete, Get, Post, Put } from '../src/decorator/http-request';
import { vmsNet } from '../src/types/vms-net';

const axiosService = axios.create({ url: '/', });
axiosService.interceptors.request.use(req => {
  Logs.info('Request interceptor: ', req.url, req.params, req.data);
  return req;
});
axiosService.interceptors.response.use(resp => {
  const cfg = resp.config;
  Logs.info('Response interceptor: ', cfg.url, resp.data);
  return resp;
});

DataPool
  .set('AXIOS_SERVICE', axiosService)
  .set('AXIOS_EXTRACT_RESPONSE', (resp) => resp.data!.data);

class NetApi {

  @Get('/test')
  static readonly get: vmsNet.GetMapping;

  @Post('/test')
  static readonly post: vmsNet.PostMapping;

  @Put('/test')
  static readonly put: vmsNet.PostMapping;

  @Delete('/test')
  static readonly delete: vmsNet.GetMapping;

  @Post('/test/{id}/update')
  static readonly postVars: vmsNet.PostMapping<void, { name: string }, { id: string }>;
}

describe('http-request', () => {

  test('GET', () => {
    NetApi.get().then(Logs.info).catch(Logs.warn);
  });

});
