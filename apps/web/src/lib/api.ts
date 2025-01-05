import { exerciseContract } from '@dropit/contract';
import { initClient } from '@ts-rest/core';

export const api = initClient(exerciseContract, {
  baseUrl: 'http://localhost:3001',
  baseHeaders: {},
});
