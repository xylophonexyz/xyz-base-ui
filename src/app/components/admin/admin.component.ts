import {Component, Inject, OnInit} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {APPLICATION_NAME} from '../../index';
import {AuthService} from '../../providers/auth.service';
import {Favicon} from '../../providers/favicon.service';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  constructor(private auth: AuthService,
              private route: ActivatedRoute,
              private titleService: Title,
              private metaService: Meta,
              private nav: NavbarDelegateService,
              @Inject(APPLICATION_NAME) private appTitle) {
  }

  get pageHeader(): string {
    const child = this.route.firstChild;
    if (child.routeConfig.path === 'settings') {
      return 'Account';
    } else if (child.routeConfig.path === 'sites') {
      return 'Your Sites';
    } else {
      return 'Admin';
    }
  }

  ngOnInit() {
    // display the navbar if the user is authenticated
    this.auth.authenticate().then(() => {
      this.nav.displayNavbar(true);
    }, () => {
      this.nav.displayNavbar(false);
    });
    this.setDocumentFavicon();
    this.setDocumentTitle();
    this.setDocumentMetaTags();
  }

  private setDocumentFavicon() {
    Favicon.resetFavicon();
  }

  private setDocumentTitle() {
    this.titleService.setTitle(this.appTitle());
  }

  private setDocumentMetaTags() {
    this.metaService.removeTag('name="og:type"');
    this.metaService.removeTag('name="og:site_name"');
    this.metaService.removeTag('name="twitter:card"');
    this.metaService.removeTag('name="description"');
    this.metaService.removeTag('name="og:description"');
    this.metaService.removeTag('name="twitter:description"');
    this.metaService.removeTag('itemprop="description"');
    this.metaService.removeTag('name="title"');
    this.metaService.removeTag('name="og:title"');
    this.metaService.removeTag('name="twitter:title"');
    this.metaService.removeTag('itemprop="title"');
    this.metaService.removeTag('name="og:image"');
    this.metaService.removeTag('name="twitter:image"');
    this.metaService.removeTag('itemprop="image"');
  }
}
