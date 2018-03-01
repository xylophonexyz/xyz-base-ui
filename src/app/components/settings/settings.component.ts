import {Component, OnInit} from '@angular/core';
import {User} from '../../models/user';
import {AuthService} from '../../providers/auth.service';
import {LoginService} from '../../providers/login.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {UserService} from '../../providers/user.service';
import {UIMediaComponent} from '../media-component/media-component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  currentUser: User = null;
  currentUserCopy: User = null;
  isLoading = false;
  willDeleteAccount = false;
  accountDeletionConfirmation = '';
  emailIsTaken = false;

  constructor(private auth: AuthService,
              private loginService: LoginService,
              private userService: UserService,
              private nav: NavbarDelegateService) {
  }

  ngOnInit() {
    // display the navbar if the user is authenticated
    this.auth.authenticate().then((user: User) => {
      this.currentUser = user;
      this.nav.displayNavbar(true);
    }).catch(() => {
      this.nav.displayNavbar(false);
    });
  }

  willEditUser(): boolean {
    return !!this.currentUserCopy;
  }

  editUser() {
    this.currentUserCopy = new User(this.currentUser.asJson());
  }

  cancelEditUser(): void {
    this.currentUserCopy = null;
    this.emailIsTaken = false;
  }

  removePhoto(): void {
    this.currentUser.avatar = null;
    this.updateUserPhoto();
  }

  fileDidChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      UIMediaComponent.getDataUrl(file).subscribe(dataUrl => {
        this.currentUser.avatar = dataUrl;
        this.updateUserPhoto();
      });
    }
  }

  // TODO: it may be necessary to verify a new email before saving.
  updateUserEmail() {
    this.isLoading = true;
    this.loginService.doEmailCheck(this.currentUserCopy.email).then(() => {
      // the email is taken
      this.isLoading = false;
      this.emailIsTaken = true;
    }).catch(() => {
      // the email is available
      this.currentUser.email = this.currentUserCopy.email;
      this.updateUser();
      this.cancelEditUser();
    });
  }

  deleteAccount() {
    this.userService.deleteUser(this.currentUser.id).subscribe(() => {
      this.loginService.logout();
    });
  }

  private updateUserPhoto() {
    this.isLoading = true;
    const photo = this.currentUser.hasAvatar() ? this.currentUser.avatar : null;
    this.userService.updateUserPhoto(this.currentUser.id, photo).subscribe(() => {
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

  private updateUser() {
    this.isLoading = true;
    this.userService.update(this.currentUser.asJson()).subscribe(() => {
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
    });
  }

}
