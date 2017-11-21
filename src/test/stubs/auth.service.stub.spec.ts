import {Subject} from 'rxjs/Subject';
import {Headers} from '@angular/http';
import createSpy = jasmine.createSpy;

const currentUserSource = new Subject<boolean>();

export const authServiceStub = {
  currentUser$: currentUserSource.asObservable(),
  currentUserSource: currentUserSource,
  token: {
    access_token: '1234'
  },
  accessToken: '1234',
  authenticate: createSpy('authenticate').and.callFake(() => {
    return new Promise(resolve => resolve());
  }),
  authenticateWithCode: createSpy('authenticateWithCode').and.callFake(() => {
    return new Promise(resolve => resolve());
  }),
  authenticateWithToken: createSpy('authenticateWithToken').and.callFake(() => {
    return new Promise(resolve => resolve());
  }),
  clear: createSpy('clear').and.callFake(() => {
    return new Promise(resolve => resolve());
  }),
  constructAuthHeader: createSpy('constructAuthHeader').and.callFake(() => {
    return new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 1234'
    });
  }),
  currentUser: null
};
