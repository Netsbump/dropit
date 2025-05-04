import { apiContract } from '@dropit/contract';
import { generateOpenApi } from '@ts-rest/open-api';

export const openApiDocument = generateOpenApi(apiContract, {
  info: {
    title: 'DropIt API',
    version: '1.0.0',
    description: 'API documentation for DropIt application',
  },
  servers: [{ url: 'http://localhost:3001' }],
});
