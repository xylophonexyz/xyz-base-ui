import {Component, OnInit} from '@angular/core';
import {SiteAdminComponent} from '../site-admin/site-admin.component';
import {Page} from '../../models/page';
import {PagesService} from '../../providers/pages.service';

@Component({
  selector: 'app-site-pages',
  templateUrl: './site-pages.component.html',
  styleUrls: ['./site-pages.component.scss'],
})
export class SitePagesComponent extends SiteAdminComponent implements OnInit {

  get navigationItems(): Page[] {
    return this.site.pages.filter(p => {
      return p.isNavigationItem() && !p.isExternalNavigationType();
    });
  }

  ngOnInit() {
    this.onChildInit();
  }

  getPublicPageUrl(page: Page): string {
    return PagesService.getPublicPageUrl(page);
  }

  getInternalPageUrl(page: Page): string {
    return PagesService.getInternalPageUrl(page);
  }

}
