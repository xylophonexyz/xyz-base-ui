"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = /** @class */ (function () {
    function User(params) {
        this._followers = [];
        this._following = [];
        if (params) {
            this._id = params.id;
            this._email = params.email;
            this._bio = params.bio;
            this._firstName = params.first_name;
            this._lastName = params.last_name;
            this._username = params.username;
            this._createdAt = new Date(params.created_at);
            this._metadata = params.metadata;
            this._type = params.type;
            this._session = params.session;
            this._avatar = params.avatar;
            this._errors = params.errors;
            if (params.followers) {
                this._followers = params.followers.map(function (u) {
                    return new User(u);
                });
            }
            if (params.following) {
                this._following = params.following.map(function (u) {
                    return new User(u);
                });
            }
        }
    }
    Object.defineProperty(User.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "email", {
        get: function () {
            return this._email;
        },
        set: function (email) {
            this._email = email;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "bio", {
        get: function () {
            return this._bio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "firstName", {
        get: function () {
            return this._firstName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "lastName", {
        get: function () {
            return this._lastName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "username", {
        get: function () {
            return this._username;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "createdAt", {
        get: function () {
            return this._createdAt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "followers", {
        get: function () {
            return this._followers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "following", {
        get: function () {
            return this._following;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "metadata", {
        get: function () {
            return this._metadata;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "session", {
        get: function () {
            return this._session;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "avatar", {
        get: function () {
            if (this.hasAvatar()) {
                return this._avatar.url;
            }
            else {
                return '/assets/img/no-avatar.png';
            }
        },
        set: function (avatar) {
            this._avatar.url = avatar;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "errors", {
        get: function () {
            return this._errors;
        },
        enumerable: true,
        configurable: true
    });
    User.prototype.hasAvatar = function () {
        return !!this._avatar.url;
    };
    User.prototype.asJson = function () {
        return {
            id: this._id,
            email: this._email,
            bio: this._bio,
            first_name: this._firstName,
            last_name: this._lastName,
            username: this._username,
            created_at: this._createdAt ? this._createdAt.getTime() : null,
            metadata: this._metadata,
            type: this._type,
            session: this._session,
            avatar: this._avatar,
            followers: this._followers.map(function (u) {
                return u.asJson();
            }),
            following: this._following.map(function (u) {
                return u.asJson();
            }),
            errors: this._errors
        };
    };
    return User;
}());
exports.User = User;
