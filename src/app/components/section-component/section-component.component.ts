import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {StringMap} from 'quill';
import {ComponentCollectionDataInterface, ComponentDataInterface, ComponentMedia, SectionComponentMetadata} from '../../index';
import {NavActionItem} from '../../models/nav-action-item';
import {SectionComponent} from '../../models/section-component';
import {getHexColorString} from '../../util/colors';
import {ConfigurableUIComponentWithToolbar, UIComponent} from '../component/component.component';
import {UIMediaComponent} from '../media-component/media-component';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {isPlatformBrowser} from '@angular/common';

export enum SectionLayoutOption {
  CompactLeft = 'CompactLeft',
  DefaultLeft = 'DefaultLeft',
  LargeLeft = 'LargeLeft',
  FullLeft = 'FullLeft',
  CompactCenter = 'CompactCenter',
  DefaultCenter = 'DefaultCenter',
  LargeCenter = 'LargeCenter',
  FullCenter = 'FullCenter',
  CompactRight = 'CompactRight',
  DefaultRight = 'DefaultRight',
  LargeRight = 'LargeRight',
  FullRight = 'FullRight',
  SplitCompactImageLeftTextRight = 'SplitCompactImageLeftTextRight',
  SplitCompactImageRightTextLeft = 'SplitCompactImageRightTextLeft',
  SplitDefaultImageLeftTextRight = 'SplitDefaultImageLeftTextRight',
  SplitDefaultImageRightTextLeft = 'SplitDefaultImageRightTextLeft',
  SplitLargeImageLeftTextRight = 'SplitLargeImageLeftTextRight',
  SplitLargeImageRightTextLeft = 'SplitLargeImageRightTextLeft',
  SplitFullImageLeftTextRight = 'SplitFullImageLeftTextRight',
  SplitFullImageRightTextLeft = 'SplitFullImageRightTextLeft',
}

