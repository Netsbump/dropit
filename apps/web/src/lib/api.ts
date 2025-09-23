import { apiContract } from '@dropit/contract';
import { initClient } from '@ts-rest/core';
import config from '../config';

export const api = initClient(apiContract, {
  baseUrl: `${config.apiUrl}/api`,
  credentials: 'include',
});
