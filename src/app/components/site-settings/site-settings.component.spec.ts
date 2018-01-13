import {NO_ERRORS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {MomentModule} from 'angular2-moment';
import {Observable} from 'rxjs/Observable';
import {windowRefStub} from 'test/stubs/window-ref.stub.spec';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {sitesServiceStub} from '../../../test/stubs/sites.service.stub.spec';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {mockFile} from '../../../modules/file-upload/file-upload.service.spec';
import {APPLICATION_NAME} from '../../index';
import {Composition} from '../../models/composition';
import {AuthService} from '../../providers/auth.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {SitesService} from '../../providers/sites.service';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {PlaceholderComponent} from '../placeholder/placeholder.component';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

import {SiteSettingsComponent} from './site-settings.component';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {ComponentService} from '../../providers/component.service';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {UIMediaComponent} from '../media-component/media-component';
import {mockComposition} from '../../providers/sites.service.spec';
import {DomSanitizer} from '@angular/platform-browser';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';

describe('SiteSettingsComponent', () => {
  let component: SiteSettingsComponent;
  let fixture: ComponentFixture<SiteSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MomentModule,
        FormsModule
      ],
      declarations: [
        SiteAdminComponent,
        SiteSettingsComponent,
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
    fixture = TestBed.createComponent(SiteSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
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

  it('should call onChildInit by overriding its ngOnInit method', () => {
    const route = getTestBed().get(ActivatedRoute);
    const channel = getTestBed().get(MessageChannelDelegateService);
    expect(component.site).toBeNull();
    route.parent.params.next({id: 1});
    expect(component.site).toBeDefined();
  });

  describe('editing', () => {
    it('should provide a method to edit site name', () => {
      fixture.detectChanges();
      component.site = new Composition(null);
      expect(component.willEditName()).toEqual(false);
      expect(component.siteCopy).toBeNull();
      component.editSiteName();
      expect(component.willEditName()).toEqual(true);
      expect(component.siteCopy).not.toEqual(null);
    });

    it('should provide a method to cancel editing site name', () => {
      component.site = new Composition(null);
      fixture.detectChanges();
      component.editSiteName();
      expect(component.willEditName()).toEqual(true);
      component.cancelEditSiteName();
      expect(component.willEditName()).toEqual(false);
    });

    it('should provide a method to set the site to published', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      spyOn(sitesProvider, 'publish').and.callThrough();
      component.site = new Composition(null);
      component.setSiteToPublished();
      tick();
      fixture.detectChanges();
      expect(component.site.isPublished()).toEqual(true);
      expect(sitesProvider.publish).toHaveBeenCalled();
    }));

    it('should provide a method to set the site to private', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      spyOn(sitesProvider, 'publish').and.callThrough();
      component.site = new Composition(null);
      component.setSiteToPrivate();
      tick();
      fixture.detectChanges();
      expect(component.site.isPublished()).toEqual(false);
      expect(sitesProvider.publish).toHaveBeenCalled();
    }));

    it('should handle errors when setting publishing settings', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      spyOn(sitesProvider, 'publish').and.callFake(() => {
        return new Observable(observer => {
          observer.error({status: 400});
        });
      });
      component.setSiteToPrivate();
      tick();
      fixture.detectChanges();
      expect(sitesProvider.publish).toHaveBeenCalled();
    }));

    it('should provide a method to delete a site', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      const router = getTestBed().get(Router);
      spyOn(sitesProvider, 'destroy').and.callThrough();
      component.site = new Composition(null);
      component.deleteSite();
      tick();
      fixture.detectChanges();
      expect(sitesProvider.destroy).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    }));

    it('should should handle errors when attempting to delete a site', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      spyOn(sitesProvider, 'destroy').and.callFake(() => {
        return new Observable(observer => {
          observer.error({status: 400});
        });
      });
      component.deleteSite();
      tick();
      fixture.detectChanges();
      expect(sitesProvider.destroy).toHaveBeenCalled();
    }));

    it('should provide a method to update the site name', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      component.siteCopy = new Composition(null);
      spyOn(sitesProvider, 'update').and.callThrough();
      component.updateSiteName();
      tick();
      fixture.detectChanges();
      expect(sitesProvider.update).toHaveBeenCalled();
    }));

    it('should should handle errors when updating the site name', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      component.siteCopy = new Composition(null);
      spyOn(sitesProvider, 'update').and.callFake(() => {
        return new Observable(observer => {
          observer.error({status: 400});
        });
      });
      component.updateSiteName();
      tick();
      fixture.detectChanges();
      expect(sitesProvider.update).toHaveBeenCalled();
    }));

    it('should provide a method to update the site metadata', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      component.site.primaryColor = '#FF0000';
      spyOn(sitesProvider, 'update').and.callThrough();
      component.updateSiteMetadata();
      tick();
      fixture.detectChanges();
      expect(sitesProvider.update).toHaveBeenCalled();
    }));

    it('should should handle errors when updating the site metadata', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      component.site.primaryColor = '#FF0000';
      spyOn(sitesProvider, 'update').and.callFake(() => {
        return new Observable(observer => {
          observer.error({status: 400});
        });
      });
      component.updateSiteMetadata();
      tick();
      fixture.detectChanges();
      expect(sitesProvider.update).toHaveBeenCalled();
    }));

    it('should provide a method to upload a site logo', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      spyOn(sitesProvider, 'uploadLogo').and.callThrough();
      component.uploadLogo(mockFile(1000, 'cat.jpg'));
      tick();
      fixture.detectChanges();
      expect(sitesProvider.uploadLogo).toHaveBeenCalled();
    }));

    it('should should handle errors when uploading site logo', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      spyOn(sitesProvider, 'uploadLogo').and.callFake(() => {
        return new Promise((resolve, reject) => {
          reject({status: 400});
        });
      });
      component.uploadLogo(mockFile(1000, 'cat.jpg'));
      tick();
      fixture.detectChanges();
      expect(sitesProvider.uploadLogo).toHaveBeenCalled();
    }));

    it('should detect changes on cover file input', () => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      fixture.detectChanges();
      spyOn(sitesProvider, 'uploadLogo').and.callThrough();
      const e = {target: {files: [mockFile(1000, 'cat.jpg')]}} as any;
      component.coverFileDidChange(e);
      expect(sitesProvider.uploadLogo).toHaveBeenCalled();
    });

    it('should provide a method to upload a site favicon', fakeAsync(() => {
      const collectionsProvider = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      component.site = mockComposition();
      spyOn(collectionsProvider, 'create').and.callThrough();
      spyOn(componentService, 'upload').and.callFake(() => {
        return new Observable(observer => {
          observer.next({media: {url: 'cat.jpg'}, media_processing: false});
          observer.complete();
        });
      });
      spyOn(UIMediaComponent, 'getDataUrl').and.callFake(() => {
        return new Observable(observer => {
          observer.next('foo.jpg');
        });
      });
      spyOn(component, 'updateSiteMetadata').and.stub();
      component.uploadFavicon(mockFile(1000, 'cat.jpg'));
      tick();
      expect(collectionsProvider.create).toHaveBeenCalled();
      expect(componentService.upload).toHaveBeenCalled();
      expect(component.updateSiteMetadata).toHaveBeenCalled();
    }));

    it('should handle errors when creating favicon collection container', fakeAsync(() => {
      const collectionsProvider = getTestBed().get(ComponentCollectionService);
      component.site = mockComposition();
      spyOn(UIMediaComponent, 'getDataUrl').and.callFake(() => {
        return new Observable(observer => {
          observer.next('foo.jpg');
        });
      });
      spyOn(collectionsProvider, 'create').and.callFake(() => {
        return Observable.create(observer => {
          observer.error(new Error('Foo'));
        });
      });
      spyOn(component, 'removeFavicon').and.stub();
      component.uploadFavicon(mockFile(1000, 'cat.jpg'));
      tick();
      expect(component.removeFavicon).toHaveBeenCalled();
    }));

    it('should handle errors when creating favicon collection container', fakeAsync(() => {
      const collectionsProvider = getTestBed().get(ComponentCollectionService);
      component.site = mockComposition();
      spyOn(UIMediaComponent, 'getDataUrl').and.callFake(() => {
        return new Observable(observer => {
          observer.next('foo.jpg');
        });
      });
      spyOn(collectionsProvider, 'create').and.callFake(() => {
        return Observable.create(observer => {
          observer.next('hahaha');
        });
      });
      spyOn(component, 'removeFavicon').and.stub();
      component.uploadFavicon(mockFile(1000, 'cat.jpg'));
      tick();
      expect(component.removeFavicon).toHaveBeenCalled();
    }));

    it('should handle errors when uploading favicon', fakeAsync(() => {
      const collectionsProvider = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      component.site = mockComposition();
      spyOn(UIMediaComponent, 'getDataUrl').and.callFake(() => {
        return new Observable(observer => {
          observer.next('foo.jpg');
        });
      });
      spyOn(collectionsProvider, 'create').and.callThrough();
      spyOn(componentService, 'upload').and.callFake(() => {
        return new Observable(observer => {
          observer.error(new Error('foo'));
        });
      });
      component.uploadFavicon(mockFile(1000, 'cat.jpg'));
      tick();
    }));

    it('should handle errors when uploading favicon', fakeAsync(() => {
      const collectionsProvider = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      component.site = mockComposition();
      spyOn(UIMediaComponent, 'getDataUrl').and.callFake(() => {
        return new Observable(observer => {
          observer.next('foo.jpg');
        });
      });
      spyOn(collectionsProvider, 'create').and.callThrough();
      spyOn(componentService, 'upload').and.callFake(() => {
        return new Observable(observer => {
          observer.next(null);
        });
      });
      spyOn(console, 'log');
      component.uploadFavicon(mockFile(1000, 'cat.jpg'));
      tick();
      expect(console.log).toHaveBeenCalled();
    }));

    it('should detect changes on favicon file input', () => {
      component.site = mockComposition();
      fixture.detectChanges();
      spyOn(component, 'uploadFavicon').and.stub();
      const e = {target: {files: [mockFile(1000, 'cat.jpg')]}} as any;
      component.faviconFileDidChange(e);
      expect(component.uploadFavicon).toHaveBeenCalled();
    });

    it('should provide a method to remove a site logo', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = mockComposition();
      spyOn(sitesProvider, 'removeLogo').and.callThrough();
      component.removeLogo();
      fixture.detectChanges();
      tick();
      expect(sitesProvider.removeLogo).toHaveBeenCalled();
    }));

    it('should provide a method to remove a site favicon', fakeAsync(() => {
      spyOn(component, 'updateSiteMetadata').and.stub();
      component.site = mockComposition();
      component.site.metadata.favicon = {components: [{media: {url: 'foo.jpg'}}]};
      component.removeFavicon();
      tick();
      expect(component.site.metadata.favicon).toBeUndefined();
      expect(component.updateSiteMetadata).toHaveBeenCalled();
    }));

    it('should should handle errors when removing site logo', fakeAsync(() => {
      const sitesProvider = getTestBed().get(SitesService);
      component.site = new Composition(null);
      spyOn(sitesProvider, 'removeLogo').and.callFake(() => {
        return new Promise((resolve, reject) => {
          reject({status: 400});
        });
      });
      component.removeLogo();
      tick();
      fixture.detectChanges();
      expect(sitesProvider.removeLogo).toHaveBeenCalled();
    }));
  });
});
