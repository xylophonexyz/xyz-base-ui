import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Observable} from 'rxjs/Observable';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {XzRichTextMock} from '../../../test/stubs/rich-text-directive.stub.spec';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {ContentEditableModelDirective} from '../../directives/content-editable-model/content-editable-model.directive';
import {XzPopoverModule} from '../../directives/popover/popover.module';
import {ToggleOnClickDirective} from '../../directives/toggle-on-click/toggle-on-click.directive';
import {ComponentCollection} from '../../models/component-collection';
import {mockComponentCollectionData} from '../../models/component-collection.spec';
import {Page} from '../../models/page';
import {User} from '../../models/user';
import {mockUserData} from '../../models/user.spec';
import {AuthService} from '../../providers/auth.service';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {mockPage, mockPageData} from '../../providers/pages.service.spec';
import {WindowRefService} from '../../providers/window-ref.service';
import {UIComponentCollectionComponent} from '../component-collection/component-collection.component';
import {UIEmbedComponent} from '../embed-component/embed.component';
import {UIImageComponent} from '../image-component/image-component.component';
import {ModalComponent} from '../modal/modal.component';
import {PageUIComponentCollectionAdditionComponent} from '../page-component-addition/page-component-addition.component';
import {UISectionComponent} from '../section-component/section-component.component';
import {UISpacerComponent} from '../spacer-component/spacer-component.component';
import {SpinnerComponent} from '../spinner/spinner.component';
import {UITextComponent} from '../text-component/text-component.component';

import {PageComponent} from './page.component';
import {UIFreeFormHtmlComponent} from '../free-form-html-component/free-form-html-component.component';
import {PageDataInterface, PageNavigationItemNavigationStrategy} from '../../index';
import {XzChangeBgColorOnHoverDirective} from '../../directives/xz-change-bg-color-on-hover/xz-change-bg-color-on-hover.directive';

