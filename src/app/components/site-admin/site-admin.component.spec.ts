import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {MomentModule} from 'angular2-moment';
import {Observable} from 'rxjs/Observable';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {sitesServiceStub} from '../../../test/stubs/sites.service.stub.spec';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {APPLICATION_NAME, PageNavigationItemNavigationStrategy} from '../../index';
import {Composition} from '../../models/composition';
import {Page} from '../../models/page';
import {AuthService} from '../../providers/auth.service';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {mockPageData} from '../../providers/pages.service.spec';
import {SitesService} from '../../providers/sites.service';
import {mockComposition, mockCompositionData} from '../../providers/sites.service.spec';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';

import {SiteAdminComponent} from './site-admin.component';
import {DomSanitizer} from '@angular/platform-browser';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';
import {routerStub} from '../../../test/stubs/router.stub.spec';

describe('SiteAdminComponent', () => {
  let component: SiteAdminComponent;
  let fixture: ComponentFixture<SiteAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SiteAdminComponent],
      imports: [
        MomentModule,
        FormsModule,
        RouterTestingModule,
      ],
      providers: [
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: AuthService, useValue: authServiceStub},
        {provide: NavbarDelegateService, useValue: navbarNotifierStub},
        {provide: PagesService, useValue: pagesServiceStub},
        {provide: SitesService, useValue: sitesServiceStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: DomSanitizer, useValue: mockDomSanitizer},
        {provide: WindowRefService, useValue: windowRefStub},
        {provide: APPLICATION_NAME, useFactory: appTitleFactory},
        UtilService,
        MessageChannelDelegateService,
      ],
      schemas: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should load site data', fakeAsync(() => {
    const sitesProvider = getTestBed().get(SitesService);
    spyOn(sitesProvider, 'get').and.callThrough();
    fixture.detectChanges();
    component.loadSiteData();
    tick();
    expect(sitesProvider.get).toHaveBeenCalled();
  }));

  it('should display the footer on init if query params are present', fakeAsync(() => {
    const route = getTestBed().get(ActivatedRoute);
    const footer = getTestBed().get(FooterDelegateService);
    const router = getTestBed().get(Router);
    spyOn(route.queryParamMap, 'subscribe').and.callFake(callback => {
      callback({
        get: (key) => {
          const obj = {
            showFooter: true,
            navigateToId: 1
          };
          return obj[key];
        }
      });
    });
    spyOn(footer, 'displayFooter').and.callThrough();
    spyOn(footer, 'setRightActionItems').and.callThrough();
    spyOn(router, 'navigate');
    footer.rightActionItems$.subscribe(items => {
      const item = items[0];
      if (item) {
        item.onInputClick();
        tick();
        expect(router.navigate).toHaveBeenCalled();
      }
    });
    component.ngOnInit();
    tick();
    expect(footer.displayFooter).toHaveBeenCalled();
    expect(footer.setRightActionItems).toHaveBeenCalled();
  }));

  it('should navigate to an error page based on status code returned by sites provider (401)', fakeAsync(() => {
    const sitesProvider = getTestBed().get(SitesService);
    const router = getTestBed().get(Router);
    spyOn(sitesProvider, 'get').and.callFake(() => {
      return new Observable(observer => {
        observer.error({status: 401});
      });
    });
    spyOn(router, 'navigate');
    fixture.detectChanges();
    component.loadSiteData();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/401']);
  }));

  it('should navigate to an error page based on status code returned by sites provider (404)', fakeAsync(() => {
    const sitesProvider = getTestBed().get(SitesService);
    const router = getTestBed().get(Router);
    spyOn(sitesProvider, 'get').and.callFake(() => {
      return new Observable(observer => {
        observer.error({status: 404});
      });
    });
    spyOn(router, 'navigate');
    fixture.detectChanges();
    component.loadSiteData();
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/404']);
  }));

  it('should provide a getter for the sites navigation items', () => {
    const data = Object.assign({}, mockCompositionData, {
      pages: [
        {metadata: {navigationItem: true}},
        {metadata: {navigationItem: true}},
        {metadata: {navigationItem: false}}
      ]
    });
    component.site = new Composition(data);
    expect(component.navigationItems.length).toEqual(2);
  });

  it('should provide a getter for the sites non navigation items', () => {
    const data = Object.assign({}, mockCompositionData, {
      pages: [
        {metadata: {navigationItem: true}},
        {metadata: {navigationItem: true}},
        {metadata: {navigationItem: false}}
      ]
    });
    component.site = new Composition(data);
    expect(component.pages.length).toEqual(1);
  });

  it('should return the name of the current child route', () => {
    fixture = TestBed.createComponent(SiteAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const route = getTestBed().get(ActivatedRoute);
    route.firstChild.routeConfig.path = 'settings';
    expect(component.routePath()).toEqual('settings');
  });

  it('should return a title based on the current child route', () => {
    fixture = TestBed.createComponent(SiteAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const route = getTestBed().get(ActivatedRoute);
    route.firstChild.routeConfig.path = 'settings';
    expect(component.title).toEqual('Site Configuration');

    route.firstChild.routeConfig.path = 'pages';
    expect(component.title).toEqual('Pages');

    route.firstChild.routeConfig.path = 'navigation';
    expect(component.title).toEqual('Site Navigation');

    route.firstChild.routeConfig.path = 'theme';
    expect(component.title).toEqual('Theme Configuration');

    route.firstChild.routeConfig.path = 'advanced';
    expect(component.title).toEqual('Advanced Settings');

    route.firstChild.routeConfig.path = 'files';
    expect(component.title).toEqual('Files');
  });

  describe('pages', () => {
    it('should add a new page to the sites list of pages', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p = new Page(Object.assign({}, mockPageData, {metadata: {index: 100}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p];
      spyOn(pagesProvider, 'create').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.next(mockPageData);
        });
      });
      component.addChildPage();
      setTimeout(() => {
        expect(component.site.pages.length).toEqual(2);
      });
      tick();
    }));

    it('should add navigation type metadata when adding a new page to the sites list of pages', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p = new Page(Object.assign({}, mockPageData, {metadata: {index: 100}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p];
      spyOn(pagesProvider, 'create').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.next(Object.assign({}, mockPageData, {metadata: {navigationItem: true}}));
        });
      });
      spyOn(component, 'addChildPage').and.callThrough();
      component.addChildPageAsNavItem();
      setTimeout(() => {
        expect(component.site.pages.length).toEqual(2);
        expect(component.site.pages[1].metadata.navigationItem).toEqual(true);
        expect(component.addChildPage).toHaveBeenCalledWith({
          index: 101,
          navigationItem: true,
          showNav: true,
          navigationType: PageNavigationItemNavigationStrategy.Internal
        });
      });
      tick();
    }));

    it('should handle errors when adding a new page to the sites list of pages', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      component.site = new Composition(mockCompositionData);
      expect(component.site.pages.length).toEqual(0);
      spyOn(pagesProvider, 'create').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.error(new Error('Bad'));
        });
      });
      component.addChildPage();
      setTimeout(() => {
        expect(component.site.pages.length).toEqual(0);
      });
      tick();
    }));

    it('should remove a page', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p = new Page(mockPageData);
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p];
      spyOn(pagesProvider, 'destroy').and.callThrough();
      component.removePage(p.id);
      setTimeout(() => {
        expect(component.site.pages.length).toEqual(0);
      });
      tick();
    }));

    it('should swap a page with another \'upwards\'', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      spyOn(pagesProvider, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.next(mockPageData);
        });
      });

      component.swapPageUpwards(p2);

      setTimeout(() => {
        expect(pagesProvider.update).toHaveBeenCalled();
        expect(component.site.pages[0]).toEqual(p2);
      });
      tick();
    }));

    it('should handle errors when swapping a page with another \'upwards\'', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      spyOn(pagesProvider, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.error(new Error('Mock error in swap upwards'));
        });
      });

      component.swapPageUpwards(p2);

      setTimeout(() => {
        expect(pagesProvider.update).toHaveBeenCalled();
        expect(component.site.pages[0]).toEqual(p1);
      });
      tick();
    }));

    it('should handle inner errors when swapping a page with another \'upwards\'', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      const spy = spyOn(pagesProvider, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          if (spy.calls.count() === 2) {
            subscriber.error(new Error('Mock error in swap upwards'));
          } else {
            subscriber.next(mockPageData);
          }
        });
      });

      component.swapPageUpwards(p2);

      setTimeout(() => {
        expect(pagesProvider.update).toHaveBeenCalled();
        expect(component.site.pages[0]).toEqual(p1);
      });
      tick();
    }));

    it('should swap a page with another \'downwards\'', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      spyOn(pagesProvider, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.next(mockPageData);
        });
      });

      component.swapPageDownwards(p1);

      setTimeout(() => {
        expect(pagesProvider.update).toHaveBeenCalled();
        expect(component.site.pages[0]).toEqual(p2);
      });
      tick();
    }));

    it('should handle errors when swapping a page with another \'downwards\'', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      spyOn(pagesProvider, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.error(new Error('Mock error in swap downwards'));
        });
      });

      component.swapPageDownwards(p1);

      setTimeout(() => {
        expect(pagesProvider.update).toHaveBeenCalled();
        expect(component.site.pages[0]).toEqual(p1);
      });
      tick();
    }));

    it('should handle inner errors when swapping a page with another \'downwards\'', fakeAsync(() => {
      const pagesProvider = getTestBed().get(PagesService);
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      const spy = spyOn(pagesProvider, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          if (spy.calls.count() === 2) {
            subscriber.error(new Error('Mock error in swap downwards'));
          } else {
            subscriber.next(mockPageData);
          }
        });
      });

      component.swapPageDownwards(p1);

      setTimeout(() => {
        expect(pagesProvider.update).toHaveBeenCalled();
        expect(component.site.pages[0]).toEqual(p1);
      });
      tick();
    }));

    it('should set edit mode when given a page', () => {
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];
      expect(component.pageCopy).toEqual(null);
      component.setEditModeOnPage(p1);
      expect(component.pageCopy.id).toEqual(p1.id);
    });

    it('should revert edit mode when given a null arg', () => {
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      component.setEditModeOnPage(p1);
      expect(component.pageCopy.id).toEqual(p1.id);
      component.setEditModeOnPage(null);
      expect(component.pageCopy).toEqual(null);
    });

    it('should update a page name', fakeAsync(() => {
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      const pagesProvider = getTestBed().get(PagesService);
      spyOn(pagesProvider, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.next(mockPageData);
        });
      });
      component.setEditModeOnPage(p1);
      component.updatePageName(p1);
      setTimeout(() => {
        expect(pagesProvider.update).toHaveBeenCalled();
        expect(component.pageCopy).toBeNull();
      });
      tick();
    }));

    it('should handle errors when updating a page name', fakeAsync(() => {
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      const p2 = new Page(Object.assign({}, mockPageData, {metadata: {index: 1}}));
      component.site = new Composition(mockCompositionData);
      component.site.pages = [p1, p2];

      const pagesProvider = getTestBed().get(PagesService);
      spyOn(pagesProvider, 'update').and.callFake(() => {
        return new Observable(subscriber => {
          subscriber.error(new Error('Mock error in update page title'));
        });
      });
      component.setEditModeOnPage(p1);
      component.updatePageName(p1);
      setTimeout(() => {
        expect(pagesProvider.update).toHaveBeenCalled();
        expect(component.pageCopy).toBeNull();
      });
      tick();
    }));

    it('should provide a method to tell if the user intends to edit the name of a page', () => {
      const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      expect(component.willEditPage(p1)).toEqual(false);

      component.pageCopy = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
      expect(component.willEditPage(p1)).toEqual(true);
    });

    it('should listen for messages on init to set the site', () => {
      const channel = getTestBed().get(MessageChannelDelegateService);
      expect(component.site).toEqual(null);
      channel.sendMessage({topic: SiteAdminComponent.SiteAdminSiteDidLoad, data: mockComposition()});
      component.ngOnInit();
      expect(component.site).not.toBeNull();
    });
  });
});
