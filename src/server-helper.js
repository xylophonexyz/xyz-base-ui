"use strict";
var __assign = (this && this.__assign) || Object.assign || function (t) {
  for (var s, i = 1, n = arguments.length; i < n; i++) {
    s = arguments[i];
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
      t[p] = s[p];
  }
  return t;
};
Object.defineProperty(exports, "__esModule", {value: true});
var dotenv = require("dotenv");
var available_components_1 = require("./available-components");
var express_engine_1 = require("@nguniversal/express-engine");
var express = require("express");
var url = require("url");
var oauth2 = require("simple-oauth2");
var fs = require("fs");
var path = require("path");
var bodyParser = require("body-parser");
var request = require("request");
var compression = require("compression");
var helmet = require("helmet");
var Memcached = require("memcached");
var provideModuleMap = require('@nguniversal/module-map-ngfactory-loader').provideModuleMap;
dotenv.config();
var clientOAuthToken = null;
var clientOAuthTokenPoller = null;

/**
 * Helper to return environment variables
 * @param {string} key
 * @returns {any}
 */
function getConfig(key) {
  return process.env[key];
}

exports.getConfig = getConfig;

/**
 * Bootstrap the client auth in order to maintain an access token that will be used to fill in for an absent user
 * auth header.
 * @param {string} clientId
 * @param {string} clientSecret
 * @param {string} scope
 * @returns {Promise<AuthResponse>}
 */
function doClientAuthHandshake(clientId, clientSecret, scope) {
  return new Promise(function (resolve, reject) {
    var credentials = {
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
    var client = oauth2.create(credentials);
    client.clientCredentials.getToken({scope: scope}).then(function (result) {
      clientOAuthToken = {auth: client.accessToken.create(result), raw: result};
      resolve(clientOAuthToken);
      // set a timeout to automatically renew client credentials
      clearTimeout(clientOAuthTokenPoller);
      clientOAuthTokenPoller = setTimeout(function () {
        doClientAuthHandshake(clientId, clientSecret, scope);
      }, result.expires_in * 1000);
    }).catch(function (err) {
      reject(err);
    });
  });
}

exports.doClientAuthHandshake = doClientAuthHandshake;

/**
 * Apply default compression to outgoing requests
 * @param {e.Express} app
 */
function applyCompressionMiddleware(app) {
  app.use(compression());
}

exports.applyCompressionMiddleware = applyCompressionMiddleware;

/**
 * Apply default security considerations provided by Helmet
 * @param {e.Express} app
 */
function applySecurityMiddleware(app) {
  app.use(helmet());
}

exports.applySecurityMiddleware = applySecurityMiddleware;

/**
 * Return the components available to the current user, or return the basic set.
 * @param {e.Express} app
 */
function applyAvailableComponentsQueryMiddleware(app) {
  app.get(/^\/me\/components$/, function (req, res) {
    res.json(available_components_1.getAvailableComponents(req)).end();
  });
}

exports.applyAvailableComponentsQueryMiddleware = applyAvailableComponentsQueryMiddleware;

/**
 * Return the components available to the current user, or return the basic set.
 * @param {e.Express} app
 */
function applyCustomDomainMiddleware(app) {
  app.post('/api/domains', bodyParser.json(), function (req, res) {
    if (req.body) {
      var target = getConfig('CREATE_FULL_ZONE_SERVICE_ENDPOINT');
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
      }, function (err, _, apiResponse) {
        if (err) {
          res.status(400).send({error: err.message}).end();
        }
        else {
          res.send(JSON.parse(apiResponse)).end();
        }
      });
    }
    else {
      var error = new Error('Required parameters missing: {domainName, siteId}');
      res.status(400).send({error: error.message}).end();
    }
  });
  app.post('/api/domainMappings', bodyParser.json(), function (req, res) {
    if (req.body) {
      var target = getConfig('INSERT_KEY_PAIR_SERVICE_ENDPOINT');
      var domainName_1 = req.body.domainName;
      var siteId = req.body.siteId;
      var subdomain_1 = req.body.subdomain;
      if (!validateSubdomain(subdomain_1)) {
        var error = new Error('Invalid domain name provided');
        res.status(400).send({error: error.message}).end();
      }
      else {
        request({
          method: 'POST',
          url: target,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.authorization || req.headers.Authorization
          },
          body: JSON.stringify({siteId: siteId, domainName: getFullDomainName(domainName_1, subdomain_1)})
        }, function (err, _, apiResponse) {
          if (err) {
            res.status(400).send({error: err.message}).end();
          }
          else {
            try {
              res.send(__assign({}, JSON.parse(apiResponse), {domainName: domainName_1, subdomain: subdomain_1})).end();
            }
            catch (err) {
              res.status(400).send({error: err.message}).end();
            }
          }
        });
      }
    }
    else {
      var error = new Error('Required parameters missing: {domainName, siteId}');
      res.status(400).send({error: error.message}).end();
    }
  });
  app.delete('/api/domains/:siteId', function (req, res) {
    if (req.params.siteId) {
      var target = getConfig('DELETE_FULL_ZONE_SERVICE_ENDPOINT') + "?siteId=" + req.params.siteId;
      request({
        method: 'DELETE',
        url: target,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || req.headers.Authorization
        },
      }, function (err, _, apiResponse) {
        if (err) {
          res.status(400).send({error: err.message}).end();
        }
        else {
          res.send(apiResponse).end();
        }
      });
    }
    else {
      var error = new Error('Required parameters missing: {siteId}');
      res.status(400).send({error: error.message}).end();
    }
  });
  app.delete('/api/domainMappings/:siteId', function (req, res) {
    if (req.params.siteId) {
      var target = getConfig('DELETE_KEY_PAIR_SERVICE_ENDPOINT');
      var siteId = req.params.siteId;
      var domainName = req.query.domainName;
      var subdomain = req.query.subdomain;
      request({
        method: 'POST',
        url: target,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || req.headers.Authorization
        },
        body: JSON.stringify({siteId: siteId, domainName: getFullDomainName(domainName, subdomain)})
      }, function (err, _, apiResponse) {
        if (err) {
          res.status(400).send({error: err.message}).end();
        }
        else {
          res.send(apiResponse).end();
        }
      });
    }
    else {
      var error = new Error('Required parameters missing: {domainName, siteId, subdomain}');
      res.status(400).send({error: error.message}).end();
    }
  });

  function validateSubdomain(subdomain) {
    return subdomain === '@' || new RegExp('[A-Za-z0-9](?:[A-Za-z0-9\\-]{0,61}[A-Za-z0-9])?').test(subdomain);
  }

  function getFullDomainName(domain, subdomain) {
    return subdomain === '@' ? domain : subdomain + "." + domain;
  }
}

