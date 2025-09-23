FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder

WORKDIR /dropit
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY ./apps/web/ ./apps/web/
COPY ./packages/contract/ ./packages/contract/
COPY ./packages/schemas/ ./packages/schemas/
COPY ./packages/permissions/ ./packages/permissions/
COPY ./packages/i18n/ ./packages/i18n/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

FROM nginx:alpine

WORKDIR /usr/share/nginx/

RUN rm -rf html
RUN mkdir html

COPY --from=builder /dropit/apps/web/dist /usr/share/nginx/html

WORKDIR /

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]