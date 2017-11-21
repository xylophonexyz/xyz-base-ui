import {Subject} from 'rxjs/Subject';

export const routerStub = {
  navigate: jasmine.createSpy('navigate').and.callFake(() => {
    return new Promise(resolve => resolve());
  }),
  events: new Subject<any>().asObservable()
};