exports.applyCustomDomainMiddleware = applyCustomDomainMiddleware;

/**
 * Requests of the form `/api` will automatically be proxied to the backend, with the `api` part of the url replaced
 * with the current version of the backend api being used by this application instance. In addition, if no authorization
 * headers are present on the request, a limited privilege client auth header will be added - this is so we can make
 * requests against the API at all, fetching things like published pages and public user data.
 * @param {e.Express} app
 * @param proxyServer
 */
function applyApiProxyMiddleware(app, proxyServer) {
  app.use(doProxyApiRequest);

  function doProxyApiRequest(req, res, next) {
    var requestUrl = url.parse(req.url);
    var shouldProxyRequest = function (url) {
      var validPaths = [
        /^\/api\//,
        /^\/oauth\/authorize$/,
        /^\/oauth\/revoke$/,
        /^\/callback\/email$/
      ];
      return validPaths.filter(function (p) {
        return p.test(url);
      }).length;
    };
    if (shouldProxyRequest(requestUrl.path)) {
      var apiVersion = getConfig('API_VERSION');
      var apiEndpoint = getConfig('API_ENDPOINT');
      var path_1 = requestUrl.path.toString()
        .replace(/^\//g, '').replace(/^api\//, apiVersion + "/");
      var target = apiEndpoint + "/" + path_1;
      // for API requests without an access token, add client (limited privilege) access token
      if (!req.headers.Authorization) {
        req.headers.Authorization = "Bearer " + clientOAuthToken.raw.access_token;
      }
      proxyServer.web(req, res, {target: target}, function (err) {
        console.log(err);
        next();
      });
    }
    else {
      next();
    }
  }
}

exports.applyApiProxyMiddleware = applyApiProxyMiddleware;

/**
 * OAuth requests need to be proxied to the backend system. Based on the request identity, we are either requesting
 * an authorization code to be sent, or authorizing an authorization code from a link provided to the user. For either
 * of these cases, we will route the request to the appropriate endpoint and tack on any headers required for the
 * request to ultimately be successful.
 * @param {e.Express} app
 */
function applyAuthProxyMiddleware(app) {
  app.use('/oauth/authorize', bodyParser.json(), sendAuthorizationRequest);
  app.use('/oauth/token', bodyParser.json(), sendTokenRequest);

  function sendAuthorizationRequest(req, res, next) {
    if (req.body) {
      var endpoint = getConfig('API_ENDPOINT') + "/oauth/authorize";
      var authReq = {
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
      request.post(authReq, function (err, intermediate, body) {
        if (err || intermediate.statusCode !== 200) {
          res.statusCode = intermediate.statusCode;
        }
        res.send(body);
      });
    }
    else {
      next();
    }
  }

  function sendTokenRequest(req, res, next) {
    if (req.body) {
      var endpoint = getConfig('API_ENDPOINT') + "/oauth/token";
      var authReq = {
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
      request.post(authReq, function (err, intermediate, body) {
        if (err || intermediate.statusCode !== 200) {
          res.statusCode = intermediate.statusCode;
        }
        res.send(body);
      });
    }
    else {
      next();
    }
  }
}

exports.applyAuthProxyMiddleware = applyAuthProxyMiddleware;

/**
 * Setup the view rendering engine for html files to be the ngExpressEngine. This engine will compile views according
 * to the AppServerModule generated by the AOT compilation. The result is as if the view for the given url was loaded
 * on the client - remote data will be fetched and templates will be populated with that data before it is sent to the
 * client. The only downside is that this can be very slow.
 * @param {e.Express} app
 */
function setupAngularRenderer(app) {
  // AppServerModuleNgFactory is generated from our AOT build and will be exported in our main `server` bundle
  var fileName = '';
  fs.readdirSync(__dirname).forEach(function (file) {
    if (file.startsWith('main')) {
      fileName = file;
    }
  });
  var bundle = require('./' + fileName);
  var AppServerModuleNgFactory = bundle.AppServerModuleNgFactory;
  app.engine('html', express_engine_1.ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [
      provideModuleMap(bundle.LAZY_MODULE_MAP)
    ]
  }));
  app.set('view engine', 'html');
  app.set('views', getTemplatesPath());
}

exports.setupAngularRenderer = setupAngularRenderer;

/**
 * Serve static files from the public `browser` directory, direct all other requests to the index.html file that serves
 * as the launch point for the client app.
 * @param {e.Express} app
 */
function applyServeStaticMiddleware(app) {
  app.use('/', express.static(getTemplatesPath(), {index: false}));
  app.get('/*', function (req, res) {
    res.render('index', {
      req: req,
    });
  });
}

exports.applyServeStaticMiddleware = applyServeStaticMiddleware;

/**
 * Cache templates generated by the angular renderer and serve them from this cache before they are re-rendered.
 * Cache invalidation is not a high priority here since the view will be re-rendered once it hits the client.
 * Set the expiry to a reasonably high value to speed up response times, since SSR is mostly for the purposes of
 * SEO anyway.
 * @param {e.Express} app
 * @param {string} memcachedUrl
 */
function applyViewCachingMiddleware(app, memcachedUrl) {
  if (memcachedUrl) {
    var memcached_1 = new Memcached(memcachedUrl);
    app.get('/*', function (req, res, next) {
      memcached_1.get(req.url, function (err, data) {
        if (data) {
          res.send(data);
        }
        else {
          var send_1 = res.send;
          res.send = function (body) {
            var expiry = 86400 * 5; // 24 hours * 5 days
            memcached_1.set(req.url, body.toString(), expiry, function () {
              console.log('Cached view for:', req.url, 'with expiry:', expiry);
            });
            return send_1.call(this, body);
          };
          next();
        }
      });
    });
    // flush the cache before start up
    memcached_1.flush(function () {
      console.log('View cache flushed successfully.');
    });
  }
}

exports.applyViewCachingMiddleware = applyViewCachingMiddleware;

/**
 * Add DOM bindings to global scope for server side rendering
 */
function initializeGlobalDOMBindings() {
  var domino = require('@angular/platform-server/node_modules/domino');
  var fs = require('fs');
  var path = require('path');
  var template = fs.readFileSync(path.join(getTemplatesPath(), 'index.html')).toString();
  var win = domino.createWindow(template);
  // some things to note here:
  // - any reference to ref.nativeElement in angular refers to a domino node
  // - some of these domino nodes dont have all the methods that libraries would expect
  // - in some cases it is necessary to polyfill these methods
  // write any polyfills that are needed
  win.document.getSelection = function () {
    return null;
  };
  // set the rest of the global bindings that are used by the application
  global['window'] = win;
  global['document'] = win.document;
  global['DOMTokenList'] = win.DOMTokenList;
  global['Node'] = win.Node;
  global['Text'] = win.Text;
  global['HTMLElement'] = win.HTMLElement;
  global['navigator'] = win.navigator;
  global['MutationObserver'] = getMockMutationObserver();
}

exports.initializeGlobalDOMBindings = initializeGlobalDOMBindings;

/**
 * Return the path of the directory that contains the assets used to render the application templates
 * @returns {string}
 */
function getTemplatesPath() {
  return path.join(__dirname, '..', 'browser');
}

exports.getTemplatesPath = getTemplatesPath;

function getMockMutationObserver() {
  return /** @class */ (function () {
    function class_1() {
    }

    class_1.prototype.observe = function (node, options) {
    };
    class_1.prototype.disconnect = function () {
    };
    class_1.prototype.takeRecords = function () {
      return [];
    };
    return class_1;
  }());
}
