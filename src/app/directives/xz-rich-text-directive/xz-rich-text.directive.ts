import {isPlatformBrowser} from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import {isEqual} from 'lodash';

@Directive({
  selector: '[xzRichTextEnabled]',
  exportAs: 'XzRichTextEditor'
})
export class XzRichTextDirective implements OnInit, OnChanges {
  /**
   * Provide minimal default options for the toolbar
   * @type {[(string | string)[] , (string | string | string)[] , ({list: string} | {list: string})[] , string[]]}
   */
  static readonly DefaultToolbarOptions = [
    ['bold', 'italic'],
    ['blockquote', 'code-block', 'link'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['clean']
  ];
  /**
   * Should the editor be enabled
   * @type {boolean}
   */
  @Input() xzRichTextEnabled = false;
  /**
   * The model that gets bound to the contenteditable content
   */
  @Input() xzRichTextModel: string;
  /**
   * The placeholder to use.
   * @type {string}
   */
  @Input() xzRichTextPlaceholderText = 'Write...';
  /**
   * The options to provide to the editor instance's toolbar
   * @type {StringMap}
   */
  @Input() xzRichTextEditorToolbarOptions = XzRichTextDirective.DefaultToolbarOptions;
  /**
   * The options to provide to the editor's clipboard module
   * @type {((string | string)[] | (string | string | string)[] | ({list: string} | {list: string})[] | string[])[]}
   */
  @Input() xzUsePlainClipboard = false;
  /**
   * The output binding that is triggered when the blur event is emitted from the host element.
   * @type {EventEmitter}
   */
  @Output() xzRichTextModelChange = new EventEmitter();
  /**
   * Get the raw text output. Emitted once on init only.
   * @type {EventEmitter<string>}
   */
  @Output() xzTextPreview = new EventEmitter<string>();
  /**
   * The reference to the quill editor instance
   * @type {any}
   */
  private editorRef: any = null;

  static textContent(delta: any): string {
    let output = '';
    if (delta && delta.ops) {
      delta.ops.forEach(op => output += op.insert);
    }
    return output;
  }

  constructor(private ref: ElementRef, @Inject(PLATFORM_ID) private platformId) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initEditor();
    } else {
      this.emitTextContent();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.xzRichTextEditorToolbarOptions) {
      try {
        const currentValue = Array.from(changes.xzRichTextEditorToolbarOptions.currentValue);
        const previousValue = Array.from(changes.xzRichTextEditorToolbarOptions.previousValue);
        if (currentValue && previousValue && !isEqual(currentValue.sort(), previousValue.sort())) {
          this.ngOnInit();
        }
      } catch (e) {
      }
    }
  }

  plainClipboard() {
    const Quill = require('quill');
    const Clipboard = Quill.import('modules/clipboard');
    const Delta = Quill.import('delta');
    return class extends Clipboard {
      convert(html = null) {
        if (typeof html === 'string') {
          this.container.innerHTML = html;
        }
        const text = this.container.innerText;
        this.container.innerHTML = '';
        return new Delta().insert(text);
      }
    };
  }

  private initEditor() {
    const Quill = require('quill');
    // apply add-in modules
    this.registerAdditionalModules();
    // instantiate editor
    this.editorRef = new Quill(this.ref.nativeElement, {
      modules: {
        toolbar: this.xzRichTextEditorToolbarOptions
      },
      readOnly: !this.xzRichTextEnabled,
      placeholder: this.xzRichTextEnabled ? this.xzRichTextPlaceholderText : null,
      theme: 'bubble'
    });
    // listen for text-change events
    this.editorRef.on('text-change', this.updateModel.bind(this));
    // set the editor's content
    try {
      const contents = JSON.parse(this.xzRichTextModel);
      this.editorRef.setContents(contents);
    } catch (e) {
      if (typeof this.xzRichTextModel === 'string') {
        this.editorRef.setText(this.xzRichTextModel);
      } else {
        console.log('Failed to set contents on editor. Starting with empty value.');
      }
    }
  }

  private updateModel() {
    this.xzRichTextModel = JSON.stringify(this.editorRef.getContents());
    this.xzRichTextModelChange.emit(this.xzRichTextModel);
  }

  private emitTextContent() {
    try {
      const delta = JSON.parse(this.xzRichTextModel);
      this.xzTextPreview.emit(XzRichTextDirective.textContent(delta));
    } catch (e) {
      this.xzTextPreview.emit(null);
    }
  }

  private registerAdditionalModules() {
    if (this.xzUsePlainClipboard) {
      this.registerPlainClipboard();
    }
  }

  private registerPlainClipboard() {
    const Quill = require('quill');
    Quill.register('modules/clipboard', this.plainClipboard(), true);
  }
}