describe('PageComponent', () => {
  let component: PageComponent;
  let fixture: ComponentFixture<PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: NavbarDelegateService, useValue: navbarNotifierStub},
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: AuthService, useValue: authServiceStub},
        {provide: PagesService, useValue: pagesServiceStub},
        {provide: Router, useValue: routerStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: WindowRefService, useValue: windowRefStub},
        Title,
        Meta,
      ],
      imports: [
        RouterTestingModule,
        XzPopoverModule,
        FormsModule,
        FeatherModule
      ],
      declarations: [
        ToggleOnClickDirective,
        SpinnerComponent,
        PageComponent,
        ModalComponent,
        PageUIComponentCollectionAdditionComponent,
        UIComponentCollectionComponent,
        UITextComponent,
        UIImageComponent,
        UISpacerComponent,
        UISectionComponent,
        UIFreeFormHtmlComponent,
        UIEmbedComponent,
        ContentEditableModelDirective,
        XzRichTextMock,
        XzChangeBgColorOnHoverDirective
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the main application navbar on init', () => {
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'displayNavbar').and.callThrough();
    component.ngOnInit();
    expect(nav.displayNavbar).toHaveBeenCalledWith(false);
  });

  it('should load the page associated with the id in params on init', async(() => {
    const auth = getTestBed().get(AuthService);
    const pagesProvider = getTestBed().get(PagesService);
    const route = getTestBed().get(ActivatedRoute);
    const footer = getTestBed().get(FooterDelegateService);

    spyOn(footer, 'displayFooter').and.stub();
    spyOn(footer, 'setLeftActionItems').and.stub();
    spyOn(footer, 'clearCenterActionItems').and.stub();
    spyOn(footer, 'setRightActionItems').and.stub();
    spyOn(route.paramMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            siteId: 1,
            pageId: 2
          };
          return obj[key];
        }
      });
    });
    spyOn(route.data, 'subscribe').and.callFake((callback) => {
      callback(null);
    });
    auth.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(new User(mockUserData)));
    });
    spyOn(pagesProvider, 'get').and.callThrough();

    component.ngOnInit();

    setTimeout(() => {
      expect(route.paramMap.subscribe).toHaveBeenCalled();
      expect(auth.authenticate).toHaveBeenCalled();
      expect(pagesProvider.get).toHaveBeenCalled();
    });
  }));

  it('should load the pages navigation items on init', async(() => {
    const auth = getTestBed().get(AuthService);
    const pagesProvider = getTestBed().get(PagesService);
    const route = getTestBed().get(ActivatedRoute);
    const footer = getTestBed().get(FooterDelegateService);

    spyOn(footer, 'displayFooter').and.stub();
    spyOn(footer, 'setLeftActionItems').and.stub();
    spyOn(footer, 'clearCenterActionItems').and.stub();
    spyOn(footer, 'setRightActionItems').and.stub();
    spyOn(route.paramMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            siteId: 1,
            pageId: 2
          };
          return obj[key];
        }
      });
    });
    spyOn(route.data, 'subscribe').and.callFake((callback) => {
      callback(null);
    });
    auth.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(new User(mockUserData)));
    });
    spyOn(pagesProvider, 'get').and.callThrough();
    spyOn(component, 'siteNavigation').and.returnValue([
      new Page({
        id: 2,
        metadata: {
          navigationType: PageNavigationItemNavigationStrategy.Internal
        }
      } as PageDataInterface),
      new Page({
        id: 3,
        metadata: {
          navigationType: PageNavigationItemNavigationStrategy.Internal
        }
      } as PageDataInterface),
    ]);

    component.ngOnInit();

    setTimeout(() => {
      expect(pagesProvider.get).toHaveBeenCalledWith(2);
      expect(pagesProvider.get).toHaveBeenCalledWith(3);
    });
  }));

  it('should load the page from the route cache if it is there', async(() => {
    const auth = getTestBed().get(AuthService);
    const pagesProvider = getTestBed().get(PagesService);
    const route = getTestBed().get(ActivatedRoute);
    const footer = getTestBed().get(FooterDelegateService);

    spyOn(footer, 'displayFooter').and.stub();
    spyOn(footer, 'setLeftActionItems').and.stub();
    spyOn(footer, 'clearCenterActionItems').and.stub();
    spyOn(footer, 'setRightActionItems').and.stub();
    spyOn(route.paramMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            siteId: 1,
            pageId: 2
          };
          return obj[key];
        }
      });
    });
    spyOn(route.data, 'subscribe').and.callFake((callback) => {
      callback(Object.assign({}, mockPageData));
    });
    auth.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(new User(mockUserData)));
    });
    spyOn(pagesProvider, 'get').and.callThrough();

    component.ngOnInit();

    setTimeout(() => {
      expect(route.paramMap.subscribe).toHaveBeenCalled();
      expect(auth.authenticate).toHaveBeenCalled();
      expect(pagesProvider.get).not.toHaveBeenCalled();
    });
  }));

  it('should load the page from the memory cache if it is there', async(() => {
    const auth = getTestBed().get(AuthService);
    const pagesProvider = getTestBed().get(PagesService);
    const route = getTestBed().get(ActivatedRoute);
    const footer = getTestBed().get(FooterDelegateService);

    spyOn(footer, 'displayFooter').and.stub();
    spyOn(footer, 'setLeftActionItems').and.stub();
    spyOn(footer, 'clearCenterActionItems').and.stub();
    spyOn(footer, 'setRightActionItems').and.stub();
    spyOn(route.paramMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            siteId: 1,
            pageId: 2
          };
          return obj[key];
        }
      });
    });
    component.page = mockPage();
    auth.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(new User(mockUserData)));
    });
    spyOn(pagesProvider, 'get').and.callThrough();

    component.ngOnInit();

    setTimeout(() => {
      expect(route.paramMap.subscribe).toHaveBeenCalled();
      expect(auth.authenticate).toHaveBeenCalled();
      expect(pagesProvider.get).not.toHaveBeenCalled();
    });
  }));

  it('should initialize the footer in edit mode', async(() => {
    const auth = getTestBed().get(AuthService);
    const route = getTestBed().get(ActivatedRoute);
    const footer = getTestBed().get(FooterDelegateService);

    spyOn(route.paramMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            siteId: 1,
            pageId: 2
          };
          return obj[key];
        }
      });
    });
    spyOn(route.data, 'subscribe').and.callFake((callback) => {
      callback(null);
    });
    spyOn(route.queryParamMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            edit: 'true'
          };
          return obj[key];
        }
      });
    });
    auth.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(new User(mockUserData)));
    });
    spyOn(footer, 'displayFooter');
    spyOn(footer, 'setLeftActionItems');
    spyOn(footer, 'setRightActionItems');

    component.ngOnInit();

    setTimeout(() => {
      expect(component.editMode).toEqual(true);
      expect(footer.displayFooter).toHaveBeenCalledWith(true);
      expect(footer.setLeftActionItems).toHaveBeenCalled();
      expect(footer.setRightActionItems).toHaveBeenCalled();
    });
  }));

  it('should navigate to an error screen if the page id is not present in params', async(() => {
    const route = getTestBed().get(ActivatedRoute);
    const router = getTestBed().get(Router);

    spyOn(route.paramMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            siteId: 1,
            pageId: null
          };
          return obj[key];
        }
      });
    });

    component.ngOnInit();

    setTimeout(() => {
      expect(route.paramMap.subscribe).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/404']);
    });
  }));

  it('should should handle an error if authentication fails', async(() => {
    const auth = getTestBed().get(AuthService);
    const route = getTestBed().get(ActivatedRoute);
    const router = getTestBed().get(Router);

    spyOn(route.paramMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            siteId: 1,
            pageId: 2
          };
          return obj[key];
        }
      });
    });
    auth.authenticate.and.callFake(() => {
      return new Promise((_, reject) => reject(null));
    });

    component.ngOnInit();

    setTimeout(() => {
      expect(route.paramMap.subscribe).toHaveBeenCalled();
      expect(auth.authenticate).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalled();
    });
  }));

  it('should handle errors loading the page object', async(() => {
    const auth = getTestBed().get(AuthService);
    const pagesProvider = getTestBed().get(PagesService);
    const route = getTestBed().get(ActivatedRoute);
    const router = getTestBed().get(Router);

    spyOn(route.paramMap, 'subscribe').and.callFake((callback) => {
      callback({
        get: (key) => {
          const obj = {
            siteId: 1,
            pageId: 2
          };
          return obj[key];
        }
      });
    });
    spyOn(route.data, 'subscribe').and.callFake((callback) => {
      callback(null);
    });
    auth.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(new User(mockUserData)));
    });
    spyOn(pagesProvider, 'get').and.callFake(() => {
      return new Observable(observer => {
        observer.error({status: 400});
      });
    });

    component.ngOnInit();

    setTimeout(() => {
      expect(route.paramMap.subscribe).toHaveBeenCalled();
      expect(auth.authenticate).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalled();
    });
  }));

  it('should provide a method to toggle the mobile menu', () => {
    expect(component.menuIsOpen).toEqual(false);
    component.toggleMenu();
    expect(component.menuIsOpen).toEqual(true);
  });

  it('should provide the siteNavigation', () => {
    component.page = mockPage();
    const p1 = new Page(Object.assign({}, mockPageData));
    const p2 = new Page(Object.assign({}, mockPageData, {published: true, metadata: {navigationItem: true}}));
    component.page.composition.pages = [p1, p2];
    expect(component.siteNavigation()).toEqual([p2]);
  });

  it('should provide a method to tell if the entire component is ready to render', () => {
    expect(component.canRender()).toEqual(false);
    component.page = mockPage();
    expect(component.canRender()).toEqual(true);
  });

  it('should provide a method to navigate to the site theme settings page', () => {
    const router = getTestBed().get(Router);
    component.page = mockPage();
    expect(component.navigateToThemeSettings());
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should provide a method to navigate to the page preview page', () => {
    const router = getTestBed().get(Router);
    component.page = mockPage();
    expect(component.navigateToPreview());
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should provide a method to navigate to the sites page', () => {
    const router = getTestBed().get(Router);
    component.page = mockPage();
    expect(component.navigateToSites());
    expect(router.navigate).toHaveBeenCalled();
  });

  it('should update the page when didClosePageSettings is called', async(() => {
    const pagesProvider = getTestBed().get(PagesService);
    spyOn(pagesProvider, 'update').and.callThrough();
    component.page = mockPage();
    component.didClosePageSettings();
    setTimeout(() => {
      expect(pagesProvider.update).toHaveBeenCalledWith(component.page.id, component.page.asJson());
      expect(component.isLoading).toEqual(false);
    });
  }));

  it('should provide a getter for the page component collections', () => {
    component.page = mockPage(mockPageData);
    expect(component.components.length).toEqual(1);
  });

  it('should sort the page component collections by index', () => {
    component.page = mockPage(mockPageData);
    const c1 = Object.assign({}, mockComponentCollectionData, {index: 0});
    const c2 = Object.assign({}, mockComponentCollectionData, {index: 3});
    const c3 = Object.assign({}, mockComponentCollectionData, {index: 6});
    component.page.components.push(new ComponentCollection(c3));
    component.page.components.push(new ComponentCollection(c2));
    component.page.components.push(new ComponentCollection(c1));
    expect(component.components.pop().index).toEqual(c3.index);
  });

  it('should provide a method to return a router link url for a page', () => {
    const p1 = new Page(Object.assign({}, mockPageData, {id: 456}));
    component.page = mockPage();
    expect(component.pageUrl(p1)).toEqual(`/${p1.title.toLowerCase()}-${p1.id}`);
    component.page = null;
    expect(component.pageUrl(null)).toEqual('');
  });

  it('should provide a method to return an external url for a page', () => {
    const p1 = new Page(Object.assign({}, mockPageData, {
      metadata: {
        navigationType: PageNavigationItemNavigationStrategy.External,
        navigationHref: 'http://foo.com'
      }
    }));
    expect(component.pageUrl(p1)).toEqual('http://foo.com');
    const p2 = new Page(Object.assign({}, mockPageData, {
      metadata: {
        navigationType: PageNavigationItemNavigationStrategy.External,
        navigationHref: 'foo'
      }
    }));
    expect(component.pageUrl(p2)).toContain('foo');
  });

  it('should provide a method to publish or unpublish a page', async(() => {
    component.page = mockPage();
    component.page.composition.pages = [component.page];
    component.publishPage(true);
    expect(component.page.published).toEqual(true);
  }));

  it('should handle errors when publishing a page', async(() => {
    const pagesProvider = getTestBed().get(PagesService);
    spyOn(pagesProvider, 'update').and.callFake(() => {
      return new Observable(observer => {
        observer.error(new Error('Mock error on page publish'));
      });
    });
    component.page = mockPage();
    component.didClosePageSettings();
    setTimeout(() => {
      expect(pagesProvider.update).toHaveBeenCalledWith(component.page.id, component.page.asJson());
      expect(component.isLoading).toEqual(false);
    });
  }));

  it('should provide a method to hide or show the header', async(() => {
    const pagesProvider = getTestBed().get(PagesService);
    spyOn(pagesProvider, 'update').and.callThrough();
    component.page = mockPage();
    component.page.composition.pages = [component.page];
    component.showPageNav(true);
    setTimeout(() => {
      expect(pagesProvider.update).toHaveBeenCalled();
      expect(component.page.hasHeader()).toEqual(true);
      expect(component.isLoading).toEqual(false);
    });
  }));

  it('should provide a method to make the header transparent', async(() => {
    const pagesProvider = getTestBed().get(PagesService);
    spyOn(pagesProvider, 'update').and.callThrough();
    component.page = mockPage();
    component.page.composition.pages = [component.page];
    component.useTransparentHeader(true);
    setTimeout(() => {
      expect(pagesProvider.update).toHaveBeenCalled();
      expect(component.page.hasTransparentHeader()).toEqual(true);
      expect(component.isLoading).toEqual(false);
    });
  }));

  it('should handle errors when publishing a page', async(() => {
    const pagesProvider = getTestBed().get(PagesService);
    spyOn(pagesProvider, 'update').and.callFake(() => {
      return new Observable(observer => {
        observer.error(new Error('Mock error on page publish'));
      });
    });
    component.page = mockPage();
    component.page.composition.pages = [component.page];
    component.showPageNav(true);
    setTimeout(() => {
      expect(pagesProvider.update).toHaveBeenCalled();
      expect(component.isLoading).toEqual(false);
    });
  }));

  describe('Checks', () => {
    it('should provide a method to check if the current user is the post author', () => {
      const auth = getTestBed().get(AuthService);
      auth.currentUser = new User(mockUserData);
      component.page = mockPage();
      expect(component.currentUserIsPageAuthor()).toEqual(true);
      auth.currentUser = null;
      expect(component.currentUserIsPageAuthor()).toEqual(false);
    });

    it('should provide a method to hide the switch to edit mode banner', () => {
      component.hideBanner = false;
      component.editMode = false;
      spyOn(component, 'currentUserIsPageAuthor').and.returnValue(true);
      expect(component.shouldShowSwitchToEditModeBanner()).toEqual(true);
      component.hideBanner = true;
      expect(component.shouldShowSwitchToEditModeBanner()).toEqual(false);
    });
  });

  describe('Page static methods', () => {
    it('should provide a method to return a page title with fallbacks', () => {
      let page: Page = mockPage();
      expect(PageComponent.getPageTitle(page)).toEqual(page.title);
      page.metadata = null;
      page.title = null;
      page.composition.title = 'foo';
      expect(PageComponent.getPageTitle(page)).toEqual('foo');
      page = mockPage({} as PageDataInterface);
      page.title = null;
      expect(PageComponent.getPageTitle(page)).toEqual('');
    });

    it('should provide a method to return a page description with fallbacks', () => {
      let page: Page = mockPage();
      expect(PageComponent.getPageDescription(page)).toEqual(page.description);
      page.metadata = null;
      page.description = null;
      page.composition.title = 'foo';
      expect(PageComponent.getPageDescription(page)).toEqual('foo');
      page = mockPage({} as PageDataInterface);
      page.description = null;
      expect(PageComponent.getPageTitle(page)).toEqual('');
    });

    it('should provide a method to return a page cover image with fallbacks', () => {
      let page: Page = mockPage({cover: 'qux'} as PageDataInterface);
      expect(PageComponent.getPageCover(page)).toEqual('qux');

      page = mockPage({} as PageDataInterface);
      page.composition.cover = 'foo';
      expect(PageComponent.getPageCover(page)).toEqual('foo');

      page = mockPage({composition: {metadata: {favicon: {components: [{media: {url: 'bar'}}]}}}} as PageDataInterface);
      expect(PageComponent.getPageCover(page)).toEqual('bar');

      page = mockPage({} as PageDataInterface);
      expect(PageComponent.getPageCover(page)).toEqual(page.cover);
    });
  });
});
