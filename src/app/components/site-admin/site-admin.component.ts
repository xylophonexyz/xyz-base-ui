import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, Meta, Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {APPLICATION_NAME, CompositionDataInterface, PageDataInterface} from '../../index';
import {Composition} from '../../models/composition';
import {NavActionItem} from '../../models/nav-action-item';
import {Page} from '../../models/page';
import {AuthService} from '../../providers/auth.service';
import {Favicon} from '../../providers/favicon.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {SitesService} from '../../providers/sites.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';

@Component({
  selector: 'app-site-admin',
  templateUrl: './site-admin.component.html',
  styleUrls: ['./site-admin.component.scss']
})
export class SiteAdminComponent implements OnInit, OnDestroy {

  static readonly SiteAdminPath = {
    Settings: 'settings',
    Pages: 'pages',
    Navigation: 'navigation',
    Theme: 'theme',
    Advanced: 'advanced'
  };

  static readonly SiteAdminSiteDidLoad = 'SiteAdmin::SiteDidLoad';

  site: Composition = null;
  siteCopy: Composition = null;
  pageCopy: Page = null;
  isLoading = false;

  protected _siteId: number = null;

  constructor(protected auth: AuthService,
              protected router: Router,
              protected nav: NavbarDelegateService,
              protected sitesProvider: SitesService,
              protected pagesProvider: PagesService,
              protected componentCollectionService: ComponentCollectionService,
              protected componentService: ComponentService,
              protected channel: MessageChannelDelegateService,
              protected titleService: Title,
              protected metaService: Meta,
              protected footer: FooterDelegateService,
              protected windowRef: WindowRefService,
              protected route: ActivatedRoute,
              protected sanitizer: DomSanitizer,
              @Inject(APPLICATION_NAME) private appTitle) {
  }

  get title(): string {
    switch (this.routePath()) {
      case SiteAdminComponent.SiteAdminPath.Settings:
        return 'Site Configuration';
      case SiteAdminComponent.SiteAdminPath.Pages:
        return 'Pages';
      case SiteAdminComponent.SiteAdminPath.Navigation:
        return 'Site Navigation';
      case SiteAdminComponent.SiteAdminPath.Theme:
        return 'Theme Configuration';
      case SiteAdminComponent.SiteAdminPath.Advanced:
        return 'Advanced Settings';
      default:
        return '';
    }
  }

  get navigationItems(): Page[] {
    return this.site.pages.filter(p => {
      return p.metadata.navigationItem;
    });
  }

  get pages(): Page[] {
    return this.site.pages.filter(p => {
      return !p.metadata.navigationItem;
    });
  }

  ngOnInit() {
    this.onParentInit();
    this.setFooter();
    this.setDocumentTitle();
    this.setDocumentMetaTags();
    this.setDocumentFavicon();
  }

  ngOnDestroy() {
    this.footer.clearActionItems();
    this.footer.displayFooter(false);
  }

  routePath(): string {
    if (this.route.firstChild) {
      return this.route.firstChild.routeConfig.path;
    }
  }

  loadSiteData(): Promise<Composition> {
    return new Promise(resolve => {
      this.isLoading = true;
      this.sitesProvider.get(this._siteId).subscribe((c: CompositionDataInterface) => {
        this.site = new Composition(c);
        this.isLoading = false;
        resolve(this.site);
      }, (err) => {
        if (err.status === 404) {
          this.router.navigate(['/404']);
        } else {
          this.router.navigate(['/401']);
        }
        this.isLoading = false;
        resolve(null);
      });
    });
  }

  addChildPage(metadata?: any): void {
    metadata = metadata || {
      index: this.getLastPageIndex() + 1,
      navigationItem: false,
      showNav: true
    };
    this.pagesProvider.create({
      composition_id: this.site.id,
      published: true,
      metadata: metadata
    }).subscribe((p: PageDataInterface) => {
      this.site.pages.push(new Page(p));
    }, err => {
      console.error(err);
    });
  }

  addChildPageAsNavItem(): void {
    this.addChildPage({
      index: this.getLastPageIndex() + 1,
      navigationItem: true,
      showNav: true
    });
  }

  swapPageUpwards(source: Page): void {
    let didSwap = false;
    this.site.pages = this.site.pages.map((target: Page) => {
      if (!didSwap && Page.swap(source, target, -1)) {
        didSwap = true;
        this.pagesProvider.update(source.id, {metadata: source.metadata}).subscribe(() => {
          this.pagesProvider.update(target.id, {metadata: target.metadata}).subscribe(null, () => {
            Page.swap(target, source, -1); // revert
          });
        }, () => {
          Page.swap(target, source, -1); // revert
        });
      }
      return target;
    }).sort(Page.sortFn);
  }

