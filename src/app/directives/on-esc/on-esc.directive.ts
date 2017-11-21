import {Directive, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[xzOnEsc]'
})
export class OnEscDirective {

  @Output() onKeyPressed: EventEmitter<any> = new EventEmitter();

  @HostListener('window:keyup', ['$event'])
  keyup(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onKeyPressed.emit();
    }
  }
}
