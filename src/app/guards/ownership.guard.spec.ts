import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';

import {OwnershipGuard} from './ownership.guard';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthService} from '../providers/auth.service';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {Observable} from 'rxjs/Observable';
import {SitesService} from '../providers/sites.service';
import {sitesServiceStub} from '../../test/stubs/sites.service.stub.spec';
import {mockUserData} from '../models/user.spec';
import {ActivatedRouteSnapshot, Router} from '@angular/router';
import {routerStub} from '../../test/stubs/router.stub.spec';

describe('OwnershipGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        OwnershipGuard,
        {provide: Router, useValue: routerStub},
        {provide: AuthService, useValue: authServiceStub},
        {provide: SitesService, useValue: sitesServiceStub}
      ]
    });
  });

  it('should ...', inject([OwnershipGuard], (guard: OwnershipGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should reject requests if auth fails', fakeAsync(inject(
    [OwnershipGuard, AuthService], (guard: OwnershipGuard, auth: AuthService) => {
      (auth.authenticate as any).and.callFake(() => {
        return new Promise((resolve, reject) => {
          reject('foo');
        });
      });

      (guard.canActivate(<any>{}, <any>{}) as Observable<boolean>).subscribe(null, err => {
        expect(err).toEqual('foo');
      });

      tick();
    })));

  it('should reject requests if current user is null', fakeAsync(inject(
    [OwnershipGuard, AuthService], (guard: OwnershipGuard, auth: AuthService) => {
      (auth.authenticate as any).and.callFake(() => {
        return new Promise((resolve) => {
          resolve(null);
        });
      });

      (guard.canActivate(<any>{}, <any>{}) as Observable<boolean>).subscribe(result => {
        expect(result).toBe(false);
      });

      tick();
    })));

  it('should reject requests if the user doesnt match the given site', fakeAsync(inject(
    [OwnershipGuard, AuthService, SitesService], (guard: OwnershipGuard, auth: AuthService, sites: SitesService) => {
      (auth.authenticate as any).and.callFake(() => {
        return new Promise((resolve) => {
          resolve(mockUserData);
        });
      });

      spyOn(sites, 'get').and.callFake(() => {
        return Observable.create(observer => {
          observer.next({
            user: {
              id: 123
            }
          });
        });
      });

      (guard.canActivate(new ActivatedRouteSnapshot(), <any>{}) as Observable<boolean>).subscribe(result => {
        expect(result).toBe(false);
      });

      tick();
    })));

  it('should resolve requests if the user does match the given site', fakeAsync(inject(
    [OwnershipGuard, AuthService, SitesService], (guard: OwnershipGuard, auth: AuthService, sites: SitesService) => {
      (auth.authenticate as any).and.callFake(() => {
        return new Promise((resolve) => {
          resolve(mockUserData);
        });
      });

      spyOn(sites, 'get').and.callFake(() => {
        return Observable.create(observer => {
          observer.next({
            user: {
              id: 1
            }
          });
        });
      });

      (guard.canActivate(new ActivatedRouteSnapshot(), <any>{}) as Observable<boolean>).subscribe(result => {
        expect(result).toBe(true);
      });

      tick();
    })));
});
