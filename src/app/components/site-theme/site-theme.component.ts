import {Component, OnInit} from '@angular/core';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

@Component({
  selector: 'app-site-theme',
  templateUrl: './site-theme.component.html',
  styleUrls: ['./site-theme.component.scss']
})
export class SiteThemeComponent extends SiteAdminComponent implements OnInit {

  ngOnInit() {
    this.onChildInit();
  }

  showLogoInSiteHeader() {
    if (!this.site.shouldShowLogoInHeader()) {
      this.site.metadata.showLogoInHeader = true;
      this.updateSiteMetadata();
    }
  }

  hideLogoInSiteHeader() {
    if (this.site.shouldShowLogoInHeader()) {
      this.site.metadata.showLogoInHeader = false;
      this.updateSiteMetadata();
    }
  }

  addShadowToSiteHeader() {
    if (!this.site.hasHeaderShadow()) {
      this.site.metadata.hasHeaderShadow = true;
      this.updateSiteMetadata();
    }
  }

  removeShadowFromSiteHeader() {
    if (this.site.hasHeaderShadow()) {
      this.site.metadata.hasHeaderShadow = false;
      this.updateSiteMetadata();
    }
  }

  addTabbedNavToSiteHeader() {
    if (!this.site.hasTabbedNav()) {
      this.site.metadata.hasTabbedNav = true;
      this.updateSiteMetadata();
    }
  }

  removeTabbedNavFromSiteHeader() {
    if (this.site.hasTabbedNav()) {
      this.site.metadata.hasTabbedNav = false;
      this.updateSiteMetadata();
    }
  }

}
