import {NO_ERRORS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {MomentModule} from 'angular2-moment';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {sitesServiceStub} from '../../../test/stubs/sites.service.stub.spec';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {APPLICATION_NAME} from '../../index';
import {Composition} from '../../models/composition';
import {AuthService} from '../../providers/auth.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {SitesService} from '../../providers/sites.service';
import {mockCompositionData} from '../../providers/sites.service.spec';
import {WindowRefService} from '../../providers/window-ref.service';
import {PlaceholderComponent} from '../placeholder/placeholder.component';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

import {SiteThemeComponent} from './site-theme.component';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {ComponentService} from '../../providers/component.service';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {DomSanitizer} from '@angular/platform-browser';

describe('SiteThemeComponent', () => {
  let component: SiteThemeComponent;
  let fixture: ComponentFixture<SiteThemeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MomentModule,
        FormsModule
      ],
      declarations: [
        SiteAdminComponent,
        SiteThemeComponent,
        PlaceholderComponent
      ],
      providers: [
        {provide: Router, useValue: routerStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: AuthService, useValue: authServiceStub},
        {provide: NavbarDelegateService, useValue: navbarNotifierStub},
        {provide: PagesService, useValue: pagesServiceStub},
        {provide: SitesService, useValue: sitesServiceStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        MessageChannelDelegateService,
        DomSanitizer,
        {provide: WindowRefService, useValue: windowRefStub},
        {provide: APPLICATION_NAME, useFactory: appTitleFactory},
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should show the navbar on init', fakeAsync(() => {
    const auth = getTestBed().get(AuthService);
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'displayNavbar');
    auth.authenticate.and.callFake(() => new Promise(resolve => resolve()));
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(auth.authenticate).toHaveBeenCalled();
    expect(nav.displayNavbar).toHaveBeenCalledWith(true);
  }));

  it('should fetch data based on params on init', fakeAsync(() => {
    const route = getTestBed().get(ActivatedRoute);
    spyOn(route.parent.params, 'subscribe').and.callFake((cb) => {
      return cb({id: 1});
    });
    fixture.detectChanges();
    component.ngOnInit();
    tick();
    expect(route.parent.params.subscribe).toHaveBeenCalled();
  }));

  it('should hide the navbar if the call to authenticate fails', fakeAsync(() => {
    const nav = getTestBed().get(NavbarDelegateService);
    const auth = getTestBed().get(AuthService);
    auth.authenticate.and.callFake(() => {
      return new Promise((_, reject) => {
        reject();
      });
    });
    spyOn(nav, 'displayNavbar');
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
    tick();
    expect(nav.displayNavbar).toHaveBeenCalledWith(false);
  }));

  it('should provide a method to show the logo in the header', () => {
    component.site = new Composition(Object.assign({}, mockCompositionData, {
      metadata: {
        showLogoInHeader: false
      }
    }));
    spyOn(component, 'updateSiteMetadata').and.stub();
    expect(component.site.shouldShowLogoInHeader()).toEqual(false);
    component.showLogoInSiteHeader();
    expect(component.site.shouldShowLogoInHeader()).toEqual(true);
  });

  it('should provide a method to hide the logo in the header', () => {
    component.site = new Composition(Object.assign({}, mockCompositionData, {
      metadata: {
        showLogoInHeader: true
      }
    }));
    spyOn(component, 'updateSiteMetadata').and.stub();
    expect(component.site.shouldShowLogoInHeader()).toEqual(true);
    component.hideLogoInSiteHeader();
    expect(component.site.shouldShowLogoInHeader()).toEqual(false);
  });

  it('should provide a method to add a shadow to the site header', () => {
    component.site = new Composition(Object.assign({}, mockCompositionData, {
      metadata: {
        hasHeaderShadow: false
      }
    }));
    spyOn(component, 'updateSiteMetadata').and.stub();
    expect(component.site.hasHeaderShadow()).toEqual(false);
    component.addShadowToSiteHeader();
    expect(component.site.hasHeaderShadow()).toEqual(true);
  });

  it('should provide a method to remove a shadow from the site header', () => {
    component.site = new Composition(Object.assign({}, mockCompositionData, {
      metadata: {
        hasHeaderShadow: true
      }
    }));
    spyOn(component, 'updateSiteMetadata').and.stub();
    expect(component.site.hasHeaderShadow()).toEqual(true);
    component.removeShadowFromSiteHeader();
    expect(component.site.hasHeaderShadow()).toEqual(false);
  });

  it('should provide a method to add tabbed navigation to the site header', () => {
    component.site = new Composition(Object.assign({}, mockCompositionData, {
      metadata: {
        hasTabbedNav: false
      }
    }));
    spyOn(component, 'updateSiteMetadata').and.stub();
    expect(component.site.hasTabbedNav()).toEqual(false);
    component.addTabbedNavToSiteHeader();
    expect(component.site.hasTabbedNav()).toEqual(true);
  });

  it('should provide a method to remove tabbed navigation from the site header', () => {
    component.site = new Composition(Object.assign({}, mockCompositionData, {
      metadata: {
        hasTabbedNav: true
      }
    }));
    spyOn(component, 'updateSiteMetadata').and.stub();
    expect(component.site.hasTabbedNav()).toEqual(true);
    component.removeTabbedNavFromSiteHeader();
    expect(component.site.hasTabbedNav()).toEqual(false);
  });
});
