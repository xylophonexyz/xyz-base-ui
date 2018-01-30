import {Subject} from 'rxjs/Subject';

const shouldDisplaySource = new Subject<boolean>();
const infoBannerSource = new Subject<string>();

export const navbarNotifierStub = {
  shouldDisplay$: shouldDisplaySource.asObservable(),
  infoBannerMessage$: infoBannerSource.asObservable(),
  displayNavbar: (val) => {
    shouldDisplaySource.next(val);
  },
  setInfoBannerMessage(value: string) {
    infoBannerSource.next(value);
  }
};
