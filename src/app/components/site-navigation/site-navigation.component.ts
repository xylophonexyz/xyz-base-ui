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

  pageSelectionModalActive = false;
  existingPageAsChildPageSelection: Page = null;

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

  openPageSelectionModal() {
    this.pageSelectionModalActive = true;
  }

  setExistingPageAsChildPage() {
    if (this.existingPageAsChildPageSelection) {
      this.existingPageAsChildPageSelection.metadata.navigationItem = true;
      this.isLoading = true;
      this.pagesProvider.update(this.existingPageAsChildPageSelection.id, this.existingPageAsChildPageSelection.asJson()).subscribe(
        null,
        null,
        () => {
          this.isLoading = false;
          this.existingPageAsChildPageSelection = null;
          this.pageSelectionModalActive = false;
        });
    }
  }

  unlinkAsNavigationItem(page: Page) {
    if (this.windowRef.nativeWindow.confirm('Are you sure you want to unlink this page from navigation?')) {
      page.metadata.navigationItem = false;
      this.isLoading = true;
      this.pagesProvider.update(page.id, page.asJson()).subscribe(
        null,
        null,
        () => {
          this.isLoading = false;
          this.clearDnsLookupCache();
        }
      );
    }
  }

  toggleExistingPageAsChildPageSelection(page: Page) {
    if (this.existingPageAsChildPageSelection) {
      this.existingPageAsChildPageSelection = null;
    } else {
      this.existingPageAsChildPageSelection = page;
    }
  }

  isPageSelectedAsExistingPageAsChildPageSelection(page: Page): boolean {
    if (this.existingPageAsChildPageSelection) {
      return this.existingPageAsChildPageSelection.id === page.id;
    } else {
      return false;
    }
  }
}
