"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var component_collection_1 = require("./component-collection");
var composition_1 = require("./composition");
var user_1 = require("./user");
var Page = (function () {
    function Page(params) {
        if (params) {
            this._id = params.id;
            this._title = params.title;
            this._description = params.description;
            this._createdAt = new Date(params.created_at);
            this._updatedAt = new Date(params.updated_at);
            this._published = params.published;
            this._cover = params.cover;
            this._guessedTitle = params.guessed_title;
            this._session = params.session;
            this._rating = params.rating;
            this._commentCount = params.comment_count;
            this._views = params.views;
            this._nods = params.nods;
            this._metadata = params.metadata;
            this._userId = params.user ? params.user.id : (params.user_id ? params.user_id : null);
            this._user = new user_1.User(params.user);
            this._compositionId = params.composition ? params.composition.id : null;
            this._composition = new composition_1.Composition(params.composition);
            this._tags = params.tags;
            this._errors = params.errors;
            if (params.components) {
                this._components = params.components.map(function (c) {
                    return new component_collection_1.ComponentCollection(c);
                });
            }
            else {
                this._components = [];
            }
        }
    }
    Page.sortFn = function (a, b) {
        try {
            if (a.metadata.index > b.metadata.index) {
                return 1;
            }
            else if (a.metadata.index < b.metadata.index) {
                return -1;
            }
            else {
                return 0;
            }
        }
        catch (e) {
            return 0;
        }
    };
    Page.swap = function (source, target, incr) {
        try {
            if (target._metadata.index === (source._metadata.index + incr)) {
                var temp = target._metadata.index;
                target._metadata.index = source._metadata.index;
                source._metadata.index = temp;
                return true;
            }
            else {
                return false;
            }
        }
        catch (e) {
            return false;
        }
    };
    Object.defineProperty(Page.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "title", {
        get: function () {
            return this._title || '';
        },
        set: function (title) {
            this._title = title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "description", {
        get: function () {
            return this._description || '';
        },
        set: function (description) {
            this._description = description;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "createdAt", {
        get: function () {
            return this._createdAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "updatedAt", {
        get: function () {
            return this._updatedAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "published", {
        get: function () {
            return this._published;
        },
        set: function (shouldPublish) {
            this._published = shouldPublish;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "cover", {
        get: function () {
            if (this.hasCover()) {
                return this._cover;
            }
            else {
                return '/assets/img/placeholder.svg';
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "components", {
        get: function () {
            return this._components;
        },
        set: function (components) {
            this._components = components;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "session", {
        get: function () {
            return this._session;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "rating", {
        get: function () {
            return this._rating;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "commentCount", {
        get: function () {
            return this._commentCount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "views", {
        get: function () {
            return this._views;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "nods", {
        get: function () {
            return this._nods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "metadata", {
        get: function () {
            return this._metadata;
        },
        set: function (metadata) {
            this._metadata = metadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "userId", {
        get: function () {
            return this._userId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "user", {
        get: function () {
            return this._user;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "compositionId", {
        get: function () {
            return this._compositionId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "composition", {
        get: function () {
            return this._composition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "tags", {
        get: function () {
            return this._tags;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "errors", {
        get: function () {
            return this._errors;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "bestGuessTitle", {
        get: function () {
            return this._guessedTitle || 'Untitled';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "index", {
        get: function () {
            try {
                return this._metadata.index;
            }
            catch (e) {
                return Infinity;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "navigationType", {
        set: function (navigationType) {
            try {
                this._metadata.navigationType = navigationType;
            }
            catch (e) {
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Page.prototype, "navigationHref", {
        get: function () {
            try {
                return this._metadata.navigationHref;
            }
            catch (e) {
                return null;
            }
        },
        set: function (url) {
            try {
                this._metadata.navigationHref = url;
            }
            catch (e) {
            }
        },
        enumerable: true,
        configurable: true
    });
    Page.prototype.hasCover = function () {
        return !!this._cover;
    };
    Page.prototype.hasHeader = function () {
        if (this._metadata) {
            return this._metadata.showNav;
        }
        else {
            return false;
        }
    };
    Page.prototype.hasTransparentHeader = function () {
        if (this._metadata) {
            return this._metadata.hasTransparentHeader;
        }
        else {
            return false;
        }
    };
    Page.prototype.isExternalNavigationType = function () {
        if (this._metadata) {
            return this._metadata.navigationType === index_1.PageNavigationItemNavigationStrategy.External;
        }
        else {
            return false;
        }
    };
    Page.prototype.isNavigationItem = function () {
        if (this._metadata) {
            return this._metadata.navigationItem;
        }
        else {
            return false;
        }
    };
    Page.prototype.isPublished = function () {
        return this.published;
    };
    Page.prototype.asJson = function () {
        return {
            id: this._id,
            title: this._title,
            description: this._description,
            created_at: this._createdAt.getTime(),
            updated_at: this._updatedAt.getTime(),
            published: this._published,
            cover: this._cover,
            components: this._components.map(function (c) {
                return c.asJson();
            }),
            guessed_title: this._guessedTitle,
            session: this._session,
            rating: this._rating,
            comment_count: this._commentCount,
            views: this._views,
            nods: this._nods,
            metadata: this._metadata,
            user_id: this._userId,
            user: this.user ? this.user.asJson() : null,
            composition_id: this._compositionId,
            composition: this._composition.asJson(),
            tags: this._tags,
            errors: this._errors
        };
    };
    return Page;
}());
exports.Page = Page;