@Component({
  selector: 'app-section-component',
  templateUrl: './section-component.component.html',
  styleUrls: ['./section-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Section component provides "Hero" views with customizable background and text colors, and more. This class makes
 * use of its parent class heavily, so be sure to read the docs on UIComponent.
 */
export class UISectionComponent extends ConfigurableUIComponentWithToolbar {
  /**
   * Ratio between title and subtitle size
   * @type {number}
   */
  static readonly TextSizeRatio = 0.55;
  /**
   * Override the Input property from parent to ensure a SectionComponent object is instantiated
   * @type {SectionComponent}
   */
  @Input() component: SectionComponent = new SectionComponent(null);
  /**
   * Rich text editor toolbar options
   */
  textEditorToolbarOptions: StringMap = [
    ['bold', 'italic'],
    [{color: []}],
    ['link'],
    ['clean']
  ];

  /**
   * Stores a ref to the background image File object if one is added
   */
  bgImageFile: File;

  /**
   * Observable to provide a url or dataUrl value for the background image if one has been added
   */
  mediaUrl: Observable<string> = Observable.create((observer: Subscriber<string>) => {
    const media = this.bgImageModel;
    if (media) {
      if (isPlatformBrowser(this.platformId) && media instanceof File) {
        observer.next('/assets/img/placeholder.svg');
        UIMediaComponent.getDataUrl(media).subscribe(dataUrl => {
          observer.next(dataUrl);
        });
      } else if (media.hasOwnProperty('url')) {
        observer.next(media.url);
      } else {
        // placeholder/isProcessing/isFailed image
        observer.next('/assets/img/smpte.jpg');
      }
    }
  });

  get bgImageModel(): any {
    try {
      if (this.bgImageFile) {
        return this.bgImageFile;
      } else {
        const collection = this.component.metadata.bgImage;
        return collection.components[0].media;
      }
    } catch (e) {
      return null;
    }
  }

  get titleModel(): string {
    try {
      return this.component.metadata.title;
    } catch (e) {
      return null;
    }
  }

  get subtitleModel(): string {
    try {
      return this.component.metadata.subtitle;
    } catch (e) {
      return null;
    }
  }

  get titleSize(): string {
    return `${this.textSize}em`;
  }

  get subtitleSize(): string {
    return `${(this.textSize * UISectionComponent.TextSizeRatio)}em`;
  }

  get textSize(): number {
    try {
      return this.component.metadata.textSize || UIComponent.BaseTextSize;
    } catch (e) {
      return UIComponent.BaseTextSize;
    }
  }

  get layoutOptions(): [SectionLayoutOption] {
    const options: [SectionLayoutOption] = [
      SectionLayoutOption.CompactLeft,
      SectionLayoutOption.DefaultLeft,
      SectionLayoutOption.LargeLeft,
      SectionLayoutOption.FullLeft,
      SectionLayoutOption.CompactCenter,
      SectionLayoutOption.DefaultCenter,
      SectionLayoutOption.LargeCenter,
      SectionLayoutOption.FullCenter,
      SectionLayoutOption.CompactRight,
      SectionLayoutOption.DefaultRight,
      SectionLayoutOption.LargeRight,
      SectionLayoutOption.FullRight,
      SectionLayoutOption.SplitCompactImageRightTextLeft,
      SectionLayoutOption.SplitCompactImageLeftTextRight,
      SectionLayoutOption.SplitDefaultImageRightTextLeft,
      SectionLayoutOption.SplitDefaultImageLeftTextRight,
      SectionLayoutOption.SplitLargeImageRightTextLeft,
      SectionLayoutOption.SplitLargeImageLeftTextRight,
      SectionLayoutOption.SplitFullImageRightTextLeft,
      SectionLayoutOption.SplitFullImageLeftTextRight,
    ];
    return options;
  }

  get layout(): SectionLayoutOption {
    return super.getLayout();
  }

  set layout(layout: SectionLayoutOption) {
    this.setLayout(layout);
  }

  isLayoutMedium(): boolean {
    return /^(Default|SplitDefault)/.test(this.layout.toString());
  }

  isLayoutFull(): boolean {
    return /^(Full|SplitFull)/.test(this.layout.toString());
  }

  isLayoutLarge(): boolean {
    return /^(Large|SplitLarge)/.test(this.layout.toString());
  }

  isLayoutCentered(): boolean {
    return /Center$/.test(this.layout.toString());
  }

  isLayoutRightAligned(): boolean {
    return /Right$/.test(this.layout.toString());
  }

  isLayoutSplit(): boolean {
    return /^Split/.test(this.layout.toString());
  }

  hasBgImage(): boolean {
    return !!this.bgImageModel;
  }

  shouldUseBgImage(): boolean {
    return this.hasBgImage() && !this.isLayoutSplit();
  }

  shouldDisableRemoveBgImage(): boolean {
    if (this.bgImageModel) {
      const collection = this.component.metadata.bgImage;
      return collection.components[0].media_processing;
    } else {
      return false;
    }
  }

  titleDidChange(title: string) {
    this.component.metadata.title = title;
    this.ref.markForCheck();
  }

  subtitleDidChange(subtitle: string) {
    this.component.metadata.subtitle = subtitle;
    this.ref.markForCheck();
  }

  configuration(): NavActionItem[] {
    const items = [
      new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Background Color',
        inputBinding: this.bgColor,
        onInputChange: (event: Event) => {
          this.component.metadata.bgColor = getHexColorString((event.target as HTMLInputElement).value);
          this.ref.markForCheck();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      }),
      new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Palette Color',
        inputBinding: this.paletteColor,
        onInputChange: (event: Event) => {
          this.component.metadata.paletteColor = getHexColorString((event.target as HTMLInputElement).value);
          this.ref.markForCheck();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      }),
      new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Text Size',
        inputType: 'range',
        min: UIComponent.MinTextSize,
        max: UIComponent.MaxTextSize,
        step: UIComponent.StepSize,
        inputBinding: this.textSize,
        onInputChange: (event: Event) => {
          const value = parseFloat((event.target as HTMLInputElement).value);
          this.component.metadata.textSize = Math.max(UIComponent.MinTextSize, value);
          this.ref.markForCheck();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      }),
    ];
    // add a button to copy image URLs from the toolbar if a background image is present
    if (this.hasBgImage() && !this.bgImageFile) {
      items.push(new NavActionItem('Copy Image URL', {
        isInput: false,
        isButton: true,
        hasIcon: true,
        iconName: 'copy',
        onInputClick: () => {
          this.mediaUrl.subscribe(url => {
            this.util.copyToClipboard(url);
          });
        }
      }));
    }
    return items;
  }

  fileDidChange(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.addBgImage(file);
    }
  }

  addBgImage(file: File = null) {
    // create the image object and save
    const timestamp = new Date().getTime();
    const payload: ComponentCollectionDataInterface<ComponentMedia, SectionComponentMetadata> = {
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
          metadata: {
            bgColor: '',
            bgImage: null,
            padding: null,
            layout: null,
            paletteColor: '',
            textSize: UIComponent.BaseTextSize,
            title: '',
            subtitle: ''
          },
          created_at: timestamp,
          updated_at: timestamp,
          component_collection_id: null
        }
      ],
      created_at: timestamp,
      updated_at: timestamp
    };
    // use the in-memory collection, with file object as media
    this.component.metadata.bgImage = payload;
    this.doAddBgImage(payload, file);
  }

  removeBgImage() {
    if (this.windowRef.nativeWindow.confirm('Are you sure you want to remove this image?')) {
      delete this.component.metadata.bgImage;
      this.saveWithThrottle();
    }
  }

  protected fallbackLayout(): SectionLayoutOption {
    return SectionLayoutOption.DefaultLeft;
  }

  private doAddBgImage(collection: ComponentCollectionDataInterface<ComponentMedia, SectionComponentMetadata>, file: File) {
    // create the component collection
    this.componentCollectionService.create(collection).subscribe((record: ComponentCollectionDataInterface) => {
      try {
        collection.id = record.id;
        collection.components[0].id = record.components[0].id;
        collection.components[0].component_collection_id = collection.id;
        // generate a data url for preview
        this.bgImageFile = file;
        this.ref.markForCheck();
        // creating the component collection was successful, now upload the file
        this.doFileUploadForCollection(collection, file);
      } catch (e) {
        console.log('Error setting id on collection', e);
        // the response was malformed, remove the component collection that was just added
        this.removeBgImage();
      }
    }, err => {
      console.log(err);
      // the request failed, remove the component collection that was just added
      this.removeBgImage();
    });
  }

  private doFileUploadForCollection(collection: ComponentCollectionDataInterface<ComponentMedia, SectionComponentMetadata>, file: File) {
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
        this.bgImageFile = null;
        this.ref.markForCheck();
        this.saveWithThrottle();
      });
    } catch (e) {
      console.log('Error uploading file for component', e);
    }
  }
}
