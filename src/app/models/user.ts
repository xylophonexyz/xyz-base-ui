import {UserDataInterface, UserInterface} from '../index';

export class User implements UserInterface {

  private _id: number;
  private _email: string;
  private _bio: string;
  private _firstName: string;
  private _lastName: string;
  private _username: string;
  private _createdAt: Date;
  private _followers: User[];
  private _following: User[];
  private _metadata: any;
  private _type: string;
  private _session: any;
  private _avatar: { url: string };
  private _errors: any[];

  constructor(params: UserDataInterface) {

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
        this._followers = params.followers.map((u: UserDataInterface) => {
          return new User(u);
        });
      }

      if (params.following) {
        this._following = params.following.map((u: UserDataInterface) => {
          return new User(u);
        });
      }
    }
  }

  get id(): number {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  set email(email: string) {
    this._email = email;
  }

  get bio(): string {
    return this._bio;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get username(): string {
    return this._username;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get followers(): User[] {
    return this._followers;
  }

  get following(): User[] {
    return this._following;
  }

  get metadata(): any {
    return this._metadata;
  }

  get type(): string {
    return this._type;
  }

  get session(): any {
    return this._session;
  }

  get avatar(): string {
    if (this.hasAvatar()) {
      return this._avatar.url;
    } else {
      return '/assets/img/no-avatar.png';
    }
  }

  set avatar(avatar: string) {
    this._avatar.url = avatar;
  }

  get errors(): any[] {
    return this._errors;
  }

  hasAvatar(): boolean {
    return !!this._avatar.url;
  }

  asJson(): UserDataInterface {
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
      followers: this._followers.map((u: User) => {
        return u.asJson();
      }),
      following: this._following.map((u: User) => {
        return u.asJson();
      }),
      errors: this._errors
    };
  }
}
