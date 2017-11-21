import * as dotenv from 'dotenv';
import {getAvailableComponents} from './available-components';
import {ngExpressEngine} from '@nguniversal/express-engine';
import * as express from 'express';
import {Express, Request, Response} from 'express';
import * as url from 'url';
import * as oauth2 from 'simple-oauth2';
import * as fs from 'fs';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as request from 'request';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as Memcached from 'memcached';
import {OAuthToken} from './app/index';

dotenv.config();

interface AuthResponse {
  auth: any;
  raw: OAuthToken;
}

let clientOAuthToken: AuthResponse = null;
let clientOAuthTokenPoller = null;

/**
 * Helper to return environment variables
 * @param {string} key
 * @returns {any}
 */
export function getConfig(key: string) {
  return process.env[key];
}

/**
 * Bootstrap the client auth in order to maintain an access token that will be used to fill in for an absent user
 * auth header.
 * @param {string} clientId
 * @param {string} clientSecret
 * @param {string} scope
 * @returns {Promise<AuthResponse>}
 */
export function doClientAuthHandshake(clientId: string, clientSecret: string, scope: string): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    const credentials = {
      client: {
        id: clientId,
        secret: clientSecret
      },
      auth: {
        tokenHost: getConfig('API_ENDPOINT'),
        tokenPath: '/oauth/token',
        authorizePath: '/oauth/authorize'
      }
    };
    const client = oauth2.create(credentials);
    client.clientCredentials.getToken({scope: scope}).then(result => {
      clientOAuthToken = {auth: client.accessToken.create(result), raw: result};
      resolve(clientOAuthToken);
      // set a timeout to automatically renew client credentials
      clearTimeout(clientOAuthTokenPoller);
      clientOAuthTokenPoller = setTimeout(() => {
        doClientAuthHandshake(clientId, clientSecret, scope);
      }, result.expires_in * 1000);
    }).catch(err => {
      reject(err);
    });
  });
}

/**
 * Apply default compression to outgoing requests
 * @param {e.Express} app
 */
export function applyCompressionMiddleware(app: Express) {
  app.use(compression());
}

/**
 * Apply default security considerations provided by Helmet
 * @param {e.Express} app
 */
export function applySecurityMiddleware(app: Express) {
  app.use(helmet());
}

/**
 * Return the components available to the current user, or return the basic set.
 * @param {e.Express} app
 */
export function applyAvailableComponentsQueryMiddleware(app: Express) {
  app.get(/^\/me\/components$/, (req, res) => {
    res.json(getAvailableComponents(req)).end();
  });
}

/**
 * Return the components available to the current user, or return the basic set.
 * @param {e.Express} app
 */
export function applyCustomDomainMiddleware(app: Express) {
  app.post('/api/domains', bodyParser.json(), (req: Request, res: Response) => {
    if (req.body) {
      const target = getConfig('CREATE_FULL_ZONE_SERVICE_ENDPOINT');
      request({
        method: 'POST',
        url: target,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || req.headers.Authorization
        },
        body: JSON.stringify({
          siteId: req.body.siteId,
          domainName: req.body.domainName
        })
      }, (err, _, apiResponse) => {
        if (err) {
          res.status(400).send(err).end();
        } else {
          res.send(JSON.parse(apiResponse)).end();
        }
      });
    } else {
      const error = new Error('Required parameters missing: {domainName, siteId}');
      res.status(400).send(error).end();
    }
  });

  app.post('/api/domainMappings', bodyParser.json(), (req: Request, res: Response) => {
    if (req.body) {
      const target = getConfig('INSERT_KEY_PAIR_SERVICE_ENDPOINT');
      request({
        method: 'POST',
        url: target,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || req.headers.Authorization
        },
        body: JSON.stringify({
          siteId: req.body.siteId,
          domainName: req.body.domainName
        })
      }, (err, _, apiResponse) => {
        if (err) {
          res.status(400).send(err).end();
        } else {
          res.send(apiResponse).end();
        }
      });
    } else {
      const error = new Error('Required parameters missing: {domainName, siteId}');
      res.status(400).send(error).end();
    }
  });

  app.delete('/api/domains/:siteId', (req: Request, res: Response) => {
    if (req.params.siteId) {
      const target = `${getConfig('DELETE_FULL_ZONE_SERVICE_ENDPOINT')}?siteId=${req.params.siteId}`;
      request({
        method: 'DELETE',
        url: target,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || req.headers.Authorization
        },
      }, (err, _, apiResponse) => {
        if (err) {
          res.status(400).send(err).end();
        } else {
          res.send(apiResponse).end();
        }
      });
    } else {
      const error = new Error('Required parameters missing: {siteId}');
      res.status(400).send(error).end();
    }
  });
}

/**
 * Requests of the form `/api` will automatically be proxied to the backend, with the `api` part of the url replaced
 * with the current version of the backend api being used by this application instance. In addition, if no authorization
 * headers are present on the request, a limited privilege client auth header will be added - this is so we can make
 * requests against the API at all, fetching things like published pages and public user data.
 * @param {e.Express} app
 * @param proxyServer
 */
