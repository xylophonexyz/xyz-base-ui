import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class NavbarDelegateService {

  shouldDisplay$ = new BehaviorSubject<boolean>(false);

  displayNavbar(value: boolean) {
    this.shouldDisplay$.next(value);
  }

}
