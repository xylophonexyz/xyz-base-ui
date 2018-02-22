import {Subject} from 'rxjs/Subject';

export const activatedRouteStub = {
  snapshot: {},
  parent: {
    params: new Subject<any>(),
    paramMap: {
      subscribe: (callback) => {
        callback({
          get: (key) => {
            const obj = {
              code: '1234',
            };
            return obj[key];
          }
        });
        return {
          unsubscribe: () => {

          },
        };
      }
    },
  },
  params: new Subject<any>(),
  paramMap: {
    subscribe: (callback) => {
      callback({
        get: (key) => {
          const obj = {
            code: '1234',
          };
          return obj[key];
        }
      });
      return {
        unsubscribe: () => {

        },
      };
    }
  },
  data: new Subject<any>(),
  queryParamMap: {
    subscribe: (callback) => {
      callback({
        get: (key) => {
          const obj = {
            code: '1234',
          };
          return obj[key];
        }
      });
      return {
        unsubscribe: () => {

        }
      };
    }
  },
  queryParams: {
    subscribe: (callback) => {
      callback({
        get: (key) => {
          const obj = {
            code: '1234',
          };
          return obj[key];
        }
      });
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
