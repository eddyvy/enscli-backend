ARG NODE_VERSION=22.6.0
ARG PNPM_VERSION=9.9.0

FROM node:${NODE_VERSION}-slim as build
LABEL fly_launch_runtime="NestJS"
WORKDIR /app
ENV NODE_ENV="production"
RUN npm install -g pnpm@$PNPM_VERSION
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY . .
RUN pnpm run build
RUN pnpm prune --prod

FROM node:${NODE_VERSION}-alpine
COPY --from=build /app/dist/ /app/
COPY --from=build /app/package.json /app/
COPY --from=build /app/node_modules/ /app/node_modules/
EXPOSE 3000
CMD [ "node", "/app/main" ]
