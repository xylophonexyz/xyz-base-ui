import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {APPLICATION_NAME} from '../../index';
import {AuthService} from '../../providers/auth.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';

import {AdminComponent} from './admin.component';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminComponent],
      imports: [RouterTestingModule],
      providers: [
        {provide: AuthService, useValue: authServiceStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: NavbarDelegateService, useValue: navbarNotifierStub},
        {provide: APPLICATION_NAME, useFactory: appTitleFactory},
        Title,
        Meta,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should hide the navbar if the call to authenticate fails', fakeAsync(() => {
    const nav = getTestBed().get(NavbarDelegateService);
    const auth = getTestBed().get(AuthService);
    auth.authenticate.and.callFake(() => {
      return new Promise((_, reject) => {
        reject();
      });
    });
    spyOn(nav, 'displayNavbar');
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    expect(nav.displayNavbar).toHaveBeenCalledWith(false);
  }));

  it('should provide a pageHeader getter that returns a value based on the route', () => {
    const route = getTestBed().get(ActivatedRoute);
    expect(component.pageHeader).toEqual('Admin');
    route.firstChild.routeConfig.path = 'settings';
    expect(component.pageHeader).toEqual('Account');
    route.firstChild.routeConfig.path = 'sites';
    expect(component.pageHeader).toEqual('Your Sites');
  });
});
