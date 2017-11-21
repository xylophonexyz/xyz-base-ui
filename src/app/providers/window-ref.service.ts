import {Injectable} from '@angular/core';

const getWindow = (): Window => {
  return window;
};

@Injectable()
export class WindowRefService {
  get nativeWindow(): Window {
    return getWindow();
  }
}
