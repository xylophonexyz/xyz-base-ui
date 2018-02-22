import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {apiServiceStub} from '../../../test/stubs/api.service.stub.spec';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {storageStub} from '../../../test/stubs/storage.stub.spec';
import {ApiService} from '../../providers/api.service';
import {AuthService} from '../../providers/auth.service';
import {StorageService} from '../../providers/storage.service';

import {TokenCallbackComponent} from './token-callback.component';

describe('TokenCallbackComponent', () => {
  let component: TokenCallbackComponent;
  let fixture: ComponentFixture<TokenCallbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TokenCallbackComponent],
      providers: [
        {provide: AuthService, useValue: authServiceStub},
        {provide: ApiService, useValue: apiServiceStub},
        {provide: StorageService, useValue: storageStub},
        {provide: Router, useValue: routerStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
      ],
      imports: [
        FeatherModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenCallbackComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should subscribe to route params', () => {
    fixture.detectChanges();
    expect((component as any).sub).toBeDefined();
  });

  it('should request the oauth token if an authorization code is present in params', () => {
    fixture.detectChanges();
    expect((component as any).auth.authenticate).toHaveBeenCalledWith('1234');
  });

  it('should navigate to root route if no authorization code is present in params', (done) => {
    const route = getTestBed().get(ActivatedRoute);
    const router = getTestBed().get(Router);
    spyOn(route.queryParamMap, 'subscribe').and.callFake(callback => {
      callback({
        get: () => {
          return null;
        }
      });
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      done();
      return {
        unsubscribe: () => {
        }
      };
    });
    fixture.detectChanges();
  });

  it('should navigate to admin route if the call to authenticate proceeds', fakeAsync(() => {
    const router = getTestBed().get(Router);
    const auth = getTestBed().get(AuthService);
    auth.authenticate.and.callFake(() => new Promise(res => res()));
    fixture.detectChanges();
    tick(800);
    expect(component.isSuccess).toEqual(true);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  }));

  it('should navigate to root route if the call to authenticate fails', fakeAsync(() => {
    const router = getTestBed().get(Router);
    const auth = getTestBed().get(AuthService);
    auth.authenticate.and.callFake(() => new Promise((_, rej) => rej()));
    fixture.detectChanges();
    tick(800);
    expect(component.isFail).toEqual(true);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));
});
