"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("zone.js/dist/zone-node");
var express = require("express");
var httpProxy = require("http-proxy");
var core_1 = require("@angular/core");
var server_helper_1 = require("./server-helper");
core_1.enableProdMode();
exports.Application = express();
/**
 * Initiate launch
 */
bootstrap(exports.Application).then(function () {
    console.log("Listening on " + server_helper_1.getConfig('PORT'));
}).catch(function (err) {
    throw err;
});
/**
 * Run the sequences required to launch the application, including gaining a client auth token and setting up
 * middleware that will be used by the application.
 * @param {e.Express} app
 * @returns {Promise<void>}
 */
function bootstrap(app) {
    return __awaiter(this, void 0, void 0, function () {
        var clientId, clientSecret, scope, memcachedUrl, port, proxyServer, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    clientId = server_helper_1.getConfig('CLIENT_ID');
                    clientSecret = server_helper_1.getConfig('CLIENT_SECRET');
                    scope = server_helper_1.getConfig('SU_SCOPE');
                    memcachedUrl = server_helper_1.getConfig('MEMCACHED_URL');
                    port = server_helper_1.getConfig('PORT');
                    return [4 /*yield*/, server_helper_1.doClientAuthHandshake(clientId, clientSecret, scope)];
                case 1:
                    _a.sent();
                    proxyServer = bootstrapProxyServer();
                    server_helper_1.applyViewCachingMiddleware(app, memcachedUrl);
                    server_helper_1.setupAngularRenderer(app);
                    server_helper_1.applySecurityMiddleware(app);
                    server_helper_1.applyCompressionMiddleware(app);
                    server_helper_1.applyAuthProxyMiddleware(app);
                    server_helper_1.applyAvailableComponentsQueryMiddleware(app);
                    server_helper_1.applyCustomDomainMiddleware(app);
                    server_helper_1.applyApiProxyMiddleware(app, proxyServer);
                    server_helper_1.applyServeStaticMiddleware(app);
                    app.listen(port, function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    throw e_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.bootstrap = bootstrap;
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