export function applyApiProxyMiddleware(app: Express, proxyServer) {
  app.use(doProxyApiRequest);

  function doProxyApiRequest(req, res, next) {
    const requestUrl = url.parse(req.url);
    const shouldProxyRequest = url => {
      const validPaths = [
        /^\/api\//,
        /^\/oauth\/authorize$/,
        /^\/oauth\/revoke$/,
        /^\/callback\/email$/
      ];
      return validPaths.filter(p => {
        return p.test(url);
      }).length;
    };

    if (shouldProxyRequest(requestUrl.path)) {
      const apiVersion = getConfig('API_VERSION');
      const apiEndpoint = getConfig('API_ENDPOINT');
      const path = requestUrl.path.toString()
        .replace(/^\//g, '').replace(/^api\//, `${apiVersion}/`);
      const target = `${apiEndpoint}/${path}`;
      // for API requests without an access token, add client (limited privilege) access token
      if (!req.headers.Authorization) {
        req.headers.Authorization = `Bearer ${clientOAuthToken.raw.access_token}`;
      }
      proxyServer.web(req, res, {target: target}, err => {
        console.log(err);
        next();
      });
    } else {
      next();
    }
  }
}

/**
 * OAuth requests need to be proxied to the backend system. Based on the request identity, we are either requesting
 * an authorization code to be sent, or authorizing an authorization code from a link provided to the user. For either
 * of these cases, we will route the request to the appropriate endpoint and tack on any headers required for the
 * request to ultimately be successful.
 * @param {e.Express} app
 */
export function applyAuthProxyMiddleware(app: Express) {
  app.use('/oauth/authorize', bodyParser.json(), sendAuthorizationRequest);
  app.use('/oauth/token', bodyParser.json(), sendTokenRequest);

  function sendAuthorizationRequest(req, res, next) {
    if (req.body) {
      const endpoint = `${getConfig('API_ENDPOINT')}/oauth/authorize`;
      const authReq = {
        url: endpoint,
        rejectUnauthorized: false,
        form: {
          username: req.body.email,
          client_secret: getConfig('CLIENT_SECRET'),
          client_id: getConfig('CLIENT_ID'),
          redirect_uri: getConfig('REDIRECT_URI'),
          response_type: 'code'
        }
      };
      request.post(authReq, (err, intermediate, body) => {
        if (err || intermediate.statusCode !== 200) {
          res.statusCode = intermediate.statusCode;
        }
        res.send(body);
      });
    } else {
      next();
    }
  }

  function sendTokenRequest(req, res, next) {
    if (req.body) {
      const endpoint = `${getConfig('API_ENDPOINT')}/oauth/token`;
      const authReq = {
        url: endpoint,
        rejectUnauthorized: false,
        form: {
          code: req.body.code,
          refresh_token: req.body.refresh_token,
          client_secret: getConfig('CLIENT_SECRET'),
          client_id: getConfig('CLIENT_ID'),
          redirect_uri: getConfig('REDIRECT_URI'),
          grant_type: req.body.grant_type
        }
      };
      request.post(authReq, (err, intermediate, body) => {
        if (err || intermediate.statusCode !== 200) {
          res.statusCode = intermediate.statusCode;
        }
        res.send(body);
      });
    } else {
      next();
    }
  }
}

/**
 * Setup the view rendering engine for html files to be the ngExpressEngine. This engine will compile views according
 * to the AppServerModule generated by the AOT compilation. The result is as if the view for the given url was loaded
 * on the client - remote data will be fetched and templates will be populated with that data before it is sent to the
 * client. The only downside is that this can be very slow.
 * @param {e.Express} app
 */
export function setupAngularRenderer(app: Express) {
  // AppServerModuleNgFactory is generated from our AOT build and will be exported in our main `server` bundle
  let hash = '';
  fs.readdirSync(__dirname).forEach(file => {
    if (file.startsWith('main')) {
      hash = file.split('.')[1];
    }
  });
  const bundle = require('./main.' + hash + '.bundle');
  const AppServerModuleNgFactory = bundle.AppServerModuleNgFactory;

  app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory
  }));
  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, '/../browser'));
}

/**
 * Serve static files from the public `browser` directory, direct all other requests to the index.html file that serves
 * as the launch point for the client app.
 * @param {e.Express} app
 */
export function applyServeStaticMiddleware(app: Express) {
  app.use('/', express.static(path.join(__dirname, '/../browser'), {index: false}));

  app.get('/*', (req, res) => {
    res.render('index', {
      req: req,
    });
  });
}

/**
 * Cache templates generated by the angular renderer and serve them from this cache before they are re-rendered.
 * Cache invalidation is not a high priority here since the view will be re-rendered once it hits the client.
 * Set the expiry to a reasonably high value to speed up response times, since SSR is mostly for the purposes of
 * SEO anyway.
 * @param {e.Express} app
 * @param {string} memcachedUrl
 */
export function applyViewCachingMiddleware(app: Express, memcachedUrl: string) {
  if (memcachedUrl) {
    const memcached = new Memcached(memcachedUrl);
    app.get('/*', (req, res, next) => {
      memcached.get(req.url, (err, data) => {
        if (data) {
          res.send(data);
        } else {
          const send = res.send;
          res.send = function (body?: any): Response {
            const expiry = 43200; // 12 hours
            memcached.set(req.url, body.toString(), expiry, () => {
              console.log('Cached view for:', req.url, 'with expiry:', expiry);
            });
            return send.call(this, body);
          };
          next();
        }
      });
    });
    // flush the cache before start up
    memcached.flush(() => {
      console.log('View cache flushed successfully.');
    });
  }
}
