import {Component, OnInit} from '@angular/core';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

@Component({
  selector: 'app-site-advanced-settings-component',
  templateUrl: './site-advanced-settings.component.html',
  styleUrls: ['./site-advanced-settings.component.scss']
})
export class SiteAdvancedSettingsComponent extends SiteAdminComponent implements OnInit {

  errorMessage: string;
  private _customDomainName: string;

  get customDomainName(): string {
    if (this.site && this.site.customDomain) {
      return this.site.customDomain.domainName;
    } else {
      return null;
    }
  }

  set customDomainName(name: string) {
    this._customDomainName = name;
  }

  ngOnInit() {
    this.onChildInit();
  }

  addCustomDomain() {
    if (this.site && this._customDomainName) {
      this.isLoading = true;
      this.sitesProvider.addCustomDomain(this.site.id, this._customDomainName).subscribe(res => {
        this.site.metadata.customDomain = {
          zoneId: res.createZoneResult.result.id,
          domainName: res.createZoneResult.result.name,
          nameServers: res.createZoneResult.result.name_servers
        };
        this.errorMessage = null;
        this.updateSiteMetadata();
      }, err => {
        this.isLoading = false;
        this.displayError(err);
      });
    }
  }

  removeCustomDomain() {
    this.isLoading = true;
    this.sitesProvider.removeCustomDomain(this.site.id).subscribe(() => {
      this.errorMessage = null;
      this.site.metadata.customDomain = null;
      this.updateSiteMetadata();
    }, err => {
      this.isLoading = false;
      this.displayError(err);
    });
  }

  private displayError(err: any) {
    try {
      this.errorMessage = err.json().errors[0].message;
    } catch (e) {
      this.errorMessage = err;
    }
  }
}
