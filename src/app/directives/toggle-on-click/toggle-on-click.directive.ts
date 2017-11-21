import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';

@Directive({
  selector: '[xzToggleOnClick]'
})
export class ToggleOnClickDirective {

  @Input() toggle = false;
  @Output() toggleChange = new EventEmitter();

  @HostListener('click')
  doToggle() {
    this.toggle = !this.toggle;
    this.toggleChange.emit(this.toggle);
  }
}
