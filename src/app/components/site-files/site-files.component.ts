import {Component, OnInit} from '@angular/core';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/concatMap';
import {Observable} from 'rxjs/Observable';
import {isNull} from 'lodash';
import {
  ComponentCollectionDataInterface, ComponentDataInterface, LocalComponentTypes, PageDataInterface,
  SectionComponentMetadata,
} from '../../index';
import {Component as XzComponent} from '../../models/component';

import {SiteAdminComponent} from '../site-admin/site-admin.component';

export interface FileItem {
  pageId: number,
  component: XzComponent
  metatype: LocalComponentTypes,
}

@Component({
  selector: 'app-site-files',
  templateUrl: './site-files.component.html',
  styleUrls: ['./site-files.component.scss']
})
export class SiteFilesComponent extends SiteAdminComponent implements OnInit {

  private _components: FileItem[] = null;

  ngOnInit() {
    this.onChildInit();
    this.channel.messages$.subscribe(message => {
      if (message.topic === SiteAdminComponent.SiteAdminSiteDidLoad) {
        this.buildFilesList();
      }
    });
  }

  get files(): FileItem[] {
    return this._components || [];
  }

  copyLink(url: string) {
    this.util.copyToClipboard(url);
  }

  getMediaUrl(file: FileItem): string {
    try {
      return file.component.media.url;
    } catch (err) {
      return '';
    }
  }

  getFileMetadata(file: FileItem): any {
    try {
      return file.component.media.transcoding.image[0];
    } catch (err) {
      return {};
    }
  }

  private buildFilesList() {
    if (isNull(this._components)) {
      const pageRequests = this.site.pages.map(page => this.pagesProvider.get(page.id));
      this._components = [];
      Observable.from(pageRequests).concatMap(req => req).subscribe((page: PageDataInterface) => {
        const components: FileItem[] = [];
        page.components.forEach((collection: ComponentCollectionDataInterface) => {
          const siteFile = {
            metatype: collection.metadata ? collection.metadata.metatype : null,
            component: null,
            pageId: page.id,
          };
          collection.components.forEach((component: ComponentDataInterface) => {
            const metadata = component.metadata;
            if (siteFile.metatype === LocalComponentTypes.Hero && (metadata as SectionComponentMetadata).bgImage) {
              siteFile.component = new XzComponent((metadata as SectionComponentMetadata).bgImage.components[0]);
            } else if (siteFile.metatype === LocalComponentTypes.ImageCollection) {
              siteFile.component = new XzComponent(component);
            }
            if (siteFile.component) {
              components.push(siteFile);
            }
          });
        });
        this._components = this._components.concat(components);
        console.log(this._components);
      });
    }
  }

}
