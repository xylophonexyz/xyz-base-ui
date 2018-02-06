import {Injectable} from '@angular/core';

@Injectable()
export class QuillService {

  getInstance(root: Element, options) {
    const Quill = require('quill');
    return new Quill(root, options);
  }

  getStatic() {
    return require('quill');
  }

}
