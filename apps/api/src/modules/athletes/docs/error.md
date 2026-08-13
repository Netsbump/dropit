# Athletes error handling

The `athletes` bounded context does not throw NestJS HTTP exceptions from the domain/application core.

Instead:

1. Domain objects throw domain errors.
2. Application use cases convert expected domain errors to application errors.
3. HTTP controllers let errors bubble up.
4. `AthleteExceptionFilter` converts errors to HTTP responses.

## Error flow

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant HTTP as Controller
  participant App as Use case
  participant Domain
  participant Filter

  Client->>HTTP: Request
  HTTP->>App: Execute use case

  alt Success
    App->>Domain: Build / update object
    Domain-->>App: Valid domain object
    App-->>HTTP: Result
    HTTP-->>Client: 2xx response
  else Expected application error
    App--xHTTP: Throw known BC error
    HTTP--xFilter: Bubble up
    Filter-->>Client: statusCode + message
  else Domain validation error
    App->>Domain: Build / update object
    Domain--xApp: Throw DomainError
    App--xHTTP: Convert to Invalid* error
    HTTP--xFilter: Bubble up
    Filter-->>Client: 400 + message
  else Unexpected technical error
    App--xHTTP: Throw unknown error
    HTTP--xFilter: Bubble up
    Filter->>Filter: Log stack
    Filter-->>Client: 500 + generic message
  end
```

## Filter mapping

```mermaid
flowchart TD
  E([Error thrown]) --> F[AthleteExceptionFilter]
  F --> T{Error type}

  T -->|Known BC error| B[Use its statusCode and message]
  T -->|Nest HttpException| H[Use Nest status and message]
  T -->|Unknown error| U[Log server-side stack]

  U --> G[Return generic 500 message]

  B --> R([HTTP JSON response])
  H --> R
  G --> R
```

Known BC errors are:

| Error family | Source | Example HTTP result |
| --- | --- | --- |
| `AthleteApplicationError` | Athlete profile use cases and access policy | `403`, `404`, `400` |
| `PersonalRecordException` | Personal record use cases | `400`, `404` |
| `CompetitorStatusException` | Competition status use cases | `400`, `404` |

## Rules of thumb

- Domain objects throw domain errors only.
- Application use cases convert domain validation errors to application errors with HTTP-safe status codes.
- Controllers do not translate business errors manually.
- `AthleteExceptionFilter` is responsible for converting known errors to HTTP responses.
- Unknown technical errors are logged server-side and returned as a generic `500` message.
