import {NO_ERRORS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, getTestBed, inject, TestBed, tick} from '@angular/core/testing';
import {Router} from '@angular/router';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {loginServiceStub} from '../../../test/stubs/login.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {PopoverDirective} from '../../directives/popover/popover.directive';
import {UserDataInterface} from '../../index';
import {User} from '../../models/user';
import {AuthService} from '../../providers/auth.service';
import {LoginService} from '../../providers/login.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';

import {NavbarComponent} from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent, PopoverDirective],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: Router, useValue: routerStub},
        {provide: AuthService, useValue: authServiceStub},
        {provide: NavbarDelegateService, useValue: navbarNotifierStub},
        {provide: LoginService, useValue: loginServiceStub}
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize a subscription to tell it to hide/show', fakeAsync(inject([NavbarDelegateService], (nav: NavbarDelegateService) => {
    expect((component as any).displaySubscription).toBeDefined();
    expect(component.shouldDisplay).toEqual(false);
    nav.displayNavbar(true);
    tick();
    expect(component.shouldDisplay).toEqual(true);
  })));

  it('should cancel the subscription when the component is unmounted', () => {
    spyOn((component as any).displaySubscription, 'unsubscribe');
    spyOn((component as any).currentUserSubscription, 'unsubscribe');
    spyOn((component as any).infoBannerSubscription, 'unsubscribe');
    component.ngOnDestroy();
    expect((component as any).displaySubscription.unsubscribe).toHaveBeenCalled();
    expect((component as any).currentUserSubscription.unsubscribe).toHaveBeenCalled();
    expect((component as any).infoBannerSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should initialize a subscription to post an info message banner', fakeAsync(
    inject([NavbarDelegateService], (nav: NavbarDelegateService) => {
      expect((component as any).infoBannerSubscription).toBeDefined();
      expect(component.infoBannerMessage).toEqual(null);
      nav.setInfoBannerMessage('foo');
      tick();
      expect(component.infoBannerMessage).toEqual('foo');
    }
  )));

  it('should provide a method to return a profile image for the current user', fakeAsync(() => {
    const user = new User({
      avatar: {url: 'cat.jpg'},
      followers: [],
      following: []
    } as UserDataInterface);
    const auth = getTestBed().get(AuthService);
    auth['currentUserSource'].next(user);
    tick();
    expect(component.getProfileImage()).toEqual('cat.jpg');
  }));

  it('should provide a method to sign out', fakeAsync(() => {
    const login = getTestBed().get(LoginService);
    spyOn(login, 'logout').and.callThrough();
    component.signOut();
    tick();
    expect(login.logout).toHaveBeenCalled();
  }));

  it('should log error to console if clearing auth fails', fakeAsync(() => {
    const login = getTestBed().get(LoginService);
    spyOn(login, 'logout').and.callFake(() => {
      return new Promise((_, reject) => reject());
    });
    component.signOut();
    tick();
    expect(login.logout).toHaveBeenCalled();
  }));
});
