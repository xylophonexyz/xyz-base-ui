import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  Renderer2,
  SecurityContext,
  SimpleChanges
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ContentEditableBindingStrategy} from '../../index';

@Directive({
  selector: '[xzContentEditableModel]'
})
export class ContentEditableModelDirective implements OnChanges {

  /**
   * Set the strategy for binding the content editable element's content to the given model. When strategy is set to
   * `innerText`, only the text content is bound to the model and emitted. When set to `innerHTML`, escaped HTML
   * content is bound to the model and emitted.
   * @type {string}
   */
  @Input() bindingStrategy: ContentEditableBindingStrategy = ContentEditableBindingStrategy.HtmlContent;

  /**
   * The model that gets bound to the contenteditable content
   */
  @Input() xzContentEditableModel: string;

  /**
   * The output binding that is triggered when the blur event is emitted from the host element.
   * @type {EventEmitter}
   */
  @Output() xzContentEditableModelChange = new EventEmitter();

  /**
   * Store ref to the last model change
   */
  private lastViewModel: any;

  constructor(private ref: ElementRef,
              private renderer: Renderer2,
              private sanitizer: DomSanitizer) {
  }

  /**
   * When the blur event is emitted, trigger the output binding with the result of the contenteditable element's content
   * by the provided or default binding strategy. Additionally, the view is refreshed to reflect the content bound to
   * the output.
   */
  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent) {
    this.updateModel();
    event.stopPropagation();
  }

  /**
   * Update the view with any changes to the model.
   * @param {SimpleChanges} changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.xzContentEditableModel.isFirstChange()) {
      this.lastViewModel = this.xzContentEditableModel;
      this.refreshView();
    }
  }

  /**
   * Refresh the contents of the ContentEditable element.
   */
  private refreshView() {
    this.renderer.setProperty(
      this.ref.nativeElement,
      this.bindingStrategy,
      this.xzContentEditableModel
    );
  }

  /**
   * Commit changes to the content editable model passed in as an Input parameter, and emit the new value.
   */
  private updateModel() {
    const value = this.ref.nativeElement[this.bindingStrategy];
    this.lastViewModel = this.xzContentEditableModel;
    if (this.bindingStrategy === ContentEditableBindingStrategy.HtmlContent) {
      this.xzContentEditableModel = this.sanitizer.sanitize(SecurityContext.HTML, value);
    } else {
      this.xzContentEditableModel = value;
    }
    this.xzContentEditableModelChange.emit(this.xzContentEditableModel);
    setTimeout(() => {
      this.refreshView();
    });
  }
}
