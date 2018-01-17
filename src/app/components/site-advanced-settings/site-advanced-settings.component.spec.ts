import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {MomentModule} from 'angular2-moment';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {AuthService} from '../../providers/auth.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {UtilService} from '../../providers/util.service';
import {PlaceholderComponent} from '../placeholder/placeholder.component';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

import {SiteAdvancedSettingsComponent} from './site-advanced-settings.component';
import {SitesService} from '../../providers/sites.service';
import {sitesServiceStub} from '../../../test/stubs/sites.service.stub.spec';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {APPLICATION_NAME} from '../../index';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {mockComposition} from '../../providers/sites.service.spec';
import {Observable} from 'rxjs/Observable';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {ComponentService} from '../../providers/component.service';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {DomSanitizer} from '@angular/platform-browser';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';

describe('SiteAdvancedSettingsComponent', () => {
  let component: SiteAdvancedSettingsComponent;
  let fixture: ComponentFixture<SiteAdvancedSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MomentModule,
        FormsModule
      ],
      declarations: [
        SiteAdminComponent,
        SiteAdvancedSettingsComponent,
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
        {provide: DomSanitizer, useValue: mockDomSanitizer},
        {provide: WindowRefService, useValue: windowRefStub},
        {provide: APPLICATION_NAME, useFactory: appTitleFactory},
        UtilService,
        MessageChannelDelegateService,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteAdvancedSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a getter for site custom domain', () => {
    component.site = mockComposition();
    component.site.customDomain = {
      zoneId: '123',
      domainName: 'example.com',
      nameServers: [],
      domainMappings: [],
      requiredDnsRecords: [],
      selfManagedDns: false
    };
    const channel: MessageChannelDelegateService = getTestBed().get(MessageChannelDelegateService);
    channel.sendMessage({topic: SiteAdminComponent.SiteAdminSiteDidLoad, data: null});
    expect(component.customDomainName).toEqual('example.com');
  });

  it('should provide a private setter for site custom domain', () => {
    component.site = mockComposition();
    component.customDomainName = 'example.com';
    const service = getTestBed().get(SitesService);
    spyOn(service, 'addCustomDomain').and.callThrough();
    component.addCustomDomain();
    expect(service.addCustomDomain).toHaveBeenCalledWith(component.site.id, 'example.com');
  });

  it('should provide a method to add a custom domain', fakeAsync(() => {
    const service = getTestBed().get(SitesService);
    spyOn(component, 'updateSiteMetadata');
    spyOn(service, 'addCustomDomain').and.callFake(() => {
      return Observable.create(observer => {
        observer.next({
          createZoneResult: {result: {}}
        });
      });
    });
    component.errorMessage = 'foo!';
    component.site = mockComposition();
    component.customDomainName = 'example.com';
    component.addCustomDomain();
    tick();
    fixture.detectChanges();
    expect(component.updateSiteMetadata).toHaveBeenCalled();
    expect(component.errorMessage).toEqual(null);
  }));

  it('should handle errors when adding a custom domain', fakeAsync(() => {
    const service = getTestBed().get(SitesService);
    spyOn(component, 'updateSiteMetadata');
    spyOn(service, 'addCustomDomain').and.callFake(() => {
      return Observable.create(observer => {
        observer.error('Foobed up!');
      });
    });
    component.site = mockComposition();
    component.customDomainName = 'example.com';
    component.addCustomDomain();
    tick();
    fixture.detectChanges();
    expect(component.errorMessage).toEqual('Foobed up!');
  }));

  it('should remove a custom domain', fakeAsync(() => {
    const service = getTestBed().get(SitesService);
    spyOn(component, 'updateSiteMetadata');
    spyOn(service, 'removeCustomDomain').and.callFake(() => {
      return Observable.create(observer => {
        observer.next(null);
      });
    });
    component.site = mockComposition();
    component.site = mockComposition();
    component.site.customDomain = {
      zoneId: '123',
      domainName: 'example.com',
      nameServers: [],
      domainMappings: [],
      requiredDnsRecords: [],
      selfManagedDns: false
    };
    component.removeCustomDomain();
    tick();
    fixture.detectChanges();
    expect(component.updateSiteMetadata).toHaveBeenCalled();
    expect(component.site.customDomain).toEqual(null);
    expect(component.errorMessage).toEqual(null);
  }));

  it('should handle errors when removing a custom domain', fakeAsync(() => {
    const service = getTestBed().get(SitesService);
    spyOn(component, 'updateSiteMetadata');
    spyOn(service, 'removeCustomDomain').and.callFake(() => {
      return Observable.create(observer => {
        observer.error('Foober');
      });
    });
    component.site = mockComposition();
    component.site = mockComposition();
    component.site.customDomain = {
      zoneId: '123',
      domainName: 'example.com',
      nameServers: [],
      domainMappings: [],
      requiredDnsRecords: [],
      selfManagedDns: false
    };
    component.removeCustomDomain();
    tick();
    fixture.detectChanges();
    expect(component.site.customDomain).not.toEqual(null);
    expect(component.errorMessage).toEqual('Foober');
  }));
});
