"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var colors_1 = require("../util/colors");
var page_1 = require("./page");
var Composition = /** @class */ (function () {
    function Composition(params) {
        this._pages = [];
        this._compositions = [];
        if (params) {
            this._id = params.id;
            this._title = params.title;
            this._published = params.published;
            this._createdAt = new Date(params.created_at);
            this._updatedAt = new Date(params.updated_at);
            this._cover = params.cover;
            this._metadata = params.metadata || {};
            this._errors = params.errors;
            if (params.published_on) {
                this._publishedOn = new Date(params.published_on);
            }
            if (params.compositions && params.compositions.length) {
                this._compositions = params.compositions.map(function (c) {
                    return new Composition(c);
                });
            }
            if (params.pages && params.pages.length) {
                this._pages = params.pages.map(function (p) {
                    return new page_1.Page(p);
                }).sort(page_1.Page.sortFn);
            }
            if (params.parent) {
                this._parent = new Composition(params.parent);
            }
        }
    }
    Object.defineProperty(Composition.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "title", {
        get: function () {
            return this._title || '';
        },
        set: function (title) {
            this._title = title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "published", {
        get: function () {
            return this._published;
        },
        set: function (shouldPublish) {
            this._published = shouldPublish;
            if (shouldPublish) {
                this._publishedOn = new Date();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "publishedOn", {
        get: function () {
            return this._publishedOn;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "createdAt", {
        get: function () {
            return this._createdAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "updatedAt", {
        get: function () {
            return this._updatedAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "cover", {
        get: function () {
            if (this._cover && this._cover.media.url) {
                return this._cover.media.url;
            }
            else {
                return '/assets/img/placeholder.svg';
            }
        },
        set: function (coverUrl) {
            try {
                this._cover.media.url = coverUrl;
            }
            catch (e) {
                this._cover = { media: { url: coverUrl } };
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "metadata", {
        get: function () {
            return this._metadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "favicon", {
        get: function () {
            var fallback = '/assets/img/placeholder.svg';
            try {
                var collection = this._metadata.favicon;
                return collection.components[0].media.url || fallback;
            }
            catch (e) {
                return fallback;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "pages", {
        get: function () {
            return this._pages;
        },
        set: function (pages) {
            this._pages = pages;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "errors", {
        get: function () {
            return this._errors;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "primaryColor", {
        get: function () {
            if (this._metadata && this._metadata.theme) {
                return this._metadata.theme.primaryColor || '';
            }
            else {
                return '';
            }
        },
        set: function (color) {
            if (this._metadata) {
                if (this._metadata.theme) {
                    if (colors_1.colorIsValidFullHexString(color)) {
                        this._metadata.theme.primaryColor = colors_1.getHexColorString(color);
                    }
                }
                else {
                    this._metadata.theme = {
                        primaryColor: null,
                        headerColor: null
                    };
                    this.primaryColor = color;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "primaryColorLight", {
        get: function () {
            var primary = this.primaryColor;
            if (primary) {
                if (colors_1.colorIsLight(this.headerColor)) {
                    return colors_1.darkenHexColorString(primary, 0.2);
                }
                else {
                    return colors_1.lightenHexColorString(primary, 0.2);
                }
            }
            else {
                return primary;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "headerColor", {
        get: function () {
            if (this._metadata && this._metadata.theme) {
                return this._metadata.theme.headerColor || '';
            }
            else {
                return '';
            }
        },
        set: function (color) {
            if (this._metadata) {
                if (this._metadata.theme) {
                    if (colors_1.colorIsValidFullHexString(color)) {
                        this._metadata.theme.headerColor = colors_1.getHexColorString(color);
                    }
                }
                else {
                    this._metadata.theme = {
                        headerColor: null,
                        primaryColor: null
                    };
                    this.headerColor = color;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "sites", {
        get: function () {
            return this._compositions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Composition.prototype, "customDomain", {
        get: function () {
            if (this._metadata && this._metadata.customDomain) {
                return this._metadata.customDomain;
            }
            else {
                return null;
            }
        },
        set: function (customDomain) {
            if (this._metadata) {
                this._metadata.customDomain = customDomain;
            }
        },
        enumerable: true,
        configurable: true
    });
    Composition.prototype.shouldShowLogoInHeader = function () {
        if (this.metadata && this.metadata.hasOwnProperty('showLogoInHeader')) {
            return this.metadata.showLogoInHeader;
        }
        else {
            return false;
        }
    };
    Composition.prototype.hasHeaderShadow = function () {
        if (this.metadata && this.metadata.hasOwnProperty('hasHeaderShadow')) {
            return this.metadata.hasHeaderShadow;
        }
        else {
            return false;
        }
    };
    Composition.prototype.hasTabbedNav = function () {
        if (this.metadata && this.metadata.hasOwnProperty('hasTabbedNav')) {
            return this.metadata.hasTabbedNav;
        }
        else {
            return false;
        }
    };
    Composition.prototype.hasCover = function () {
        try {
            return this._cover.media.url;
        }
        catch (e) {
            return false;
        }
    };
    Composition.prototype.hasFavicon = function () {
        try {
            var collection = this._metadata.favicon;
            return !!collection.components[0].media.url;
        }
        catch (e) {
            return false;
        }
    };
    Composition.prototype.isPublished = function () {
        return this.published;
    };
    Composition.prototype.asJson = function () {
        return {
            id: this._id,
            title: this._title,
            published: this._published,
            published_on: this._publishedOn ? this._publishedOn.getTime() : null,
            created_at: this._createdAt ? this._createdAt.getTime() : null,
            updated_at: this._updatedAt ? this._updatedAt.getTime() : null,
            parent: this._parent ? this._parent.asJson() : null,
            cover: this._cover,
            metadata: this._metadata,
            compositions: this._compositions ? this._compositions.map(function (c) { return c.asJson(); }) : [],
            pages: this._pages ? this._pages.map(function (p) { return p.asJson(); }) : []
        };
    };
    Composition.DefaultMetadata = {
        hasTabbedNav: false,
        showLogoInHeader: true,
        hasHeaderShadow: true,
        theme: {
            primaryColor: '#000000',
            headerColor: '#FFFFFF'
        },
        customDomain: null,
        favicon: null
    };
    return Composition;
}());
exports.Composition = Composition;
