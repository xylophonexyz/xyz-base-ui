import {Component, OnInit} from '@angular/core';
import {SiteAdminComponent} from '../site-admin/site-admin.component';
import {Page} from '../../models/page';
import {PageNavigationItemNavigationStrategy} from '../../index';

@Component({
  selector: 'app-site-navigation',
  templateUrl: './site-navigation.component.html',
  styleUrls: ['./site-navigation.component.scss']
})
export class SiteNavigationComponent extends SiteAdminComponent implements OnInit {

  ngOnInit() {
    this.onChildInit();
  }

  toggleNavigationType(page: Page) {
    if (page.isExternalNavigationType()) {
      page.navigationType = PageNavigationItemNavigationStrategy.Internal;
      page.navigationHref = null;
    } else {
      page.navigationType = PageNavigationItemNavigationStrategy.External;
    }
  }
}
