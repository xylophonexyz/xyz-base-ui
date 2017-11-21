import * as express from 'express';
import {Express} from 'express';
import * as httpProxy from 'http-proxy';
import {EnvironmentConfig} from './app/index';
import * as dotenv from 'dotenv';
import {
  applyApiProxyMiddleware,
  applyAuthProxyMiddleware,
  applyAvailableComponentsQueryMiddleware,
  applyCustomDomainMiddleware,
  doClientAuthHandshake
} from './server-helper';

dotenv.config();

const CONFIG: EnvironmentConfig = {
  PORT: process.env.PORT,
  API_ENDPOINT: process.env.API_ENDPOINT,
  API_VERSION: process.env.API_VERSION,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URI: process.env.REDIRECT_URI,
  SU_SCOPE: process.env.SU_SCOPE,
  HOST: process.env.HOST
};
const PORT = CONFIG.PORT || 8080;
const CLIENT_ID = CONFIG.CLIENT_ID;
const CLIENT_SECRET = CONFIG.CLIENT_SECRET;
const SCOPE = CONFIG.SU_SCOPE;

const application: Express = express();

bootstrap(application).then(() => {
  console.log(`Listening on ${PORT}`);
}).catch(err => {
  throw err;
});

async function bootstrap(app: Express) {
  try {
    await doClientAuthHandshake(CLIENT_ID, CLIENT_SECRET, SCOPE);
    const proxyServer = bootstrapProxyServer();
    applyAuthProxyMiddleware(app);
    applyAvailableComponentsQueryMiddleware(app);
    applyCustomDomainMiddleware(app);
    applyApiProxyMiddleware(app, proxyServer);
    app.listen(PORT, (err) => {
      if (err) {
        throw err;
      } else {
        return;
      }
    });
  } catch (e) {
    throw e;
  }
}

function bootstrapProxyServer() {
  return httpProxy.createProxyServer({
    changeOrigin: true,
    ignorePath: true,
    secure: false
  });
}
