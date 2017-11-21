import {SafeHtml, SafeStyle} from '@angular/platform-browser';

export const mockDomSanitizer = {
  sanitize: content => {
    return content;
  },
  bypassSecurityTrustResourceUrl: content => {
    return content as SafeHtml;
  },
  bypassSecurityTrustStyle: content => {
    return content as SafeStyle;
  }
};
