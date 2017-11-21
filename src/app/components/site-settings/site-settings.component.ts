import {Component, OnInit} from '@angular/core';
import {
  ComponentCollectionDataInterface,
  ComponentDataInterface,
  ComponentMedia,
  ComponentMetadata,
  CompositionDataInterface,
  ImageComponentMedia
} from '../../index';
import {Composition} from '../../models/composition';
import {UIMediaComponent} from '../media-component/media-component';
import {SiteAdminComponent} from '../site-admin/site-admin.component';
import {SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss'],
})
export class SiteSettingsComponent extends SiteAdminComponent implements OnInit {

  willDeleteSite = false;
  siteDeleteConfirmation = '';

  ngOnInit() {
    this.onChildInit();
  }

  uploadLogo(file: File): void {
    this.isLoading = true;
    this.sitesProvider.uploadLogo(this.site.id, this.site.asJson(), file).then((composition: CompositionDataInterface) => {
      this.isLoading = false;
      this.site.cover = composition.cover.media.url;
    }).catch(err => {
      this.isLoading = false;
      console.error(err);
    });
  }

  removeLogo(): void {
    this.isLoading = true;
    this.site.cover = null;
    this.sitesProvider.removeLogo(this.site.id).then(() => {
      this.isLoading = false;
    }).catch(err => {
      this.isLoading = false;
      console.error(err);
    });
  }

  coverFileDidChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.uploadLogo(file);
    }
  }

  faviconFileDidChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.uploadFavicon(file);
    }
  }

  updateSiteName(): void {
    if (this.site) {
      const params = {
        title: this.siteCopy.title
      };
      this.isLoading = true;
      this.site.title = this.siteCopy.title;
      this.siteCopy = null;
      this.sitesProvider.update(this.site.id, params).subscribe(() => {
        this.isLoading = false;
      }, (err) => {
        console.error(err);
      });
    }
  }

  willEditName(): boolean {
    return !!this.siteCopy;
  }

  editSiteName(): void {
    this.siteCopy = new Composition(this.site.asJson());
  }

  cancelEditSiteName(): void {
    this.siteCopy = null;
  }

  setSiteToPublished(): void {
    this.setSitePublishing(true);
  }

  setSiteToPrivate(): void {
    this.setSitePublishing(false);
  }

  deleteSite(): void {
    if (this.site) {
      this.isLoading = true;
      this.sitesProvider.destroy(this.site.id).subscribe(() => {
        this.router.navigate(['/admin']);
        this.isLoading = false;
      }, () => {
        this.isLoading = false;
      });
    }
  }

  uploadFavicon(file: File): void {
    this.isLoading = true;
    // create the image object and save
    const timestamp = new Date().getTime();
    const payload: ComponentCollectionDataInterface<ComponentMedia, null> = {
      id: null,
      type: 'ComponentCollection',
      index: 0,
      collectible_id: null,
      collectible_type: null,
      metadata: {
        metatype: 'ImageCollection'
      },
      components: [
        {
          id: null,
          index: 0,
          type: 'ImageComponent',
          media: null,
          media_processing: true,
          metadata: null,
          created_at: timestamp,
          updated_at: timestamp,
          component_collection_id: null
        }
      ],
      created_at: timestamp,
      updated_at: timestamp
    };
    // use the in-memory collection, with file object as media
    this.site.metadata.favicon = payload;
    this.doAddFavicon(payload, file);
  }

  removeFavicon() {
    delete this.site.metadata.favicon;
    this.updateSiteMetadata();
  }

  faviconUrl(site: Composition): SafeUrl {
    if (site) {
      return this.sanitizer.bypassSecurityTrustStyle(`url(${site.favicon})`);
    }
  }

  protected setSitePublishing(published: boolean): void {
    if (this.site) {
      this.site.published = published;
      this.sitesProvider.publish(this.site.id, published).subscribe(() => {
      }, () => {
        this.site.published = !published;
      });
    }
  }

  private doAddFavicon(collection: ComponentCollectionDataInterface<ImageComponentMedia, ComponentMetadata>, file: File) {
    // create the component collection
    this.componentCollectionService.create(collection).subscribe((record: ComponentCollectionDataInterface) => {
      try {
        collection.id = record.id;
        collection.components[0].id = record.components[0].id;
        collection.components[0].component_collection_id = collection.id;
        // generate a data url for preview
        UIMediaComponent.getDataUrl(file).subscribe(dataUrl => {
          collection.components[0].media = {url: dataUrl};
        });
        // creating the component collection was successful, now upload the file
        this.doFileUploadForCollection(collection, file);
      } catch (e) {
        console.log('Error setting id on collection', e);
        // the response was malformed, remove the component collection that was just added
        this.removeFavicon();
      }
    }, err => {
      console.log(err);
      // the request failed, remove the component collection that was just added
      this.removeFavicon();
    });
  }

  private doFileUploadForCollection(collection: ComponentCollectionDataInterface<ImageComponentMedia, ComponentMetadata>, file: File) {
    try {
      this.componentService.upload(collection.components[0].id, file).subscribe((res: ComponentDataInterface) => {
        collection.components[0].media_processing = res.media_processing;
        // dont override the dataUrl preview -- add the final media data when the processing job is complete
        if (!res.media_processing) {
          collection.components[0].media = res.media;
        }
      }, err => {
        collection.components[0].media = {error: err};
        collection.components[0].media_processing = false;
      }, () => {
        this.updateSiteMetadata();
      });
    } catch (e) {
      console.log('Error uploading file for component', e);
    }
  }

}
