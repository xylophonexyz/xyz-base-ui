import {Subject} from 'rxjs/Subject';

export const activatedRouteStub = {
  snapshot: {},
  parent: {
    params: new Subject<any>()
  },
  params: new Subject<any>(),
  data: new Subject<any>(),
  queryParams: {
    subscribe: (callback) => {
      callback({code: '1234'});
      return {
        unsubscribe: () => {

        }
      };
    }
  },
  firstChild: {
    routeConfig: {
      path: 'foo'
    }
  }
};
