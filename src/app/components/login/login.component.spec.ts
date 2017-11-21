import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {loginDisplayNotifierStub} from '../../../test/stubs/login-display-notifier.service.stub.spec';
import {loginServiceStub} from '../../../test/stubs/login.service.stub.spec';
import {appTitleFactory} from '../../../test/stubs/tokens.stub.spec';
import {APPLICATION_NAME, LoginType} from '../../index';
import {LoginModalDelegateService} from '../../providers/login-modal-delegate.service';
import {LoginService} from '../../providers/login.service';
import {ModalComponent} from '../modal/modal.component';

import {LoginComponent} from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, HttpModule],
      providers: [
        {provide: LoginModalDelegateService, useValue: loginDisplayNotifierStub},
        {provide: LoginService, useValue: loginServiceStub},
        {provide: APPLICATION_NAME, useFactory: appTitleFactory},
      ],
      declarations: [LoginComponent, ModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a method to hide the login component', () => {
    expect(component.hideLogin).toBeDefined();
    spyOn((component as any).loginDisplayService, 'displayLoginComponent');
    component.hideLogin();
    expect((component as any).loginDisplayService.displayLoginComponent).toHaveBeenCalled();
  });

  it('should store a model internally', () => {
    expect(component.state.email).toBeDefined();
  });

  it('should provide a method to submit the login form', () => {
    expect(component.onSubmit).toBeDefined();
  });

  it('should render a form component', async(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#form')).toBeDefined();
  }));

  it('should render a confirmation component', async(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#confirm')).toBeDefined();
  }));

  it('should subscribe to changes from LoginComponentDisplayNotifierService', async(() => {
    expect(component.display).toBeFalsy();
    (component as any).loginDisplayService.displayLoginComponent(true);
    expect(component.display).toBeTruthy();
  }));

  it('should stop its subscription when the component is destroyed', () => {
    spyOn((component as any).subscription, 'unsubscribe');
    component.ngOnDestroy();
    expect((component as any).subscription.unsubscribe).toHaveBeenCalled();
  });

  it('should provide an onSubmit method', () => {
    spyOn((component as any).loginService, 'doLogin').and.callFake(() => {
      return new Promise(resolve => {
        resolve();
      });
    });
    (component as any).state.email = 'joeschmo@example.com';
    component.onSubmit();
    expect((component as any).loginService.doLogin).toHaveBeenCalledWith('joeschmo@example.com');
  });

  it('should provide a method to check the login type', () => {
    component.state.loginType = LoginType.LOGIN;
    expect(component.didDoLoginTypeLogin()).toEqual(true);
    expect(component.didDoLoginTypeRegister()).toEqual(false);
  });

  it('should provide a method to check the login type', () => {
    component.state.loginType = LoginType.REGISTER;
    expect(component.didDoLoginTypeRegister()).toEqual(true);
    expect(component.didDoLoginTypeLogin()).toEqual(false);
  });

  it('should respond to events sent by LoginModalDelegateService', () => {
    expect(component.display).toBeFalsy();
    (component as any).loginDisplayService.displayLoginComponent(true);
    expect(component.display).toBeTruthy();
  });
});
