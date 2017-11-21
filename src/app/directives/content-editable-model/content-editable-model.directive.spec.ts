import {Component} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ContentEditableBindingStrategy} from '../../index';
import {ContentEditableModelDirective} from './content-editable-model.directive';

describe('ContentEditableModelDirective', () => {

  let fixture;

  beforeEach(async(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [TestComponent, ContentEditableModelDirective],
    }).createComponent(TestComponent);
    fixture.detectChanges();
  }));

  it('should create an instance', () => {
    const directive = fixture.debugElement.query(By.directive(ContentEditableModelDirective));
    expect(directive).toBeTruthy();
  });

  it('should emit a change event on blur', async(() => {
    const component = fixture.componentInstance;
    spyOn(component, 'modelDidChange');
    const directive = fixture.debugElement.query(By.directive(ContentEditableModelDirective));
    directive.triggerEventHandler('blur', {});
    setTimeout(() => {
      expect(component.modelDidChange).toHaveBeenCalled();
    });
  }));

  it('should refresh the model on blur', async(() => {
    const component = fixture.componentInstance;
    const directive = fixture.debugElement.query(By.directive(ContentEditableModelDirective));
    directive.nativeElement.innerText = 'Foo!';
    directive.triggerEventHandler('blur', {});
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.model.text).toEqual('Foo!');
    });
  }));

  it('should enforce a binding strategy of innerText', async(() => {
    const component = fixture.componentInstance;
    const directive = fixture.debugElement.query(By.directive(ContentEditableModelDirective));
    directive.injector.get(ContentEditableModelDirective).bindingStrategy = ContentEditableBindingStrategy.TextContent;
    directive.nativeElement.innerHTML = '<div><h1>Foo!</h1></div>';
    directive.triggerEventHandler('blur', {});
    fixture.detectChanges();
    setTimeout(() => {
      expect(component.model.text).toEqual('Foo!');
    });
  }));

  it('should enforce a binding strategy of innerHTML', async(() => {
    const component = fixture.componentInstance;
    const directive = fixture.debugElement.query(By.directive(ContentEditableModelDirective));
    directive.injector.get(ContentEditableModelDirective).bindingStrategy = ContentEditableBindingStrategy.HtmlContent;
    directive.nativeElement.innerHTML = '<div><h1>Foo!</h1></div>';
    directive.triggerEventHandler('blur', {});
    setTimeout(() => {
      expect(component.model.text).toEqual('<div><h1>Foo!</h1></div>');
    });
  }));
});

@Component({
  template: `
    <div [(xzContentEditableModel)]="model.text" 
         (xzContentEditableModelChange)="modelDidChange($event)"
         contenteditable="true"></div>`
})
class TestComponent {
  model = {text: ''};

  modelDidChange() {
  }
}
