import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AuthService} from '../providers/auth.service';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import {SitesService} from '../providers/sites.service';
import {CompositionDataInterface} from '../index';
import {current} from 'codelyzer/util/syntaxKind';
import {User} from '../models/user';

@Injectable()
export class OwnershipGuard implements CanActivate {

  constructor(private auth: AuthService,
              private sites: SitesService,
              private router: Router) {
  }

  /**
   * Validate whether the current user owns the site being accessed
   * @param {ActivatedRouteSnapshot} next
   * @param {RouterStateSnapshot} state
   * @returns {Observable<boolean> | Promise<boolean> | boolean}
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return Observable.fromPromise(this.auth.authenticate()).switchMap((currentUser: User) => {
      if (currentUser) {
        const id = Number.parseInt(next.paramMap.get('id'));
        return this.sites.get(id).switchMap((site: CompositionDataInterface) => {
          if (site.user && site.user.id === currentUser.id) {
            return Observable.of(true);
          } else {
            return Observable.of(false).do(() => {
              return this.router.navigate(['/admin']);
            });
          }
        });
      } else {
        return Observable.of(false).do(() => {
          return this.router.navigate(['401']);
        });
      }
    });
  }
}
