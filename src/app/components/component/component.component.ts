import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnChanges, OnDestroy, PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {isObject, throttle} from 'lodash';
import {StringMap} from 'quill';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {XzRichTextDirective} from '../../directives/xz-rich-text-directive/xz-rich-text.directive';
import {
  AvailableComponent, CanonicalComponentType, ComponentDataInterface, ComponentMetadata, LocalComponentType,
  SectionComponentMetadata
} from '../../index';
import {Component as XzComponent} from '../../models/component';
import {NavActionItem} from '../../models/nav-action-item';
import {Page} from '../../models/page';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {getColorPalette} from '../../util/colors';
import {UtilService} from '../../providers/util.service';

/**
 * @description
 * `emitShowOptions` is called when the component gains focus through a click event. it sets any additional configuration
 * UI by calling the methods provided by FooterDelegate
 * `emitHideOptions` is called when the component loses focus. it clears the configuration set by calling the methods
 * provided by FooterDelegate
 * `configuration` returns an array of NavActionItem that are used to build the UI in the footer that allows for
 * extended settings for the component
 */
export interface HasFooterConfig {
  emitShowOptions(): void;

  emitHideOptions(): void;

  configuration(): NavActionItem[];
}

/**
 * @description
 * `layoutOptions` is a getter that returns an array of options that are recognized by the component to set its layout.
 * Typically this is an enum
 * `setLayout` will update the component's metadata to bind the provided layout option as its stored layout
 * `toggleLayout` will cycle through the options provided by `layoutOptions` and call `setLayout` on the next one
 */
export interface HasLayoutOptions {
  layoutOptions: any[];

  setLayout(layout: any): void;

  toggleLayout(): void;
}

