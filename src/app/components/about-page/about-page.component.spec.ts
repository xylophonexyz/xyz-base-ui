import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AboutPageComponent} from './about-page.component';
import {ToggleOnClickDirective} from '../../directives/toggle-on-click/toggle-on-click.directive';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {loginDisplayNotifierStub} from '../../../test/stubs/login-display-notifier.service.stub.spec';
import {FormsModule} from '@angular/forms';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {LoginComponent} from '../login/login.component';
import {APPLICATION_NAME} from '../../index';
import {SplashScreenComponent} from '../splash-screen/splash-screen.component';
import {LoginModalDelegateService} from '../../providers/login-modal-delegate.service';
import {RouterTestingModule} from '@angular/router/testing';
import {ModalComponent} from '../modal/modal.component';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';

describe('AboutPageComponent', () => {
  let component: AboutPageComponent;
  let fixture: ComponentFixture<AboutPageComponent>;

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
        AboutPageComponent,
        SplashScreenComponent,
        ModalComponent,
        LoginComponent,
        ToggleOnClickDirective
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
