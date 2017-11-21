import {Observable} from 'rxjs/Observable';
import {mockComponentCollectionData} from '../../app/models/component-collection.spec';

export const componentCollectionServiceStub = {
  update: () => {
    return new Observable(subscriber => {
      subscriber.next(mockComponentCollectionData);
    });
  },
  create: () => {
    return new Observable(subscriber => {
      subscriber.next(mockComponentCollectionData);
    });
  }
};
