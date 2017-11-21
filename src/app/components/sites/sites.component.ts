import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CompositionDataInterface} from '../../index';
import {Composition} from '../../models/composition';
import {SitesService} from '../../providers/sites.service';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss']
})
export class SitesComponent implements OnInit {

  sites: Composition[];
  isLoading = false;
  siteToCreate: { title: string } = {title: ''};
  uiFilter = {all: true, showPublic: false, showPrivate: false};
  private uiShowView = {form: false, button: true};

  constructor(private sitesProvider: SitesService,
              private router: Router) {
  }

  ngOnInit() {
    this.sitesProvider.all().subscribe((res: CompositionDataInterface[]) => {
      this.sites = res.map(c => {
        return new Composition(c);
      }).sort((a, b) => {
        if (a.updatedAt < b.updatedAt) {
          return 1;
        } else if (a.updatedAt > b.updatedAt) {
          return -1;
        } else {
          return 0;
        }
      });
    });
  }

  sitesFilteredByActiveTab(sites: Composition[]): Composition[] {
    if (sites) {
      return sites.filter(s => {
        if (this.uiFilter.showPublic) {
          return s.isPublished();
        } else if (this.uiFilter.showPrivate) {
          return !s.isPublished();
        } else {
          return true;
        }
      });
    } else {
      return [];
    }
  }

  firstPageUrl(site: Composition): string {
    if (site && site.pages.length) {
      return `/p/${site.pages[0].id}`;
    } else {
      return '';
    }
  }

  settingsUrl(site: Composition): string {
    if (site) {
      return `/admin/sites/${site.id}/settings`;
    } else {
      return '';
    }
  }

  createSite(site: { title: string }): void {
    if (site.title && !this.isLoading) {
      const params = {
        title: site.title,
        publish: this.uiFilter.all || this.uiFilter.showPublic,
        cover: false,
        metadata: Composition.DefaultMetadata
      };
      this.isLoading = true;
      this.sitesProvider.create(params).subscribe((res: CompositionDataInterface) => {
        this.router.navigate([`/admin/sites/${res.id}/settings`]);
        this.isLoading = false;
      }, (err) => {
        console.error(err);
        this.isLoading = false;
      });
    }
  }

  showForm(): void {
    this.uiShowView.form = true;
    this.uiShowView.button = false;
  }

  showAddSiteButton(): void {
    this.uiShowView.form = false;
    this.uiShowView.button = true;
  }

  shouldShowAddSiteButton(): boolean {
    return this.uiShowView.button;
  }

  shouldShowForm(): boolean {
    return this.uiShowView.form;
  }

  setUIFilter(value: 'all' | 'showPublic' | 'showPrivate') {
    if (value === 'all') {
      this.uiFilter = {
        all: true,
        showPrivate: false,
        showPublic: false
      };
    } else if (value === 'showPublic') {
      this.uiFilter = {
        all: false,
        showPrivate: false,
        showPublic: true
      };
    } else if (value === 'showPrivate') {
      this.uiFilter = {
        all: false,
        showPrivate: true,
        showPublic: false
      };
    }
  }
}
