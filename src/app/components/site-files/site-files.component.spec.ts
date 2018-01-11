import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SiteFilesComponent} from './site-files.component';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {RouterTestingModule} from '@angular/router/testing';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {MomentModule} from 'angular2-moment';
import {PagesService} from '../../providers/pages.service';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {sitesServiceStub} from '../../../test/stubs/sites.service.stub.spec';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {DomSanitizer} from '@angular/platform-browser';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {WindowRefService} from '../../providers/window-ref.service';
import {SiteAdminComponent} from '../site-admin/site-admin.component';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {PlaceholderComponent} from '../placeholder/placeholder.component';
import {ComponentService} from '../../providers/component.service';
import {SitesService} from '../../providers/sites.service';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {FormsModule} from '@angular/forms';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';
import {AuthService} from '../../providers/auth.service';
import {APPLICATION_NAME} from '../../index';

describe('SiteFilesComponent', () => {
  let component: SiteFilesComponent;
  let fixture: ComponentFixture<SiteFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MomentModule,
        FormsModule
      ],
      declarations: [
        SiteAdminComponent,
        SiteFilesComponent,
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
        MessageChannelDelegateService,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
