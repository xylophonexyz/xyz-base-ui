import {Component, NO_ERRORS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {MomentModule} from 'angular2-moment';
import * as _ from 'lodash';
import {Observable} from 'rxjs/Observable';
import {sitesServiceStub} from '../../../test/stubs/sites.service.stub.spec';
import {XzPopoverModule} from '../../directives/popover/popover.module';
import {CompositionDataInterface} from '../../index';
import {Composition} from '../../models/composition';
import {mockPage} from '../../providers/pages.service.spec';
import {SitesService} from '../../providers/sites.service';
import {mockComposition, mockCompositionResponse} from '../../providers/sites.service.spec';

import {SitesComponent} from './sites.component';

@Component({
  template: ''
})
class DummyComponent {
}

function getMockSites(): CompositionDataInterface[] {
  const wayOld = new Date();
  const old = new Date();
  const now = new Date();
  const newest = new Date();

  wayOld.setFullYear(1); // year 1
  old.setFullYear(2); // year 2
  newest.setMinutes(now.getMinutes() + 10); // now + 10 minutes
  const data1 = Object.assign({}, mockCompositionResponse, {updated_at: wayOld.getTime()});
  const data2 = Object.assign({}, mockCompositionResponse, {updated_at: old.getTime()});
  const data3 = Object.assign({}, mockCompositionResponse, {updated_at: now.getTime()});
  const data4 = Object.assign({}, mockCompositionResponse, {updated_at: now.getTime()}); // same as data 3
  const data5 = Object.assign({}, mockCompositionResponse, {updated_at: newest.getTime()});
  return _.shuffle([data1, data2, data3, data4, data5]);
}

describe('SitesComponent', () => {
  let component: SitesComponent;
  let fixture: ComponentFixture<SitesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SitesComponent,
        DummyComponent
      ],
      providers: [
        {provide: SitesService, useValue: sitesServiceStub},
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule,
        MomentModule,
        XzPopoverModule,
        RouterTestingModule.withRoutes([
          {path: 'admin/sites/:id/settings', component: DummyComponent}
        ])]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call SitesProvider on init', async(() => {
    const sitesProvider = getTestBed().get(SitesService);
    spyOn(sitesProvider, 'all').and.callFake(() => {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    });
    fixture.detectChanges();
    expect(sitesProvider.all).toHaveBeenCalled();
  }));

  it('should initialize all site objects returned by SitesProvider into Composition objects', async(() => {
    const sitesProvider = getTestBed().get(SitesService);
    spyOn(sitesProvider, 'all').and.callFake(() => {
      return new Observable(observer => {
        observer.next([null]);
        observer.complete();
      });
    });
    fixture.detectChanges();
    expect(component.sites[0] instanceof Composition).toEqual(true);
  }));

  it('should provide a method to filter site objects by published', () => {
    const sites = getMockSites().map(c => new Composition(c));
    let filtered = component.sitesFilteredByActiveTab(sites);
    expect(filtered.length).toEqual(sites.length);
    component.setUIFilter('showPrivate');
    sites[0].published = true;
    filtered = component.sitesFilteredByActiveTab(sites);
    expect(filtered.length).toEqual(sites.length - 1);
    component.setUIFilter('showPublic');
    filtered = component.sitesFilteredByActiveTab(sites);
    expect(filtered.length).toEqual(1);
    expect(component.sitesFilteredByActiveTab(null)).toEqual([]);
  });

  it('should sort site objects by updatedAt value', async(() => {
    const sitesProvider = getTestBed().get(SitesService);
    spyOn(sitesProvider, 'all').and.callFake(() => {
      return new Observable(observer => {
        observer.next(getMockSites());
        observer.complete();
      });
    });
    component.ngOnInit();
    expect(component.sites[0].updatedAt.getTime()).toBeGreaterThan(component.sites[1].updatedAt.getTime());
  }));

  it('should return the url for the first child page', () => {
    const site = mockComposition();
    site.pages.push(mockPage());
    expect(component.firstPageUrl(site)).toEqual(`/p/${site.pages[0].id}`);
    site.pages = [];
    expect(component.firstPageUrl(site)).toEqual('');
  });

  it('should return the url for site settings', () => {
    let site = mockComposition();
    expect(component.settingsUrl(site)).toEqual(`/admin/sites/${site.id}/settings`);
    site = null;
    expect(component.settingsUrl(site)).toEqual('');
  });

  it('should provide a method to switch the view to the add site button', () => {
    component.showAddSiteButton();
    fixture.detectChanges();
    expect(component.shouldShowAddSiteButton()).toEqual(true);
  });

  it('should provide a method to switch the view to the form', () => {
    component.showForm();
    fixture.detectChanges();
    expect(component.shouldShowForm()).toEqual(true);
  });

  it('should provide a method to create the "site" object', fakeAsync(() => {
    const sitesService = getTestBed().get(SitesService);
    spyOn(sitesService, 'create').and.callFake(() => {
      return new Observable(observer => {
        observer.next({});
      });
    });
    const data = {title: 'Cool'};
    component.createSite(data);
    tick();
    expect(sitesService.create).toHaveBeenCalled();
  }));

  it('should handle errors when creating a "site" object', fakeAsync(() => {
    const sitesService = getTestBed().get(SitesService);
    spyOn(sitesService, 'create').and.callFake(() => {
      return new Observable(observer => {
        observer.error({});
      });
    });
    const data = {title: 'Cool'};
    component.createSite(data);
    tick();
    expect(sitesService.create).toHaveBeenCalled();
    expect(component.isLoading).toEqual(false);
  }));

  it('should provide a method to set the ui filter', () => {
    expect(component.uiFilter.all).toEqual(true);
    expect(component.uiFilter.showPublic).toEqual(false);
    expect(component.uiFilter.showPrivate).toEqual(false);
    component.setUIFilter('showPublic');
    expect(component.uiFilter.all).toEqual(false);
    expect(component.uiFilter.showPublic).toEqual(true);
    expect(component.uiFilter.showPrivate).toEqual(false);
    component.setUIFilter('showPrivate');
    expect(component.uiFilter.all).toEqual(false);
    expect(component.uiFilter.showPublic).toEqual(false);
    expect(component.uiFilter.showPrivate).toEqual(true);
    component.setUIFilter('all');
    expect(component.uiFilter.all).toEqual(true);
    expect(component.uiFilter.showPublic).toEqual(false);
    expect(component.uiFilter.showPrivate).toEqual(false);
  });
});
