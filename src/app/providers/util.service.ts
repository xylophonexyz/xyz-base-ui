import {Injectable} from '@angular/core';
import {WindowRefService} from './window-ref.service';

@Injectable()
export class UtilService {

  constructor(private windowRef: WindowRefService) {
  }

  copyToClipboard(content: string) {
    const document = this.windowRef.nativeWindow.document;
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.value = content;
    input.select();
    document.execCommand('copy', false);
    input.remove();
  }
}
