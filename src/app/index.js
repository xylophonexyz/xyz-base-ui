"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
exports.ORIGIN_URL = new core_1.InjectionToken('ORIGIN_URL');
exports.APPLICATION_NAME = new core_1.InjectionToken('APPLICATION_NAME');
/**
 * Binding strategies for content editable elements. Can either be set to use innerText value or the innerHTML value of
 * the underlying DOM node.
 */
var ContentEditableBindingStrategy;
(function (ContentEditableBindingStrategy) {
    ContentEditableBindingStrategy["TextContent"] = "innerText";
    ContentEditableBindingStrategy["HtmlContent"] = "innerHTML";
})(ContentEditableBindingStrategy = exports.ContentEditableBindingStrategy || (exports.ContentEditableBindingStrategy = {}));
/**
 *
 */
var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["LOADING"] = "LOADING";
    ComponentStatus["PROCESSING"] = "PROCESSING";
    ComponentStatus["COMPLETE"] = "COMPLETE";
    ComponentStatus["FAILED"] = "FAILED";
})(ComponentStatus = exports.ComponentStatus || (exports.ComponentStatus = {}));
var LoginType;
(function (LoginType) {
    LoginType["LOGIN"] = "LOGIN";
    LoginType["REGISTER"] = "REGISTER";
})(LoginType = exports.LoginType || (exports.LoginType = {}));
