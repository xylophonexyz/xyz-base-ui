import {Injectable} from '@angular/core';
import * as localforage from 'localforage';

@Injectable()
export class StorageService {

  get(key: string): Promise<any> {
    return localforage.getItem(key);
  }

  set(key: string, value: any): Promise<any> {
    return localforage.setItem(key, value);
  }

  remove(key: string): Promise<any> {
    return localforage.removeItem(key);
  }

}
