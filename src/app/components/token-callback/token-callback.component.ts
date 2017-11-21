import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../providers/auth.service';

@Component({
  selector: 'app-token-callback',
  templateUrl: './token-callback.component.html',
  styleUrls: ['./token-callback.component.scss']
})
export class TokenCallbackComponent implements OnInit, OnDestroy {

  isSuccess = false;
  isFail = false;
  private sub: any;

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe((params: any) => {
      const code = params.code;
      if (code) {
        this.auth.authenticate(code).then(() => {
          // success
          this.isSuccess = true;
          this.navigateToAdminRootWithTimeout();
        }).catch(() => {
          // authentication failed
          this.isFail = true;
          this.navigateToRootWithTimeout();
        });
      } else {
        // no authorization code is present so go back to the root page
        this.navigateToRoot();
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private navigateToAdminRootWithTimeout() {
    setTimeout(() => {
      this.router.navigate(['/admin']);
    }, 750);
  }

  private navigateToRootWithTimeout() {
    setTimeout(() => {
      this.navigateToRoot();
    }, 750);
  }

  private navigateToRoot() {
    this.router.navigate(['/']);
  }

}
