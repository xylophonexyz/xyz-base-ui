"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
exports.ORIGIN_URL = new core_1.InjectionToken('ORIGIN_URL');
exports.APPLICATION_NAME = new core_1.InjectionToken('APPLICATION_NAME');
/**
 * Page Navigation Types. Can be internally pointing pages, or external urls (also #hashbangs)
 */
var PageNavigationItemNavigationStrategy;
(function (PageNavigationItemNavigationStrategy) {
    PageNavigationItemNavigationStrategy["Internal"] = "INTERNAL";
    PageNavigationItemNavigationStrategy["External"] = "EXTERNAL";
})(PageNavigationItemNavigationStrategy = exports.PageNavigationItemNavigationStrategy || (exports.PageNavigationItemNavigationStrategy = {}));
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
/**
 * Enum of ComponentCollection types recognized locally by this app instance
 */
var LocalComponentTypes;
(function (LocalComponentTypes) {
    LocalComponentTypes["ComponentCollection"] = "ComponentCollection";
    LocalComponentTypes["Text"] = "Text";
    LocalComponentTypes["ImageCollection"] = "ImageCollection";
    LocalComponentTypes["Embed"] = "Embed";
    LocalComponentTypes["Spacer"] = "Spacer";
    LocalComponentTypes["Hero"] = "Hero";
    LocalComponentTypes["FreeFormHtml"] = "FreeFormHtml";
})(LocalComponentTypes = exports.LocalComponentTypes || (exports.LocalComponentTypes = {}));
var LoginType;
(function (LoginType) {
    LoginType["LOGIN"] = "LOGIN";
    LoginType["REGISTER"] = "REGISTER";
})(LoginType = exports.LoginType || (exports.LoginType = {}));
