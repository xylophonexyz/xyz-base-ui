import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {APPLICATION_NAME, LoginType} from '../../index';
import {LoginModalDelegateService} from '../../providers/login-modal-delegate.service';
import {LoginService} from '../../providers/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  display: boolean;
  private _state: any;
  private subscription;

  constructor(private loginDisplayService: LoginModalDelegateService,
              private loginService: LoginService,
              @Inject(APPLICATION_NAME) private appTitle) {
  }

  get appName(): string {
    return this.appTitle();
  }

  get state() {
    return this._state;
  }

  ngOnInit() {
    this.subscription = this.loginDisplayService.shouldDisplay$.subscribe(value => {
      this.display = value;
    });
    this.clearState();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSubmit() {
    if (this._state.email) {
      this._state.willDoSubmit = true;
      this.loginService.doLogin(this._state.email).then((type: LoginType) => {
        this._state.loginType = type;
        this._state.didDoSubmit = true;
      });
    }
  }

  hideLogin() {
    this.loginDisplayService.displayLoginComponent(false);
    this.clearState();
  }

  didDoLoginTypeLogin() {
    return this._state.loginType === LoginType.LOGIN;
  }

  didDoLoginTypeRegister() {
    return this._state.loginType === LoginType.REGISTER;
  }

  private clearState() {
    this._state = {
      loginType: null,
      email: '',
      willDoSubmit: false,
      didDoSubmit: false
    };
  }

}
