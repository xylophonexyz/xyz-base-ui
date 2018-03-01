import {HttpHeaders} from '@angular/common/http';

export type UploadRequestQueue = (() => Promise<any>)[];

export interface FileUploadOptions {
  url: string;
  headers: HttpHeaders;
  partSize?: number;
  bytesUploaded?: number;
}
