import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {RouterTestingModule} from '@angular/router/testing';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {loginDisplayNotifierStub} from '../../../test/stubs/login-display-notifier.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {ToggleOnClickDirective} from '../../directives/toggle-on-click/toggle-on-click.directive';
import {APPLICATION_NAME} from '../../index';
import {LoginModalDelegateService} from '../../providers/login-modal-delegate.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {LoginComponent} from '../login/login.component';
import {ModalComponent} from '../modal/modal.component';

import {SplashScreenComponent} from './splash-screen.component';

describe('SplashScreenComponent', () => {
  let component: SplashScreenComponent;
  let fixture: ComponentFixture<SplashScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: NavbarDelegateService, useValue: navbarNotifierStub},
        {provide: LoginModalDelegateService, useValue: loginDisplayNotifierStub},
        {provide: APPLICATION_NAME, useFactory: appTitleFactory}
      ],
      imports: [
        FormsModule,
        RouterTestingModule,
        FeatherModule,
      ],
      schemas: [],
      declarations: [
        SplashScreenComponent,
        ModalComponent,
        LoginComponent,
        ToggleOnClickDirective
      ]
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SplashScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should hide the navbar on init', () => {
    const nav = getTestBed().get(NavbarDelegateService);
    spyOn(nav, 'displayNavbar');
    component.ngOnInit();
    expect(nav.displayNavbar).toHaveBeenCalledWith(false);
  });

  it('should provide a method to open the login component', () => {
    fixture = TestBed.createComponent(SplashScreenComponent);
    component = fixture.componentInstance;
    const loginDisplayService = getTestBed().get(LoginModalDelegateService);
    spyOn(loginDisplayService, 'displayLoginComponent');
    component.showLogin();
    expect(loginDisplayService.displayLoginComponent).toHaveBeenCalledWith(true);
  });

  it('should provide a getter for the application title', () => {
    expect(component.applicationName).toBeTruthy();
  });
});
