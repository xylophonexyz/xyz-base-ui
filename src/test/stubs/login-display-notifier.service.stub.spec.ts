import {Subject} from 'rxjs/Subject';

const shouldDisplaySource = new Subject<boolean>();

export const loginDisplayNotifierStub = {
  shouldDisplay$: shouldDisplaySource.asObservable(),
  displayLoginComponent: (val) => {
    shouldDisplaySource.next(val);
  }
};
