import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class NavbarDelegateService {

  shouldDisplay$ = new BehaviorSubject<boolean>(false);
  infoBannerMessage$ = new BehaviorSubject<string>(null);

  displayNavbar(value: boolean) {
    this.shouldDisplay$.next(value);
  }

  setInfoBannerMessage(value: string) {
    this.infoBannerMessage$.next(value);
  }

}
