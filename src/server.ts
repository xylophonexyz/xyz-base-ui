import 'reflect-metadata';
import 'zone.js/dist/zone-node';
import * as express from 'express';
import {Express} from 'express';

import * as httpProxy from 'http-proxy';
import {enableProdMode} from '@angular/core';

import {
  applyApiProxyMiddleware,
  applyAuthProxyMiddleware,
  applyAvailableComponentsQueryMiddleware,
  applyCompressionMiddleware,
  applyCustomDomainMiddleware,
  applySecurityMiddleware,
  applyServeStaticMiddleware,
  applyViewCachingMiddleware,
  doClientAuthHandshake,
  getConfig,
  initializeGlobalDOMBindings,
  setupAngularRenderer
} from './server-helper';

initializeGlobalDOMBindings();
enableProdMode();

export const Application: Express = express();

/**
 * Initiate launch
 */
bootstrap(Application).then(() => {
  console.log(`Listening on ${getConfig('PORT')}`);
}).catch(err => {
  throw err;
});

/**
 * Run the sequences required to launch the application, including gaining a client auth token and setting up
 * middleware that will be used by the application.
 * @param {e.Express} app
 * @returns {Promise<void>}
 */
export async function bootstrap(app: Express) {
  try {
    const clientId = getConfig('CLIENT_ID');
    const clientSecret = getConfig('CLIENT_SECRET');
    const scope = getConfig('SU_SCOPE');
    const memcachedUrl = getConfig('MEMCACHED_URL');
    const port = getConfig('PORT');
    await doClientAuthHandshake(clientId, clientSecret, scope);
    const proxyServer = bootstrapProxyServer();
    applyViewCachingMiddleware(app, memcachedUrl);
    setupAngularRenderer(app);
    applySecurityMiddleware(app);
    applyCompressionMiddleware(app);
    applyAuthProxyMiddleware(app);
    applyAvailableComponentsQueryMiddleware(app);
    applyCustomDomainMiddleware(app, memcachedUrl);
    applyApiProxyMiddleware(app, proxyServer);
    applyServeStaticMiddleware(app);
    app.listen(port, (err) => {
      if (err) {
        throw err;
      }
    });
  } catch (e) {
    throw e;
  }
}

/**
 * Launch the proxy server
 * @returns {any}
 */
function bootstrapProxyServer() {
  return httpProxy.createProxyServer({
    changeOrigin: true,
    ignorePath: true,
    secure: false
  });
}
