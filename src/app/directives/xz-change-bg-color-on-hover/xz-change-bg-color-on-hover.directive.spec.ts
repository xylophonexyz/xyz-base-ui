import {XzChangeBgColorOnHoverDirective} from './xz-change-bg-color-on-hover.directive';
import {Component, ElementRef} from '@angular/core';
import {async, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

@Component({
  template: `
    <div xzChangeBgColorOnHover="" [hoverOffColor]="'white'" [hoverOnColor]="'black'"></div>`
})
class TestComponent {
}

describe('XzChangeBgColorOnHoverDirective', () => {

  let fixture;

  beforeEach(async(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [TestComponent, XzChangeBgColorOnHoverDirective],
    }).createComponent(TestComponent);
    fixture.detectChanges();
  }));

  it('should create an instance', () => {
    const directive = fixture.debugElement.query(By.directive(XzChangeBgColorOnHoverDirective));
    expect(directive).toBeTruthy();
  });

  it('should update the elements background color when hovered over', async(() => {
    const directive = fixture.debugElement.query(By.directive(XzChangeBgColorOnHoverDirective));
    const directiveInstance = directive.injector.get(XzChangeBgColorOnHoverDirective);
    const elementRef = directive.injector.get(ElementRef);
    expect(elementRef.nativeElement.style.backgroundColor).toEqual('');
    directiveInstance.updateHoverOnColor();
    fixture.detectChanges();
    expect(elementRef.nativeElement.style.backgroundColor).toEqual('black');
    directiveInstance.updateHoverOffColor();
    fixture.detectChanges();
    expect(elementRef.nativeElement.style.backgroundColor).toEqual('white');
  }));

  it('should not update the background color when hoverEnabled is false', async(() => {
    const directive = fixture.debugElement.query(By.directive(XzChangeBgColorOnHoverDirective));
    const directiveInstance = directive.injector.get(XzChangeBgColorOnHoverDirective);
    const elementRef = directive.injector.get(ElementRef);
    directiveInstance.hoverEnabled = false;
    expect(elementRef.nativeElement.style.backgroundColor).toEqual('');
    directiveInstance.updateHoverOnColor();
    fixture.detectChanges();
    expect(elementRef.nativeElement.style.backgroundColor).toEqual('');
    directiveInstance.hoverEnabled = true;
    directiveInstance.updateHoverOffColor();
    fixture.detectChanges();
    expect(elementRef.nativeElement.style.backgroundColor).toEqual('white');
  }));
});
