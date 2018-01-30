import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {User} from '../../models/user';
import {AuthService} from '../../providers/auth.service';
import {LoginService} from '../../providers/login.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnDestroy {

  shouldDisplay = false;
  shouldShowMenu = false;
  currentUser: User = null;
  infoBannerMessage: string = null;
  private displaySubscription: Subscription;
  private currentUserSubscription: Subscription;
  private infoBannerSubscription: Subscription;

  constructor(private auth: AuthService,
              private loginService: LoginService,
              navbarDisplayService: NavbarDelegateService) {
    this.displaySubscription = navbarDisplayService.shouldDisplay$.subscribe(value => {
      this.shouldDisplay = value;
    });
    this.currentUserSubscription = auth.currentUser$.subscribe((currentUser: User) => {
      this.currentUser = currentUser;
    });
    this.infoBannerSubscription = navbarDisplayService.infoBannerMessage$.subscribe(value => {
      this.infoBannerMessage = value;
    });
  }

  signOut() {
    this.loginService.logout().catch(err => console.error(err));
  }

  ngOnDestroy() {
    this.displaySubscription.unsubscribe();
    this.currentUserSubscription.unsubscribe();
    this.infoBannerSubscription.unsubscribe();
  }

  getProfileImage(): string {
    if (this.currentUser) {
      return this.currentUser.avatar;
    }
  }

}
