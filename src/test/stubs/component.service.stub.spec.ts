import {Observable} from 'rxjs/Observable';

export const componentServiceStub = {
  process: () => {
    return new Observable(subscriber => {
      subscriber.next({});
    });
  },
  upload: () => {
    return new Observable(subscriber => {
      subscriber.next({});
    });
  },
  get: () => {
    return new Observable(subscriber => {
      subscriber.next({});
    });
  },
  update: () => {
    return new Observable(subscriber => {
      subscriber.next({});
    });
  }
};
