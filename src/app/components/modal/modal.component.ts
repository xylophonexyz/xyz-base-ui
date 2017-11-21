import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {

  @Input() show: boolean;
  @Output() onHide: EventEmitter<any> = new EventEmitter();

  emitClose() {
    this.onHide.emit(null);
  }

}
