import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockPlainClipboard} from '../../../test/stubs/plain-clipboard.stub.spec';
import {XzRichTextDirective} from './xz-rich-text.directive';
import {QuillService} from '../../providers/quill.service';
import {MockQuillService} from '../../providers/quill.service.spec';

@Component({
  template: `
    <div [(xzRichTextModel)]="model"
         [xzRichTextEnabled]="isEnabled"
         [xzRichTextPlaceholderText]="placeholderText"
         [xzRichTextEditorToolbarOptions]="toolbarOptions"
         (xzRichTextModelChange)="modelDidChange($event)">
    </div>`
})
class TestComponent {
  model = {text: 'baz'};
  isEnabled = true;
  placeholderText = 'Foo';
  toolbarOptions = [];

  modelDidChange() {
  }
}

describe('XzRichTextDirective', () => {

  let fixture;

  beforeEach(async(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [TestComponent, XzRichTextDirective],
      providers: [
        {provide: QuillService, useClass: MockQuillService},
      ]
    }).createComponent(TestComponent);
    fixture.detectChanges();
  }));

  it('should create an instance', () => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    expect(directive).toBeTruthy();
  });

  it('should create a Quill instance on init', () => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    directiveInstance.initEditor();
    expect(directiveInstance.editorRef).toBeDefined();
    expect(directiveInstance.editorRef).not.toBeNull();
  });

  it('should emit a text preview of the delta when the platform is server', async(() => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    directiveInstance.xzRichTextModel = JSON.stringify({ops: [{insert: 'Foo'}, {insert: 'Bar'}]});
    directiveInstance.xzTextPreview.subscribe(data => {
      expect(data).toEqual('FooBar');
    });
    directiveInstance.platformId = 'SERVER';
    fixture.detectChanges();
    directiveInstance.ngOnInit();
  }));

  it('should emit a text preview of null if there is an error', async(() => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    directiveInstance.xzRichTextModel = {foo: 'bar'};
    directiveInstance.xzTextPreview.subscribe(data => {
      expect(data).toEqual(null);
    });
    directiveInstance.platformId = 'SERVER';
    fixture.detectChanges();
    directiveInstance.ngOnInit();
  }));

  it('should emit model changes when the quill editor executes a text-change event', async(() => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    spyOn(directiveInstance, 'updateModel').and.callThrough();
    directiveInstance.initEditor();
    directiveInstance.editorRef.setText('Bar Baz');
    directiveInstance.editorRef.blur();
    fixture.detectChanges();
    expect(directiveInstance.updateModel).toHaveBeenCalled();
  }));

  it('should initialize the editor with the model value when it is text', async(() => {
    const component = fixture.componentInstance;
    component.model = 'foobarbazqux';
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    directiveInstance.initEditor();
    fixture.detectChanges();
    expect(directiveInstance.editorRef.getText()).toEqual('foobarbazqux\n');
  }));

  it('should catch errors when initializing the editor with the model value', async(() => {
    const component = fixture.componentInstance;
    component.model = null;
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    directiveInstance.initEditor();
    fixture.detectChanges();
    expect(directiveInstance.editorRef.getText()).toEqual('\n');
  }));

  it('should update the toolbar options on change', () => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    directiveInstance.initEditor();
    spyOn(directiveInstance, 'ngOnInit');
    const component = fixture.componentInstance;
    component.toolbarOptions = XzRichTextDirective.DefaultToolbarOptions;
    fixture.detectChanges();
    expect(directiveInstance.ngOnInit).toHaveBeenCalled();
  });

  it('should support using a plain clipboard to copy/paste content into editor', () => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    const Quill = require('quill');
    spyOn(directiveInstance, 'plainClipboard').and.returnValue(MockPlainClipboard);
    spyOn(Quill, 'register').and.callFake((type, mockedClass) => {
      const classInstance = new mockedClass();
      expect(classInstance.convert).toBeDefined();
    });
    directiveInstance.xzUsePlainClipboard = true;
    directiveInstance.initEditor();
    fixture.detectChanges();
    expect(Quill.register).toHaveBeenCalled();
  });

  it('should provide a method to return a PlainClipboard', () => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    const clipboard = directiveInstance.plainClipboard();
    expect(clipboard).toBeDefined();
  });

  it('should provide a PlainClipboard with a convert method', () => {
    const directive = fixture.debugElement.query(By.directive(XzRichTextDirective));
    const directiveInstance = directive.injector.get(XzRichTextDirective);
    const clipboard = directiveInstance.plainClipboard();
    const Quill = require('quill');
    const options = {matchers: [], matchVisual: false};
    const instance = new clipboard(new Quill(document.createElement('div')), options);
    instance.container = document.createElement('div');
    expect(instance.convert()).toBeDefined();
    expect(instance.convert('<h1></h1>')).toBeDefined();
  });

});
