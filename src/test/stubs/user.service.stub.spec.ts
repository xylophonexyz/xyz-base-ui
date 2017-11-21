import {Observable} from 'rxjs/Observable';

export const userServiceStub = {
  update: () => {
    return Observable.create(o => o.next({}));
  },
  updateUserPhoto: () => {
    return Observable.create(o => o.next({}));
  },
  deleteUser: () => {
    return Observable.create(o => o.next({}));
  }
};
