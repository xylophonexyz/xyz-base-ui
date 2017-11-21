import {NO_ERRORS_SCHEMA} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {apiServiceStub} from '../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {loginDisplayNotifierStub} from '../../test/stubs/login-display-notifier.service.stub.spec';
import {loginServiceStub} from '../../test/stubs/login.service.stub.spec';
import {navbarNotifierStub} from '../../test/stubs/navbar-notifier.service.stub.spec';
import {ApiService} from '../providers/api.service';
import {AuthService} from '../providers/auth.service';
import {LoginModalDelegateService} from '../providers/login-modal-delegate.service';
import {LoginService} from '../providers/login.service';
import {NavbarDelegateService} from '../providers/navbar-delegate.service';
import {AppComponent} from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: LoginService, useValue: loginServiceStub},
        {provide: ApiService, useValue: apiServiceStub},
        {provide: NavbarDelegateService, useValue: navbarNotifierStub},
        {provide: LoginModalDelegateService, useValue: loginDisplayNotifierStub},
        {provide: AuthService, useValue: authServiceStub}
      ],
      declarations: [
        AppComponent
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should render its children', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('app-navbar')).toBeDefined();
    expect(compiled.querySelector('app-login')).toBeDefined();
    expect(compiled.querySelector('router-outlet')).toBeDefined();
  }));
});
