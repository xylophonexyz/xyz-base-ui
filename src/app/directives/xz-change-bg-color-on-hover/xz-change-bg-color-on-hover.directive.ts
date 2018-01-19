import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
  selector: '[xzChangeBgColorOnHover]'
})
export class XzChangeBgColorOnHoverDirective {

  constructor(private elementRef: ElementRef) { }

  @Input() hoverOnColor = '';
  @Input() hoverOffColor = '';
  @Input() hoverEnabled = true;

  @HostListener('mouseover')
  updateHoverOnColor() {
    if (this.hoverEnabled) {
      this.elementRef.nativeElement.style.backgroundColor = this.hoverOnColor;
    }
  }

  @HostListener('mouseleave')
  updateHoverOffColor() {
    if (this.hoverEnabled) {
      this.elementRef.nativeElement.style.backgroundColor = this.hoverOffColor;
    }
  }



}
