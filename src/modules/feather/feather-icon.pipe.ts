import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import * as feather from 'feather-icons';

@Pipe({
  name: 'featherIcon'
})
export class FeatherIconPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value: any, args?: any): SafeHtml {
    try {
      return this.sanitizer.bypassSecurityTrustHtml(feather.toSvg(value));
    } catch (e) {
      return '';
    }
  }

}
