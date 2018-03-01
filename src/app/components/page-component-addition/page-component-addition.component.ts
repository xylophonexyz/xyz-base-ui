import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {AvailableComponent, ComponentCollectionDataInterface, ComponentDataInterface} from '../../index';
import {ComponentCollection} from '../../models/component-collection';
import {Page} from '../../models/page';
import {ComponentService} from '../../providers/component.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {PagesService} from '../../providers/pages.service';
import {UIComponent} from '../component/component.component';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-page-component-addition',
  templateUrl: './page-component-addition.component.html',
  styleUrls: ['./page-component-addition.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageUIComponentCollectionAdditionComponent implements OnInit {

  @Input() page: Page;
  shouldShowButtons = false;
  componentAddButtons = null;

  constructor(private http: HttpClient,
              private pagesService: PagesService,
              private channel: MessageChannelDelegateService,
              private componentService: ComponentService) {
  }

  ngOnInit() {
    this.http.get('/me/components').subscribe(res => {
      this.componentAddButtons = res as AvailableComponent[];
    });
  }

  groupButtonsIntoColumns(groupLength: number = 2): AvailableComponent[][] {
    if (this.componentAddButtons) {
      const buttons = Object.assign([], this.componentAddButtons);
      const groups = [];
      while (buttons.length) {
        groups.push(buttons.splice(0, groupLength));
      }
      return groups;
    } else {
      return [];
    }
  }

  addComponent(component: AvailableComponent, media: any = null) {
    this.shouldShowButtons = false;
    const timestamp = new Date().getTime();
    const payload: ComponentCollectionDataInterface = {
      id: null,
      type: component.type,
      index: this.nextIndex(),
      collectible_id: this.page.id,
      collectible_type: 'Page',
      metadata: {
        metatype: component.metatype
      },
      components: [
        {
          id: null,
          index: 0,
          type: UIComponent.componentTypeByMetatype(component.metatype),
          media: media,
          media_processing: false,
          metadata: UIComponent.componentMetadataByType(component.metatype),
          created_at: timestamp,
          updated_at: timestamp,
          component_collection_id: null
        }
      ],
      created_at: timestamp,
      updated_at: timestamp
    };
    this.doAddComponentCollection(payload, this.isFileInputType(component) ? media : null);
  }

  isFileInputType(component: AvailableComponent): boolean {
    return UIComponent.isFileInputType(component);
  }

  fileDidChange(component: AvailableComponent, event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.addComponent(component, file);
    }
  }

  private doAddComponentCollection(payload: ComponentCollectionDataInterface, file?: File) {
    const collection = new ComponentCollection(payload);
    this.page.components.push(collection);

    this.pagesService.addComponentCollection(this.page.id, payload).subscribe((record: ComponentCollectionDataInterface) => {
      try {
        collection.id = record.id;
        collection.components[0].id = record.components[0].id;
        collection.components[0].componentCollectionId = collection.id;

        if (file) {
          this.doFileUploadForCollection(collection, file);
        }

      } catch (e) {
        console.log('Error setting id on collection', e);
        // remove the component collection that was just added
        this.page.components.pop();
      }
    }, err => {
      console.log(err);
      // remove the component collection that was just added
      this.page.components.pop();
    });
  }

  private doFileUploadForCollection(collection: ComponentCollection, file: File) {
    try {
      const component = collection.components[0];
      this.componentService.upload(component.id, file).subscribe((res: ComponentDataInterface) => {
        component.media = res.media;
        component.mediaIsProcessing = res.media_processing;
        this.channel.sendMessage({
          topic: UIComponent.GenericMessageTopic,
          data: UIComponent.DetectChangesMessage
        });
      }, err => {
        component.media = {error: err};
        component.mediaIsProcessing = false;
        this.channel.sendMessage({
          topic: UIComponent.GenericMessageTopic,
          data: UIComponent.DetectChangesMessage
        });
      });
    } catch (e) {
      console.log('Error uploading file for component', e);
    }
  }

  private nextIndex(): number {
    let index = -1;
    this.page.components.forEach(c => {
      if (c.index > index) {
        index = c.index;
      }
    });
    return index + 1;
  }
}
