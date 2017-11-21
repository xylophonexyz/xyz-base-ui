import {EnvironmentConfig} from './app/index';

export function getServerOriginFactory(): () => string {
  return () => getServerConfig().HOST;
}

export function getServerConfig(): EnvironmentConfig {
  return {
    PORT: process.env.PORT,
    API_ENDPOINT: process.env.API_ENDPOINT,
    API_VERSION: process.env.API_VERSION,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: process.env.REDIRECT_URI,
    SU_SCOPE: process.env.SU_SCOPE,
    HOST: process.env.HOST
  };
}

export {AppServerModule} from './app/app.server.module';
