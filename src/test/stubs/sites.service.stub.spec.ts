import {Observable} from 'rxjs/Observable';

export const sitesServiceStub = {
  all: () => {
    return new Observable(observer => {
      observer.next([]);
    });
  },
  create: () => {
    return new Observable(observer => {
      observer.next({});
    });
  },
  get: () => {
    return new Observable(observer => {
      observer.next({});
    });
  },
  update: () => {
    return new Observable(observer => {
      observer.next({});
    });
  },
  uploadLogo: () => {
    return new Promise(resolve => {
      resolve({});
    });
  },
  removeLogo: () => {
    return new Promise(resolve => {
      resolve({});
    });
  },
  link: () => {
    return new Observable(observer => {
      observer.next({});
    });
  },
  publish: () => {
    return new Observable(observer => {
      observer.next({});
    });
  },
  destroy: () => {
    return new Observable(observer => {
      observer.next({});
    });
  },
  addCustomDomain: () => {
    return new Observable(observer => {
      observer.next({createZoneResult: {result: {}}});
    });
  },
  removeCustomDomain: () => {
    return new Observable(observer => {
      observer.next(null);
    });
  },
  addDomainNameKeyPair: () => {
    return new Observable(observer => {
      observer.next({createZoneResult: {result: {}}});
    });
  },
  removeDomainNameKeyPair: () => {
    return new Observable(observer => {
      observer.next(null);
    });
  },
};
