import {isPlatformBrowser} from '@angular/common';
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, ParamMap, Params, Router, RouterStateSnapshot} from '@angular/router';
import {isNumber} from 'lodash';
import {PageDataInterface} from '../index';
import {Page} from '../models/page';
import {User} from '../models/user';
import {AuthService} from '../providers/auth.service';
import {PagesService} from '../providers/pages.service';

@Injectable()
export class PageGuard implements CanActivate {

  static authorizePage(page: PageDataInterface, user: User, editMode: boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (editMode) {
        if (user && page.user.id === user.id) {
          resolve(true);
        } else {
          reject('/401');
        }
      } else if (page.published) {
        resolve(true);
      } else if (user && isNumber(page.user.id) && isNumber(user.id) && page.user.id === user.id) {
        resolve(true);
      } else {
        reject('/');
      }
    });
  }

  /**
   * Attempt to resolve the page id from the given route. The id can be contained in one of two locations in the url:
   * - as the last string in the page slug, e.g. /hello-world-22
   * - as part of the restful route, e.g. /p/22
   * @param {Params} params
   * @returns {number}
   */
  static getPageId(params: ParamMap): number {
    if (params.get('pageSlug')) {
      const pageId = parseInt(params.get('pageSlug').split('-').pop(), 10);
      if (isNumber(pageId) && !isNaN(pageId) && pageId > 0) {
        return pageId;
      }
    }
    return parseInt(params.get('pageId'), 10);
  }

  static shouldRedirectToPageWithSlug(page: Page, editMode: boolean, params: ParamMap): boolean {
    return page.title && editMode === false && !params.get('pageSlug');
  }

  constructor(private pageProvider: PagesService,
              private router: Router,
              private auth: AuthService,
              @Inject(PLATFORM_ID) private platformId) {
  }

  /**
   * Guard for Page routes. Checks the following:
   * Is the page public?
   *  - Does the page belong to the current user?
   * Is the route asking to view the page in edit mode?
   *  - Does the page belong to the current user?
   * @param next
   * @param state
   * @returns {Promise<T>}
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(resolve => {
      const pageId = PageGuard.getPageId(next.paramMap);
      const editMode = next.queryParamMap.get('edit') === 'true';
      const onAuthComplete = (currentUser) => {
        this.pageProvider.get(pageId, !editMode).subscribe((page: PageDataInterface) => {
          PageGuard.authorizePage(page, currentUser, editMode).then(() => {
            // cache the page in the route object
            next.data = page;
            resolve(true);
          }).catch((redirectPath: string) => {
            this.redirect(redirectPath);
            resolve(false);
          });
        }, () => {
          this.redirect();
          resolve(false);
        });
      };

      this.auth.authenticate().then((currentUser: User) => {
        onAuthComplete(currentUser);
      }).catch(() => {
        onAuthComplete(null);
      });
    });
  }

  private redirect(redirectPath: string = '/') {
    console.log(redirectPath);
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate([redirectPath]);
    }
  }
}
