import {NO_ERRORS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {MomentModule} from 'angular2-moment';
import {Observable} from 'rxjs/Observable';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {sitesServiceStub} from '../../../test/stubs/sites.service.stub.spec';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {APPLICATION_NAME, LocalComponentTypes} from '../../index';
import {Component} from '../../models/component';
import {ComponentCollection} from '../../models/component-collection';
import {mockComponentCollectionData} from '../../models/component-collection.spec';
import {mockComponentData} from '../../models/component.spec';
import {AuthService} from '../../providers/auth.service';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {mockPage} from '../../providers/pages.service.spec';
import {SitesService} from '../../providers/sites.service';
import {mockComposition} from '../../providers/sites.service.spec';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {PlaceholderComponent} from '../placeholder/placeholder.component';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

import {FileItem, SiteFilesComponent} from './site-files.component';

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
        UtilService,
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

  it('should provide a method to return empty array if there are no files', () => {
    expect(component.files).toEqual([]);
  });

  it('should provide a method to return files', () => {
    component.site = mockComposition();
    const pagesService = getTestBed().get(PagesService);
    const page = mockPage();

    const collection1 = new ComponentCollection({
      ...mockComponentCollectionData,
      metadata: {
        metatype: LocalComponentTypes.Hero
      }
    });
    collection1.components.push(new Component({
      ...mockComponentData,
      metadata: {bgImage: new ComponentCollection(mockComponentCollectionData)} as any
    }));
    page.components.push(collection1);

    const collection2 = new ComponentCollection({
      ...mockComponentCollectionData,
      metadata: {metatype: LocalComponentTypes.ImageCollection}
    });
    collection1.components.push(new Component(mockComponentData));
    page.components.push(collection2);

    component.site.pages.push(page);

    spyOn(pagesService, 'get').and.returnValue(Observable.create(observer => {
      observer.next(page);
    }));

    const channel: MessageChannelDelegateService = getTestBed().get(MessageChannelDelegateService);
    channel.sendMessage({topic: SiteAdminComponent.SiteAdminSiteDidLoad, data: null});
    expect(component.files.length).toBeGreaterThan(0);
  });

  it('should provide a method to copy content to the clipboard', () => {
    expect(component.copyLink).toBeDefined();
    const utilService = getTestBed().get(UtilService);
    spyOn(utilService, 'copyToClipboard');
    expect(() => component.copyLink('foo.jpg')).not.toThrow();
  });

  it('should return a media url for a FileItem', () => {
    const file1: FileItem = {
      pageId: 1,
      component: new Component(mockComponentData),
      metatype: LocalComponentTypes.ImageCollection
    };
    expect(component.getMediaUrl(file1)).toEqual('');
    const file2: FileItem = {
      pageId: 1,
      component: new Component({...mockComponentData, media: {url: 'foo.jpg'}}),
      metatype: LocalComponentTypes.ImageCollection
    };
    expect(component.getMediaUrl(file2)).toEqual('foo.jpg');
  });

  it('should return metadata for a FileItem', () => {
    const file1: FileItem = {
      pageId: 1,
      component: new Component(mockComponentData),
      metatype: LocalComponentTypes.ImageCollection
    };
    expect(component.getFileMetadata(file1)).toEqual({});
    const file2: FileItem = {
      pageId: 1,
      component: new Component({...mockComponentData, media: {transcoding: {image: [{foo: 'bar'}]}}}),
      metatype: LocalComponentTypes.ImageCollection
    };
    expect(component.getFileMetadata(file2)).toEqual({foo: 'bar'});
  });
});
