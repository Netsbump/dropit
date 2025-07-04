import { apiContract } from '@dropit/contract';
import { initClient } from '@ts-rest/core';

export const api = initClient(apiContract, {
  baseUrl: 'http://localhost:3000/api',
  credentials: 'include',
});
