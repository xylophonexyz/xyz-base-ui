import {isPlatformServer} from '@angular/common';
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {User} from '../models/user';
import {AuthService} from '../providers/auth.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router,
              private auth: AuthService,
              @Inject(PLATFORM_ID) private platformId) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    if (this.isPlatformServer()) {
      return this.canActivateServer();
    } else {
      return this.canActivateBrowser();
    }
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return this.canActivate(next, state);
  }

  isPlatformServer(): boolean {
    return isPlatformServer(this.platformId);
  }

  private canActivateBrowser(): Promise<boolean> {
    return new Promise(resolve => {
      this.auth.authenticate().then((currentUser: User) => {
        // current user is logged in, proceed
        if (currentUser) {
          resolve(true);
        } else {
          // no current user - redirect to the login page
          this.router.navigate(['/login']);
          resolve(false);
        }
      }).catch(() => {
        // login failed - redirect to the login page
        this.router.navigate(['/login']);
        resolve(false);
      });
    });
  }

  private canActivateServer(): Promise<boolean> {
    return new Promise(resolve => {
      // no concept of current user for server rendered pages
      resolve(false);
    });
  }
}
