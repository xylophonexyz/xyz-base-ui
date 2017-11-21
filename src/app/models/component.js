"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Component = (function () {
    function Component(params) {
        if (params) {
            this._id = params.id;
            this._index = params.index;
            this._type = params.type;
            this._media = params.media;
            this._mediaIsProcessing = params.media_processing;
            this._componentCollectionId = params.component_collection_id;
            this._metadata = params.metadata;
            this._createdAt = new Date(params.created_at);
            this._updatedAt = new Date(params.updated_at);
        }
    }
    Object.defineProperty(Component.prototype, "id", {
        get: function () {
            return this._id;
        },
        set: function (id) {
            this._id = id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "index", {
        get: function () {
            return this._index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "media", {
        get: function () {
            return this._media;
        },
        set: function (media) {
            this._media = media;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "mediaIsProcessing", {
        get: function () {
            return this._mediaIsProcessing;
        },
        set: function (isProcessing) {
            this._mediaIsProcessing = isProcessing;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "componentCollectionId", {
        get: function () {
            return this._componentCollectionId;
        },
        set: function (id) {
            this._componentCollectionId = id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "metadata", {
        get: function () {
            return this._metadata;
        },
        set: function (metadata) {
            this._metadata = metadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "createdAt", {
        get: function () {
            return this._createdAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "updatedAt", {
        get: function () {
            return this._updatedAt;
        },
        enumerable: true,
        configurable: true
    });
    Component.prototype.asJson = function () {
        return {
            id: this._id,
            index: this._index,
            type: this._type,
            media: this._media,
            media_processing: this._mediaIsProcessing,
            component_collection_id: this._componentCollectionId,
            metadata: this._metadata,
            created_at: this._createdAt.getTime(),
            updated_at: this._updatedAt.getTime()
        };
    };
    return Component;
}());
exports.Component = Component;
