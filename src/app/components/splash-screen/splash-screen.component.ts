import {Component, Inject, OnInit} from '@angular/core';
import {APPLICATION_NAME} from '../../index';
import {LoginModalDelegateService} from '../../providers/login-modal-delegate.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss']
})
export class SplashScreenComponent implements OnInit {

  shouldShowMenu = false;

  constructor(private nav: NavbarDelegateService,
              private loginDisplayService: LoginModalDelegateService,
              @Inject(APPLICATION_NAME) private appTitle) {
  }

  get applicationName(): string {
    return this.appTitle();
  }

  ngOnInit() {
    this.nav.displayNavbar(false);
  }

  showLogin() {
    this.loginDisplayService.displayLoginComponent(true);
  }

}
