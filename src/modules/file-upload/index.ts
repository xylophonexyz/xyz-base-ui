import {Headers} from '@angular/http';

export type UploadRequestQueue = (() => Promise<any>)[];

export interface FileUploadOptions {
  url: string;
  headers: Headers;
  partSize?: number;
  bytesUploaded?: number;
}
