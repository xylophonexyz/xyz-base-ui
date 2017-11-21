import {Observable} from 'rxjs/Observable';
import {mockComponentCollectionData} from '../../app/models/component-collection.spec';
import {Response, ResponseOptions} from '@angular/http';

export const pagesServiceStub = {
  get: () => {
    return new Observable(subscriber => {
      subscriber.next({});
    });
  },
  create: () => {
    return new Observable(subscriber => {
      subscriber.next({});
    });
  },
  update: () => {
    return new Observable(subscriber => {
      subscriber.next({});
    });
  },
  destroy: () => {
    return new Observable(subscriber => {
      subscriber.next({});
    });
  },
  addComponentCollection: () => {
    return new Observable(subscriber => {
      subscriber.next(mockComponentCollectionData);
    });
  },
  removeComponentCollection: () => {
    return new Observable(subscriber => {
      subscriber.next(new Response(new ResponseOptions({
        status: 200
      })));
    });
  }
};
