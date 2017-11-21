import {Subject} from 'rxjs/Subject';

const shouldDisplaySource = new Subject<boolean>();

export const navbarNotifierStub = {
  shouldDisplay$: shouldDisplaySource.asObservable(),
  displayNavbar: (val) => {
    shouldDisplaySource.next(val);
  }
};
