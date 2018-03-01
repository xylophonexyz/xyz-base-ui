"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
var component_1 = require("./component");
var ComponentCollection = /** @class */ (function () {
  function ComponentCollection(params) {
    if (params) {
      this._id = params.id;
      this._index = params.index;
      this._type = params.type;
      this._collectibleId = params.collectible_id;
      this._collectibleType = params.collectible_type;
      this._metadata = params.metadata;
      this._createdAt = new Date(params.created_at);
      this._updatedAt = new Date(params.updated_at);
      if (params.components) {
        this._components = params.components.map(function (c) {
          return new component_1.Component(c);
        });
      }
      else {
        this._components = [];
      }
    }
  }

  Object.defineProperty(ComponentCollection.prototype, "id", {
    get: function () {
      return this._id;
    },
    set: function (id) {
      this._id = id;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "index", {
    get: function () {
      return this._index;
    },
    set: function (index) {
      this._index = index;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "type", {
    get: function () {
      return this._type;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "collectibleId", {
    get: function () {
      return this._collectibleId;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "collectibleType", {
    get: function () {
      return this._collectibleType;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "components", {
    get: function () {
      return this._components;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "metadata", {
    get: function () {
      return this._metadata;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "createdAt", {
    get: function () {
      return this._createdAt;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "updatedAt", {
    get: function () {
      return this._updatedAt;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ComponentCollection.prototype, "metatype", {
    get: function () {
      if (this.metadata && this.metadata.metatype) {
        return this.metadata.metatype;
      }
      else {
        return 'ComponentCollection';
      }
    },
    enumerable: true,
    configurable: true
  });
  ComponentCollection.prototype.asJson = function () {
    return {
      id: this._id,
      type: this._type,
      metadata: this._metadata,
      index: this._index,
      components: this._components.map(function (c) {
        return c.asJson();
      }),
      collectible_id: this._collectibleId,
      collectible_type: this._collectibleType,
      created_at: this._createdAt.getTime(),
      updated_at: this._updatedAt.getTime()
    };
  };
  return ComponentCollection;
}());
exports.ComponentCollection = ComponentCollection;
