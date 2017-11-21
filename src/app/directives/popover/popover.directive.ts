import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {PopupService} from '../../util/popup.service';
import {positionElements} from '../../util/positioning';
import {listenToTriggers} from '../../util/triggers';
import {XzPopoverConfig} from './popover-config';

let nextId = 0;

@Component({
  selector: 'app-popover-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="popover-arrow"></div>
    <ng-content></ng-content>
  `
})
export class PopoverPanelComponent {
  @Input() placement: 'top' | 'bottom' = 'bottom';
  @Input() id: string;
  @HostBinding('attr.role') popoverRole = 'tooltip';

  @HostBinding('class')
  get popoverClass() {
    return `popover popover-${this.placement}`;
  }

  @HostBinding('id')
  get popoverId() {
    return this.id;
  }
}

@Directive({
  selector: '[xzPopover]',
  exportAs: 'xzPopover',
})
export class PopoverDirective implements OnInit, OnDestroy {
  /**
   * Content to be displayed as popover.
   */
  @Input() xzPopover: string | TemplateRef<any>;
  /**
   * Placement of a popover. Accepts: "top", "bottom"
   */
  @Input() placement: 'top' | 'bottom';
  /**
   * Specifies events that should trigger. Supports a space separated list of event names.
   */
  @Input() triggers: string;
  /**
   * Specifies if the popover should be opened at all.
   */
  @Input() disabled: boolean;
  /**
   * A selector specifying the element the popover should be appended to.
   * Currently only supports "body".
   */
  @Input() container: string;
  /**
   * Emits an event when the popover is shown
   */
  @Output() shown = new EventEmitter();
  /**
   * Emits an event when the popover is hidden
   */
  @Output() hidden = new EventEmitter();

  private _popupService: PopupService<PopoverPanelComponent>;
  private _xzPopoverWindowId = `xz-popover-${nextId++}`;
  private _panelRef: ComponentRef<PopoverPanelComponent>;
  private _zoneSubscription: any;
  private _unregisterListenersFn;
  private _outsideClickIsStable;

  constructor(private _elementRef: ElementRef,
              private _renderer: Renderer2,
              private zone: NgZone,
              injector: Injector,
              componentFactoryResolver: ComponentFactoryResolver,
              viewContainerRef: ViewContainerRef,
              config: XzPopoverConfig) {
    this._popupService = new PopupService<PopoverPanelComponent>(
      PopoverPanelComponent, injector, viewContainerRef, _renderer, componentFactoryResolver
    );
    this.triggers = config.triggers;
    this.placement = config.placement;
    this.container = config.container;

    /**
     * upon change detection, reposition the popover element relative to the host
     * @type {any}
     * @private
     */
    this._zoneSubscription = this.zone.onStable.subscribe(() => {
      if (this._panelRef) {
        positionElements(
          this._elementRef.nativeElement,
          this._panelRef.location.nativeElement,
          this._panelRef.location.nativeElement.querySelector('.popover-arrow'),
          this.placement,
          this.container === 'body'
        );
      }
    });
  }

  /**
   * watch for changes in window size and run a noop. HostListener binding will cause a change detection to run
   * which will hook into ngZone.onStable
   * @experimental
   */
  @HostListener('window:resize')
  windowDidResize() {
  }

  /**
   * Toggles an element’s popover.
   */
  toggle() {
    if (this._panelRef) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Opens an element’s popover.
   * The context is an optional value to be injected into the popover template when it is created.
   */
  open(context?: any) {
    if (!this._panelRef && !this.disabled) {
      this._panelRef = this._popupService.open(this.xzPopover, context);
      this._panelRef.instance.placement = this.placement;
      this._panelRef.instance.id = this._xzPopoverWindowId;

      this._renderer.setAttribute(this._elementRef.nativeElement, 'aria-describedby', this._xzPopoverWindowId);

      if (this.container === 'body') {
        window.document.querySelector(this.container).appendChild(this._panelRef.location.nativeElement);
      }
      // we need to manually invoke change detection since events registered via
      // Renderer::listen() are not picked up by change detection with the OnPush strategy
      this._panelRef.changeDetectorRef.markForCheck();
      this.shown.emit();

      // avoid outside trigger elements re-toggling on outsideClick if outsideClick is provided as a trigger
      this._outsideClickIsStable = false;
      setTimeout(() => {
        this._outsideClickIsStable = true;
      });
    }
  }

  /**
   * Closes an element’s popover.
   */
  close() {
    if (this._panelRef) {
      this._renderer.setAttribute(this._elementRef.nativeElement, 'aria-describedby', null);
      this._popupService.close();
      this._panelRef = null;
      this.hidden.emit();
    }
  }

  /**
   * Returns whether or not the popover is currently being shown
   */
  isOpen(): boolean {
    return this._panelRef != null;
  }

  /**
   * bind all of the possible "triggers" to the open, close, and toggle functions.
   */
  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(
      this._renderer,
      this._elementRef.nativeElement,
      this.triggers,
      this.open.bind(this),
      this.close.bind(this),
      this.toggle.bind(this)
    );
  }

  /**
   * clean up, unsubscribe from any event listeners, and close the popover instance
   */
  ngOnDestroy() {
    this.close();
    this._unregisterListenersFn();
    this._zoneSubscription.unsubscribe();
  }

  /**
   * allow for an outside click to close the popover
   * @param event
   */
  @HostListener('document:click', ['$event'])
  private didDoOutsideClick(event: MouseEvent) {
    if (this._outsideClickIsStable) {
      // popover is open
      if (this.isOpen()) {
        // not clicked on toggle target element
        if (!this._elementRef.nativeElement.contains(event.target)) {
          // clicked outside popover window
          if (!this._panelRef.location.nativeElement.contains(event.target)) {
            this.close();
          }
        }
      }
    }
  }
}
