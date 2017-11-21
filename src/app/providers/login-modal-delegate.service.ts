import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class LoginModalDelegateService {

  shouldDisplay$ = new BehaviorSubject<boolean>(false);

  displayLoginComponent(value: boolean) {
    this.shouldDisplay$.next(value);
  }

}
