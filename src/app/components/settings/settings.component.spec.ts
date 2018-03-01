import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {loginServiceStub} from '../../../test/stubs/login.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {userServiceStub} from '../../../test/stubs/user.service.stub.spec';
import {mockFile} from '../../../modules/file-upload/file-upload.service.spec';
import {User} from '../../models/user';
import {mockUserData} from '../../models/user.spec';
import {AuthService} from '../../providers/auth.service';
import {LoginService} from '../../providers/login.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {UserService} from '../../providers/user.service';
import {UIMediaComponent} from '../media-component/media-component';

import {SettingsComponent} from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [FormsModule, FeatherModule],
      providers: [
        {provide: AuthService, useValue: authServiceStub},
        {provide: LoginService, useValue: loginServiceStub},
        {provide: UserService, useValue: userServiceStub},
        {provide: NavbarDelegateService, useValue: navbarNotifierStub}
      ]
    }).compileComponents();
  }));

  function createComponentInstance() {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should be created', () => {
    createComponentInstance();
    expect(component).toBeTruthy();
  });

  describe('OnInit', () => {
    it('should authenticate and display the navbar', async(() => {
      const nav = getTestBed().get(NavbarDelegateService);
      spyOn(nav, 'displayNavbar');
      createComponentInstance();
      setTimeout(() => {
        expect(nav.displayNavbar).toHaveBeenCalledWith(true);
      });
    }));

    it('should assert the navbar is hidden if authentication fails', async(() => {
      const auth = getTestBed().get(AuthService);
      const nav = getTestBed().get(NavbarDelegateService);
      auth.authenticate.and.callFake(() => {
        return new Promise((_, reject) => reject());
      });
      spyOn(nav, 'displayNavbar');
      createComponentInstance();
      setTimeout(() => {
        expect(nav.displayNavbar).toHaveBeenCalledWith(false);
      });
    }));
  });

  describe('Editing user data', () => {

    const currentUser = new User(mockUserData);

    beforeEach(() => {
      createComponentInstance();
    });

    it('should create a copy of the current user to edit', () => {
      component.currentUser = currentUser;
      expect(component.currentUserCopy).toEqual(null);
      component.editUser();
      expect(component.currentUserCopy).toEqual(currentUser);
    });

    it('should provide a method to tell if the state is in edit mode', () => {
      component.currentUser = currentUser;
      expect(component.willEditUser()).toEqual(false);
      component.editUser();
      expect(component.willEditUser()).toEqual(true);
    });

    it('should provide a method to exit the edit mode state', () => {
      component.currentUser = currentUser;
      component.editUser();
      component.cancelEditUser();
      expect(component.currentUserCopy).toEqual(null);
      expect(component.emailIsTaken).toEqual(false);
    });
  });

  describe('Updating the users photo', () => {

    const currentUser = new User(mockUserData);
    const photoData = 'data:base64';

    beforeEach(() => {
      createComponentInstance();
    });

    it('should clear any photo and update', () => {
      const userService = getTestBed().get(UserService);
      spyOn(userService, 'updateUserPhoto').and.callThrough();

      currentUser.avatar = photoData;
      component.currentUser = currentUser;

      expect(component.currentUser.avatar).toEqual(photoData);

      component.removePhoto();
      expect(component.currentUser.avatar).not.toEqual(photoData);
      expect(userService.updateUserPhoto).toHaveBeenCalled();
    });

    it('should handle errors when updating the photo', () => {
      const userService = getTestBed().get(UserService);
      spyOn(userService, 'updateUserPhoto').and.callFake(() => {
        return Observable.create(o => o.error({}));
      });
      spyOn(UIMediaComponent, 'getDataUrl').and.callFake(() => {
        return Observable.create(o => o.next(photoData));
      });

      component.currentUser = currentUser;
      component.fileDidChange({target: {files: [mockFile(1000, 'file.jpg')]}} as any);

      expect(userService.updateUserPhoto).toHaveBeenCalled();
    });

    it('should provide a handler for file changes', () => {
      const userService = getTestBed().get(UserService);
      spyOn(userService, 'updateUserPhoto').and.callThrough();
      spyOn(UIMediaComponent, 'getDataUrl').and.callFake(() => {
        return Observable.create(o => o.next(photoData));
      });

      component.currentUser = currentUser;
      component.fileDidChange({target: {files: [mockFile(1000, 'file.jpg')]}} as any);

      expect(component.currentUser.avatar).toEqual(photoData);
      expect(userService.updateUserPhoto).toHaveBeenCalled();
    });

  });

  describe('Updating the users email address', () => {

    const currentUser = new User(mockUserData);

    beforeEach(() => {
      createComponentInstance();
    });

    it('should run a check to see if the new email is taken', async(() => {
      const userService = getTestBed().get(UserService);
      const loginService = getTestBed().get(LoginService);
      spyOn(loginService, 'doEmailCheck').and.callFake(() => {
        return new Promise((_, reject) => reject()); // this means the email is available
      });
      spyOn(userService, 'update').and.callThrough();
      component.currentUser = currentUser;
      component.editUser();
      component.currentUserCopy.email = 'new1@email.com';

      component.updateUserEmail();

      setTimeout(() => {
        expect(component.currentUser.email).toEqual('new1@email.com');
        expect(userService.update).toHaveBeenCalled();
        expect(component.currentUserCopy).toEqual(null);
        expect(component.emailIsTaken).toEqual(false);
      });
    }));

    it('should handle emails that are already taken', async(() => {
      const userService = getTestBed().get(UserService);
      const loginService = getTestBed().get(LoginService);
      spyOn(loginService, 'doEmailCheck').and.callFake(() => {
        return new Promise((resolve, _) => resolve()); // this means the email is not available
      });
      spyOn(userService, 'update').and.callThrough();
      component.currentUser = currentUser;
      component.editUser();
      component.currentUserCopy.email = 'new2@email.com';

      component.updateUserEmail();

      setTimeout(() => {
        expect(component.currentUser.email).not.toEqual(component.currentUserCopy.email);
        expect(userService.update).not.toHaveBeenCalled();
        expect(component.currentUserCopy).not.toEqual(null);
        expect(component.emailIsTaken).toEqual(true);
      });
    }));

    it('should handle errors returned by updateUser', async(() => {
      const userService = getTestBed().get(UserService);
      const loginService = getTestBed().get(LoginService);
      spyOn(loginService, 'doEmailCheck').and.callFake(() => {
        return new Promise((_, reject) => reject()); // this means the email is available
      });
      spyOn(userService, 'update').and.callFake(() => {
        return Observable.create(o => o.error({}));
      });
      component.currentUser = currentUser;
      component.editUser();
      component.currentUserCopy.email = 'new@email.com';

      component.updateUserEmail();

      setTimeout(() => {
        expect(component.isLoading).toEqual(false);
      });
    }));
  });

  describe('Deleting the users account', () => {

    const currentUser = new User(mockUserData);

    beforeEach(() => {
      createComponentInstance();
    });

    it('should delete the users account and log out', async(() => {
      const userService = getTestBed().get(UserService);
      const loginService = getTestBed().get(LoginService);
      spyOn(userService, 'deleteUser').and.callThrough();
      spyOn(loginService, 'logout');

      component.currentUser = currentUser;
      component.deleteAccount();

      setTimeout(() => {
        expect(userService.deleteUser).toHaveBeenCalled();
        expect(loginService.logout).toHaveBeenCalled();
      });
    }));
  });
});