@Component({
  selector: 'app-component',
  templateUrl: '../component/component.component.html',
  styleUrls: ['../component/component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIComponent implements OnChanges, OnDestroy, HasFooterConfig, HasLayoutOptions {

  static readonly GenericMessageTopic = 'UIComponent::Message::Generic';
  static readonly DetectChangesMessage = 'DetectChanges';
  static readonly BasePaletteColor = '#0366d6';
  static readonly BasePaddingValue = 3;
  static readonly BaseImageSizeValue = 0.5;
  static readonly ImageStepSizeValue = 0.5;
  static readonly MaxImageSizeValue = 100;
  static readonly BaseTextSize = 2;
  static readonly MinTextSize = 0.5;
  static readonly MaxTextSize = 12;
  static readonly StepSize = 0.5;
  static readonly MinPaddingValue = 1;
  static readonly MaxPaddingValue = 64;

  @Input() editable = false;
  @Input() showOptions = false;
  @Input() component: XzComponent = new XzComponent(null);
  @Input() page: Page = new Page(null);

  protected channelSubscription: Subscription;
  protected saveWithThrottle = throttle(() => {
    this.save().subscribe();
  }, 2000, {leading: true});

  static isFileInputType(component: AvailableComponent): boolean {
    return component.metatype === 'ImageCollection';
  }

  static componentTypeByMetatype(type: LocalComponentType): CanonicalComponentType {
    switch (type) {
      case 'ImageCollection':
        return 'ImageComponent';
      default:
        return 'Component';
    }
  }

  static componentMetadataByType(type: LocalComponentType): ComponentMetadata {
    switch (type) {
      case 'Hero':
        return {
          bgColor: '',
          padding: null,
          layout: null,
          paletteColor: UIComponent.BasePaletteColor,
          textSize: UIComponent.BaseTextSize,
          title: '',
          subtitle: ''
        } as SectionComponentMetadata;
      default:
        return {
          bgColor: '',
          padding: null,
          layout: null,
          paletteColor: UIComponent.BasePaletteColor,
          textSize: UIComponent.BaseTextSize
        };
    }
  }

  constructor(protected footer: FooterDelegateService,
              protected ref: ChangeDetectorRef,
              protected sanitizer: DomSanitizer,
              protected componentService: ComponentService,
              protected componentCollectionService: ComponentCollectionService,
              protected channel: MessageChannelDelegateService,
              protected util: UtilService,
              @Inject(PLATFORM_ID) public platformId) {
    this.channelSubscription = channel.messages$.subscribe(message => {
      if (message.topic === UIComponent.GenericMessageTopic) {
        // pass the payload off to didGetMessage, which is overridden by any subclass interested in receiving messages
        this.didGetMessage(message.data);
      }
    });
  }

  /**
   * Implemented by subclass to provide the current layout for the component
   * @returns {null}
   */
  get layout(): any {
    return null;
  }

  /**
   * Implemented by subclass to provide customizable layout options for rendering itself in any number of ways
   * defined by the component itself
   * @returns {Array}
   */
  get layoutOptions(): any[] {
    return [];
  }

  /**
   * Implemented by subclasses to act on inter-class messages sent through MessageChannelService.
   * @param message
   */
  didGetMessage(message: any): void {
    // void
  }

  /**
   * Stop propagation of clicks when a field is focused. Useful to stop the parent focus from changing if a field
   * is being edited.
   * @param {Event} event
   */
  didFocusField(event: Event) {
    if (this.showOptions && isObject(event)) {
      event.stopPropagation();
    }
  }

  /**
   * Hide or show this component's configuration options from the application footer based on changes to @Input
   * bindings
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.showOptions) {
      if (changes.showOptions.currentValue) {
        // set with timeout due to ngOnChanges being called any time a component gains focus. without timeout this
        // leads to race condition, with the component losing focus calling emitHideOptions after the component
        // gaining focus calls emitShowOptions, resulting in no options (more specifically []) being emitted to footer
        this.emitShowOptions();
      } else {
        // persist changes when this component loses focus
        this.saveWithThrottle();
        // clear this component's configuration from footer
        this.emitHideOptions();
      }
    }
  }

  /**
   * Perform any necessary clean up routines, such as unsubscribing from observables.
   */
  ngOnDestroy() {
    this.channelSubscription.unsubscribe();
  }

  /**
   * Update the layout for this component and trigger change detection
   * @param layout
   */
  setLayout(layout: any) {
    if (this.component.metadata) {
      this.component.metadata.layout = layout;
      this.ref.markForCheck();
    }
  }

  /**
   * Toggle the layout by cycling through the layoutOptions array
   */
  toggleLayout() {
    const current = this.component.metadata.layout;
    const index = this.layoutOptions.indexOf(current);
    this.setLayout(this.layoutOptions[((index + 1) % this.layoutOptions.length)]);
  }

  /**
   * Implemented by subclasses to provide configuration options that get added to the footer
   * @returns {Array}
   */
  configuration(): NavActionItem[] {
    return [];
  }

  /**
   * Add this component's configuration options to the application footer bar
   */
  emitShowOptions() {
    if (this.editable) {
      this.footer.setCenterActionItems(this.configuration());
    }
  }

  /**
   * Remove this component's configuration options from the application footer bar
   */
  emitHideOptions() {
    this.footer.clearCenterActionItems();
  }

  /**
   * Update this Component via the API
   * @returns {Observable<ComponentDataInterface>}
   */
  save(): Observable<ComponentDataInterface> {
    if (this.editable && this.component && this.component.id) {
      return this.componentService.update(this.component.id, this.component.asJson());
    } else {
      return Observable.create(o => o.complete());
    }
  }

  /**
   * Superclass method that enables subclasses to query a metadata property while providing a fallback value
   * for the layout option. When implemented by subclasses, this method will return a value from
   * the enum <Component>LayoutOption
   * @returns {any}
   */
  protected getLayout(): any {
    const fallback = this.fallbackLayout();
    if (this.component.metadata && this.component.metadata.hasOwnProperty('layout')) {
      if (this.component.metadata.layout === null) {
        this.component.metadata.layout = fallback;
      }
      return this.component.metadata.layout;
    } else {
      if (!this.component.metadata) {
        this.component.metadata = {};
      }
      this.component.metadata.layout = fallback;
      return this.layout;
    }
  }

  /**
   * Implemented by subclass to return a fallback layout for the component when no layout is currently defined
   * in its metadata.
   * @returns {null}
   */
  protected fallbackLayout(): any {
    return null;
  }
}

/**
 * This class is used as a base for components that have extended configuration options. It allows for footer options
 * to stick even if the footer loses focus. If used properly, the footer options will stick until the input within the
 * footer itself loses focus.
 *
 * Example:
 *
 * `configuration(): NavActionItem[] {
    return [
      new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Padding',
        inputType: 'number',
        inputBinding: this.padding,
        onInputChange: (event: Event) => {
          this.padding = Math.max(1, parseFloat((event.target as HTMLInputElement).value));
          this.ref.detectChanges();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      }),
    ];
  }`
 */
export class ConfigurableUIComponent extends UIComponent {
  canHideFooterConfig = true;

  /**
   * Getter for padding metadata property
   * @returns {number}
   */
  get padding(): number {
    try {
      return this.component.metadata.padding || this.defaultPadding();
    } catch (e) {
      return this.defaultPadding();
    }
  }

  /**
   * Getter for background color metadata property
   * @returns {string}
   */
  get bgColor(): string {
    try {
      return this.component.metadata.bgColor;
    } catch (e) {
      return null;
    }
  }

  /**
   * Getter for text color metadata property
   * @returns {string}
   */
  get paletteColor(): string {
    try {
      return this.component.metadata.paletteColor;
    } catch (e) {
      return null;
    }
  }

  /**
   * Used for onInputFocus binding of NavActionItem
   */
  onInputFocus(event: FocusEvent) {
    this.canHideFooterConfig = false;
    this.didFocusField(event);
  }

  /**
   * Used for onInputClick binding of NavActionItem
   * @param {MouseEvent} event
   */
  onInputClick(event: MouseEvent) {
    this.didFocusField(event);
  }

  /**
   * Used for onInputBlur binding of NavActionItem
   */
  onInputBlur(event: FocusEvent) {
    this.canHideFooterConfig = true;
    this.saveWithThrottle();
    this.didFocusField(event);
    // timeout to prevent hiding the options when the other input is focused.
    setTimeout(() => {
      this.emitHideOptions();
    });
  }

  /**
   * Used when emitting footer items. We only want to hide this components configuration options when both the
   * component on the page and the footer's input field have both lost focus
   */
  emitHideOptions() {
    if (this.canHideFooterConfig && !this.showOptions) {
      this.footer.clearCenterActionItems();
    }
  }

  /**
   * Implemented by subclass to provide a fallback padding value to use
   * @returns {number}
   */
  protected defaultPadding(): number {
    return null;
  }
}

export class ConfigurableUIComponentWithToolbar extends ConfigurableUIComponent implements OnChanges {

  /**
   * The toolbar options fed into XzRichTextDirective rich text editor.
   */
  textEditorToolbarOptions: StringMap = [...XzRichTextDirective.DefaultToolbarOptions];
  /**
   * Hold generated preview of the raw text content stored by the editor. Primary use case is for server
   * side rendering.
   */
  titlePreview: string;
  subtitlePreview: string;
  textPreview: string;

  /**
   * The index to insert the color palette option into the text editor toolbar
   * @returns {number}
   */
  get toolbarColorPaletteIndex(): number {
    return 1;
  }

  /**
   * Populate the color palette toolbar option with the theme color property of the associated site.
   */
  ngOnChanges(changes: SimpleChanges) {
    try {
      this.setColorPaletteInToolbar();
    } finally {
      super.ngOnChanges(changes);
    }
  }

  /**
   * Override for onInputBlur binding of NavActionItem
   */
  onInputBlur(event: FocusEvent) {
    super.onInputBlur(event);
    this.setColorPaletteInToolbar();
  }

  private setColorPaletteInToolbar() {
    const options = [...this.textEditorToolbarOptions as any];
    options[this.toolbarColorPaletteIndex] = [{color: getColorPalette(this.paletteColor)}];
    this.textEditorToolbarOptions = options;
  }

}
