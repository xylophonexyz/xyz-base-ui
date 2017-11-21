import {UserDataInterface} from '../index';
import {User} from './user';

export const mockUserData = {
  id: 1,
  email: 'hello@example.com',
  bio: 'bio',
  first_name: 'first',
  last_name: 'last',
  username: 'foo',
  created_at: new Date().getTime(),
  followers: [],
  following: [],
  metadata: {},
  type: null,
  session: {},
  avatar: {url: 'Cat.jpg'},
  errors: []
};

describe('User', () => {

  let userData: UserDataInterface = null;
  let user: User = null;

  beforeEach(() => {
    userData = Object.assign({}, mockUserData);
  });

  it('should create a user from a UserDataInterface object', () => {
    user = new User(userData);
    expect(user.id).toEqual(1);
  });

  it('should provide getters for all public attributes', () => {
    user = new User(userData);
    expect(user.email).toEqual('hello@example.com');
    expect(user.bio).toEqual('bio');
    expect(user.firstName).toEqual('first');
    expect(user.lastName).toEqual('last');
    expect(user.username).toEqual('foo');
    expect(user.createdAt).toBeDefined();
    expect(user.followers).toEqual([]);
    expect(user.following).toEqual([]);
    expect(user.metadata).toEqual({});
    expect(user.type).toEqual(null);
    expect(user.session).toEqual({});
    expect(user.avatar).toEqual('Cat.jpg');
    expect(user.errors).toEqual([]);
  });

  it('should provide setters', () => {
    user = new User(userData);
    user.avatar = 'cat.jpg';
    expect(user.avatar).toEqual('cat.jpg');
    user.email = 'hello@example.com';
    expect(user.email).toEqual('hello@example.com');
  });

  it('should provide a fallback avatar', () => {
    user = new User(userData);
    user.avatar = null;
    expect(user.avatar).not.toBeNull();
    expect(user.avatar).not.toBeUndefined();
  });

  it('should create user objects for each UserDataInterface object in "followers"', () => {
    const data = Object.assign({}, userData, {followers: [{username: 'bar', followers: [], following: []}]});
    user = new User(data);
    expect(user.followers[0].username).toEqual('bar');
  });

  it('should create user objects for each UserDataInterface object in "following"', () => {
    const data = Object.assign({}, userData, {following: [{username: 'bar', followers: [], following: []}]});
    user = new User(data);
    expect(user.following[0].username).toEqual('bar');
  });

  it('should provide a method to serialize the user object', () => {
    const data = Object.assign({}, userData, {
      followers: [{username: 'bar', followers: [], following: []}],
      following: [{username: 'bar', followers: [], following: []}]
    });
    user = new User(data);
    expect(user.asJson().id).toBeCloseTo(data.id);
  });

});
