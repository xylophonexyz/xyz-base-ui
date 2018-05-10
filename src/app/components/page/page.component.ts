import {Location} from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {sortBy} from 'lodash';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/forkJoin';
import {Observable} from 'rxjs/Observable';
import * as getSlug from 'speakingurl';
import {PageGuard} from '../../guards/page.guard';
import {PageDataInterface} from '../../index';
import {ComponentCollection} from '../../models/component-collection';
import {NavActionItem} from '../../models/nav-action-item';
import {Page} from '../../models/page';
import {AuthService} from '../../providers/auth.service';
import {Favicon} from '../../providers/favicon.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {ParamMap} from '@angular/router/src/shared';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit, OnDestroy {

  page: Page = null;
  menuIsOpen = false;
  editMode = false;
  pageSettingsViewIsActive = false;
  isLoading = false;
  hideBanner = false;

  static getPageCover(page: Page): string {
    if (page.hasCover()) {
      return page.cover;
    } else if (page.composition.hasCover()) {
      return page.composition.cover;
    } else if (page.composition.hasFavicon()) {
      return page.composition.favicon;
    } else {
      return page.cover;
    }
  }

  static getPageTitle(page: Page): string {
    return page.title || page.composition.title;
  }

  static getPageDescription(page: Page): string {
    return page.description || page.composition.title;
  }

  constructor(private footer: FooterDelegateService,
              private auth: AuthService,
              private pagesProvider: PagesService,
              private titleService: Title,
              private metaService: Meta,
              private location: Location,
              private windowRef: WindowRefService,
              private route: ActivatedRoute,
              protected router: Router,
              protected nav: NavbarDelegateService) {
  }

  get components(): ComponentCollection[] {
    return sortBy(this.page.components, 'index');
  }

  ngOnInit() {
    this.nav.displayNavbar(false);
    this.loadFromParams();
  }

  ngOnDestroy(): void {
    if (this.editMode) {
      this.footer.clearActionItems();
      this.footer.displayFooter(false);
    }
  }

  toggleMenu(): void {
    this.menuIsOpen = !this.menuIsOpen;
  }

  canRender(): boolean {
    return !!(this.page && this.page.composition);
  }

  shouldShowSwitchToEditModeBanner(): boolean {
    return !this.hideBanner && !this.editMode && this.currentUserIsPageAuthor();
  }

  siteNavigation(): Page[] {
    return this.page.composition.pages.filter(page => {
      return (page.published || this.currentUserIsPageAuthor()) && page.metadata && page.metadata.navigationItem;
    });
  }

  pageUrl(page: Page): string {
    if (page) {
      if (page.isExternalNavigationType()) {
        return this.getFormedExternalNavigationUrl(page.navigationHref);
      } else {
        return PagesService.getPublicPageUrl(page);
      }
    } else {
      return '';
    }
  }

  getFormedExternalNavigationUrl(url: string): string {
    // return absolute paths as they are defined
    if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    } else {
      const currentLocation = this.windowRef.nativeWindow.location.toString().split('#')[0];
      return currentLocation + url;
    }
  }

  openPageSettings(): void {
    this.router.navigate(['/pages/' + this.page.id + '/settings']).then(() => {
      this.pageSettingsViewIsActive = true;
    });
  }

  didClosePageSettings(): void {
    this.pageSettingsViewIsActive = false;
    this.isLoading = true;
    // save the page
    this.pagesProvider.update(this.page.id, this.page.asJson()).subscribe(() => {
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  navigateToThemeSettings(): void {
    this.router.navigate([`/admin/sites/${this.page.composition.id}/theme`], {
      queryParams: {showFooter: true, navigateToId: this.page.id}
    });
  }

  navigateToSites(): void {
    this.router.navigate([`/admin/sites`]);
  }

  navigateToPreview(): void {
    const url = PagesService.getPublicPageUrl(this.page);
    this.windowRef.nativeWindow.open(url, '_blank');
  }

  publishPage(makePublic: boolean): void {
    this.page.published = makePublic;
  }

  showPageNav(shouldShow: boolean): void {
    if (shouldShow !== this.page.hasHeader()) {
      const metadata = {...this.page.metadata, showNav: shouldShow};
      this.updatePageMetadata(metadata);
    }
  }

  useTransparentHeader(hasTransparentHeader: boolean): void {
    if (hasTransparentHeader !== this.page.hasTransparentHeader()) {
      const metadata = {...this.page.metadata, hasTransparentHeader: hasTransparentHeader};
      this.updatePageMetadata(metadata);
    }
  }

  currentUserIsPageAuthor(): boolean {
    if (this.page && this.auth.currentUser) {
      return this.page.user.id === this.auth.currentUser.id;
    } else {
      return false;
    }
  }

  /**
   * Update page metadata by sending request to API
   * @param metadata
   */
  private updatePageMetadata(metadata) {
    this.isLoading = true;
    this.pagesProvider.update(this.page.id, {
      metadata: metadata
    }).subscribe(() => {
      this.page.metadata = metadata;
      // ensure parent is synced to update site navigation
      this.page.composition.pages.map(page => {
        if (page.id === this.page.id) {
          page.metadata = metadata;
        }
        return page;
      });
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  /**
   * Initialize the objects that make up this Page from the current request url and query params.
   */
  private loadFromParams() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.route.queryParamMap.subscribe((queryParams: ParamMap) => {
        if (PageGuard.getPageId(params)) {
          this.loadPage(parseInt(params.get('pageId'), 10)).map((page: PageDataInterface) => {
            return new Page(page);
          }).subscribe((page: Page) => {
            this.page = page;
            this.editMode = queryParams.get('edit') === 'true';
            this.setDocumentTitle(page);
            this.setDocumentMetaTags(page);
            this.setDocumentFavicon(page);
            this.initializeFooter();
            this.addPageSlugToUrl(params, this.editMode, page);
            this.populateCache();
          });
        } else {
          return this.router.navigate(['/404']);
        }
      });
    });
  }

  /**
   * Load the configuration options for this Page. If editMode is set to true we load options and show the footer,
   * otherwise we assert that the footer is hidden.
   */
  private initializeFooter() {
    this.footer.displayFooter(this.editMode);
    if (this.editMode) {
      this.footer.setLeftActionItems([
        new NavActionItem('View Site Overview', {
          isButton: true,
          hasIcon: true,
          iconName: 'chevron-left',
          onInputClick: this.navigateToThemeSettings.bind(this)
        }),
        new NavActionItem('View Page settings', {
          isButton: true,
          hasIcon: true,
          iconName: 'settings',
          onInputClick: this.openPageSettings.bind(this)
        })
      ]);

      this.footer.setRightActionItems([
        new NavActionItem('Sync', {
          isButton: true,
          hasIcon: true,
          iconName: 'save'
        }),
        new NavActionItem('Preview Page', {
          isButton: true,
          hasIcon: true,
          iconName: 'external-link',
          onInputClick: this.navigateToPreview.bind(this),
        }),
      ]);
    }
  }

  /**
   * Load the Page associated with the current request url. There may be a Page object cached as a result of
   * PageGuard being activated. Check the cache first, otherwise load the Page via PagesProvider. If any error occurs,
   * redirect to the corresponding status page for the error code.
   * @param {number} pageId
   * @returns {Observable<PageDataInterface | any>}
   */
  private loadPage(pageId: number): Observable<PageDataInterface> {
    return new Observable(observer => {
      if (this.page) {
        observer.next(this.page.asJson());
      } else {
        this.route.data.subscribe((cachedPage: PageDataInterface) => {
          if (cachedPage) {
            observer.next(cachedPage);
          } else {
            this.pagesProvider.get(pageId).subscribe((page: PageDataInterface) => {
              observer.next(page);
            }, err => {
              return this.router.navigate([`/${err.status}`]);
            });
          }
        });
      }
    });
  }

  private setDocumentFavicon(page: Page) {
    if (page && page.composition) {
      Favicon.setFavicon(page.composition.favicon);
    }
  }

  private setDocumentTitle(page: Page) {
    this.titleService.setTitle(`${page.composition.title}${page.title ? ' – ' + page.title : ''}`);
  }

  private setDocumentMetaTags(page: Page) {
    this.metaService.updateTag({name: 'og:type', content: 'article'});
    // this.metaService.addTag({name: 'og:url', content: ''}); // TODO: canonicalized from site domain and page slug
    this.metaService.updateTag({name: 'og:site_name', content: page.composition.title});
    this.metaService.updateTag({name: 'twitter:card', content: 'summary'});
    this.metaService.updateTag({name: 'description', content: PageComponent.getPageDescription(page)});
    this.metaService.updateTag({name: 'og:description', content: PageComponent.getPageDescription(page)});
    this.metaService.updateTag({name: 'twitter:description', content: PageComponent.getPageDescription(page)});
    this.metaService.updateTag({itemprop: 'description', content: PageComponent.getPageDescription(page)});
    this.metaService.updateTag({name: 'title', content: PageComponent.getPageTitle(page)});
    this.metaService.updateTag({name: 'og:title', content: PageComponent.getPageTitle(page)});
    this.metaService.updateTag({name: 'twitter:title', content: PageComponent.getPageTitle(page)});
    this.metaService.updateTag({itemprop: 'name', content: PageComponent.getPageTitle(page)});
    this.metaService.updateTag({name: 'og:image', content: PageComponent.getPageCover(page)});
    this.metaService.updateTag({name: 'twitter:image', content: PageComponent.getPageCover(page)});
    this.metaService.updateTag({itemprop: 'image', content: PageComponent.getPageCover(page)});
  }

  private addPageSlugToUrl(params: ParamMap, editMode: boolean, page: Page) {
    if (PageGuard.shouldRedirectToPageWithSlug(page, editMode, params)) {
      const slug = getSlug(page.title);
      this.location.replaceState(`${this.location.path()}/${slug}`);
    }
  }

  private populateCache() {
    if (!this.editMode && this.page) {
      const pagesToCache = this.siteNavigation().filter(page => !page.isExternalNavigationType());
      Observable.forkJoin(pagesToCache.map(page => this.pagesProvider.get(page.id))).subscribe();
    }
  }
}