  swapPageDownwards(source: Page): void {
    let didSwap = false;
    this.site.pages = this.site.pages.map((target: Page) => {
      if (!didSwap && Page.swap(source, target, 1)) {
        didSwap = true;
        this.pagesProvider.update(source.id, {metadata: source.metadata}).subscribe(() => {
          this.pagesProvider.update(target.id, {metadata: target.metadata}).subscribe(null, () => {
            Page.swap(target, source, 1); // revert
          });
        }, () => {
          Page.swap(target, source, 1); // revert
        });
      }
      return target;
    }).sort(Page.sortFn);
  }

  removePage(pageId: number): void {
    if (this.windowRef.nativeWindow.confirm('Are you sure you want to delete this page?')) {
      this.pagesProvider.destroy(pageId).subscribe(() => {
        this.site.pages = this.site.pages.filter(p => {
          return p.id !== pageId;
        });
      });
    }
  }

  setEditModeOnPage(page: Page): void {
    if (page) {
      this.pageCopy = new Page(page.asJson());
    } else {
      this.pageCopy = null;
    }
  }

  willEditPage(page: Page): boolean {
    return !!(this.pageCopy && this.pageCopy.id === page.id);
  }

  updateSiteMetadata(): void {
    this.isLoading = true;
    const params = {
      metadata: this.site.metadata
    };
    this.sitesProvider.update(this.site.id, params).subscribe(() => {
      this.isLoading = false;
    }, (err) => {
      console.error(err);
    });
  }

  updatePageName(page: Page): void {
    if (page && this.pageCopy) {
      const params = {
        title: this.pageCopy.title,
        metadata: page.metadata
      };
      this.isLoading = true;
      page.title = this.pageCopy.title;
      this.pageCopy = null;
      this.pagesProvider.update(page.id, params).subscribe(() => {
        this.isLoading = false;
      }, (err) => {
        console.error(err);
      });
    }
  }

  protected getLastPageIndex(): number {
    let max = 0;
    this.site.pages.forEach(p => {
      if (p.index > max) {
        max = p.index;
      }
    });
    return max;
  }

  protected onParentInit() {
    this.channel.messages$.subscribe(message => {
      if (message.topic === SiteAdminComponent.SiteAdminSiteDidLoad) {
        this.site = message.data;
      }
    });
  }

  protected onChildInit() {
    // display the navbar if the user is authenticated
    this.auth.authenticate().then(() => {
      this.nav.displayNavbar(true);
    }).catch(() => {
      this.nav.displayNavbar(false);
    });
    // load the site object
    this.route.parent.params.subscribe(params => {
      if (params.id) {
        this._siteId = +params.id;
        this.loadSiteData().then(site => {
          this.channel.sendMessage({topic: SiteAdminComponent.SiteAdminSiteDidLoad, data: site});
        });
      }
    });
  }

  private setDocumentTitle() {
    this.titleService.setTitle(this.appTitle());
  }

  private setDocumentMetaTags() {
    this.metaService.removeTag('name="og:type"');
    this.metaService.removeTag('name="og:site_name"');
    this.metaService.removeTag('name="twitter:card"');
    this.metaService.removeTag('name="description"');
    this.metaService.removeTag('name="og:description"');
    this.metaService.removeTag('name="twitter:description"');
    this.metaService.removeTag('itemprop="description"');
    this.metaService.removeTag('name="title"');
    this.metaService.removeTag('name="og:title"');
    this.metaService.removeTag('name="twitter:title"');
    this.metaService.removeTag('itemprop="title"');
    this.metaService.removeTag('name="og:image"');
    this.metaService.removeTag('name="twitter:image"');
    this.metaService.removeTag('itemprop="image"');
  }

  private setDocumentFavicon() {
    Favicon.resetFavicon();
  }

  private setFooter() {
    this.route.queryParams.subscribe(params => {
      if (params.showFooter && params.navigateToId) {
        this.footer.displayFooter(true);
        this.footer.setRightActionItems([
          new NavActionItem('Back to editing ›', {
            isButton: true,
            hasIcon: false,
            cssClass: 'is-outlined is-success',
            onInputClick: () => {
              this.router.navigate([`/p/${params.navigateToId}`], {
                queryParams: {edit: true}
              });
            }
          }),
        ]);
      }
    });
  }

}
