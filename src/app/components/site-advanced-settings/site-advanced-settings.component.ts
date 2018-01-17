import {Component, OnInit} from '@angular/core';
import {SiteAdminComponent} from '../site-admin/site-admin.component';
import {Observable} from 'rxjs/Observable';
import {isEqual} from 'lodash';

@Component({
  selector: 'app-site-advanced-settings-component',
  templateUrl: './site-advanced-settings.component.html',
  styleUrls: ['./site-advanced-settings.component.scss']
})
export class SiteAdvancedSettingsComponent extends SiteAdminComponent implements OnInit {

  errorMessage: string;
  private _customDomainName: string;
  private _newDomainMappings: Set<string> = new Set();
  private _newDomainMapping = '';
  private _selfManagedDns = false;

  get customDomainName(): string {
    return this._customDomainName;
  }

  set customDomainName(name: string) {
    this._customDomainName = name;
  }

  get isSelfManagedDns(): boolean {
    return this._selfManagedDns;
  }

  set isSelfManagedDns(value: boolean) {
    this._selfManagedDns = value;
  }

  get domainMappings(): string[] {
    return Array.from(this._newDomainMappings);
  }

  set domainMappings(mappings: string[]) {
    this._newDomainMappings = new Set(mappings);
  }

  get newDomainMapping(): string {
    return this._newDomainMapping;
  }

  set newDomainMapping(value: string) {
    this._newDomainMapping = value;
  }

  ngOnInit() {
    this.onChildInit();
    this.channel.messages$.subscribe(message => {
      if (message.topic === SiteAdminComponent.SiteAdminSiteDidLoad) {
        if (this.site && this.site.customDomain && this.site.customDomain.domainMappings) {
          this._newDomainMappings = new Set(this.site.customDomain.domainMappings);
        }
        if (this.site && this.site.customDomain && this.site.customDomain.domainName) {
          this._customDomainName = this.site.customDomain.domainName;
        }
        if (this.hasCustomDomain()) {
          this._selfManagedDns = this.site.customDomain.selfManagedDns;
        }
      }
    });
  }

  addCustomDomain() {
    if (this.site && this._customDomainName) {
      if (this.isSelfManagedDns) {
        this.addCustomDomainMappings();
      } else {
        this.isLoading = true;
        this.sitesProvider.addCustomDomain(this.site.id, this._customDomainName).subscribe(res => {
          this.site.metadata.customDomain = {
            zoneId: res.createZoneResult.result.id,
            domainName: res.createZoneResult.result.name,
            nameServers: res.createZoneResult.result.name_servers,
            selfManagedDns: this.isSelfManagedDns
          };
          this.errorMessage = null;
          this.updateSiteMetadata();
        }, err => {
          this.isLoading = false;
          this.displayError(err);
        });
      }
    }
  }

  addCustomDomainMappings() {
    this.isLoading = true;
    const requiredDnsRecords: string[] = [];
    const domainMappings: string[] = [];
    Observable.from(this.domainMappings).concatMap(mapping => {
      return this.sitesProvider.addDomainNameKeyPair(this.site.id, this.customDomainName, mapping);
    }).subscribe(res => {
      requiredDnsRecords.push(res.message);
      domainMappings.push(res.subdomain);
    }, err => {
      this.isLoading = false;
      this.displayError(err);
    }, () => {
      this.site.metadata.customDomain = {
        domainName: this.customDomainName,
        domainMappings: domainMappings,
        requiredDnsRecords: requiredDnsRecords,
        selfManagedDns: this.isSelfManagedDns
      };
      this.errorMessage = null;
      this.updateSiteMetadata();
    });
  }

  removeCustomDomain() {
    if (this.hasCustomDomain()) {
      if (this.isSelfManagedDns) {
        this.removeCustomDomainMappings();
      } else {
        this.isLoading = true;
        this.sitesProvider.removeCustomDomain(this.site.id).subscribe(() => {
          this.errorMessage = null;
          this._selfManagedDns = false;
          this.site.metadata.customDomain = null;
          this.updateSiteMetadata();
        }, err => {
          this.isLoading = false;
          this.displayError(err);
        });
      }
    }
  }

  removeCustomDomainMappings() {
    this.isLoading = true;
    Observable.from(this.domainMappings).concatMap(mapping => {
      return this.sitesProvider.removeDomainNameKeyPair(this.site.id, this.customDomainName, mapping);
    }).subscribe(
      null, err => {
        this.isLoading = false;
        this.displayError(err);
      }, () => {
        this.site.metadata.customDomain = null;
        this.errorMessage = null;
        this._selfManagedDns = false;
        this._customDomainName = null;
        this._newDomainMappings = new Set();
        this.updateSiteMetadata();
      });
  }

  addNewDomainMapping() {
    this._newDomainMappings.add(this.newDomainMapping);
    this.newDomainMapping = null;
  }

  removeDomainMapping(mapping: string) {
    this.domainMappings = this.domainMappings.filter(m => m !== mapping);
  }

  customDomainDidChange(): boolean {
    if (this.hasCustomDomain()) {
      return !isEqual(this._customDomainName, this.site.customDomain.domainName) ||
        !isEqual(Array.from(this._newDomainMappings), this.site.customDomain.domainMappings);
    } else {
      return true;
    }
  }

  hasCustomDomain(): boolean {
    return this.site && !!this.site.customDomain;
  }

  private displayError(err: any) {
    try {
      this.errorMessage = err.json().errors[0].message;
    } catch (e) {
      this.errorMessage = err;
    }
  }
}
