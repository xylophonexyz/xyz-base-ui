"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = {
    label: 0, sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: []
  }, f, y, t, g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [0, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return {value: op[1], done: false};
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return {value: op[0] ? op[1] : void 0, done: true};
  }
};
Object.defineProperty(exports, "__esModule", {value: true});
var express = require("express");
var httpProxy = require("http-proxy");
var dotenv = require("dotenv");
var server_helper_1 = require("./server-helper");
dotenv.config();
var CONFIG = {
  PORT: process.env.PORT,
  API_ENDPOINT: process.env.API_ENDPOINT,
  API_VERSION: process.env.API_VERSION,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  REDIRECT_URI: process.env.REDIRECT_URI,
  SU_SCOPE: process.env.SU_SCOPE,
  HOST: process.env.HOST
};
var PORT = CONFIG.PORT || 8080;
var CLIENT_ID = CONFIG.CLIENT_ID;
var CLIENT_SECRET = CONFIG.CLIENT_SECRET;
var SCOPE = CONFIG.SU_SCOPE;
var application = express();
bootstrap(application).then(function () {
  console.log("Listening on " + PORT);
}).catch(function (err) {
  throw err;
});

function bootstrap(app) {
  return __awaiter(this, void 0, void 0, function () {
    var proxyServer, e_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, server_helper_1.doClientAuthHandshake(CLIENT_ID, CLIENT_SECRET, SCOPE)];
        case 1:
          _a.sent();
          proxyServer = bootstrapProxyServer();
          server_helper_1.applyAuthProxyMiddleware(app);
          server_helper_1.applyAvailableComponentsQueryMiddleware(app);
          server_helper_1.applyCustomDomainMiddleware(app);
          server_helper_1.applyApiProxyMiddleware(app, proxyServer);
          app.listen(PORT, function (err) {
            if (err) {
              throw err;
            }
            else {
              return;
            }
          });
          return [3 /*break*/, 3];
        case 2:
          e_1 = _a.sent();
          throw e_1;
        case 3:
          return [2 /*return*/];
      }
    });
  });
}

function bootstrapProxyServer() {
  return httpProxy.createProxyServer({
    changeOrigin: true,
    ignorePath: true,
    secure: false
  });
}
