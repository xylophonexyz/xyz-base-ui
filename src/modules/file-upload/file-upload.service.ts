import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {FileUploadConfig} from './file-upload-config';
import {FileUploadOptions, UploadRequestQueue} from './index';

@Injectable()
export class FileUploadService {

  constructor(private config: FileUploadConfig, private http: Http) {
  }

  processUploadRequestQueue(queue: UploadRequestQueue) {
    return new Promise((resolve, reject) => {
      const uploadFn = queue.shift();
      uploadFn().then(() => {
        if (queue.length) {
          this.processUploadRequestQueue(queue).then(resolve, reject);
        } else {
          resolve();
        }
      }).catch(reject);
    });
  }

  sliceFile(file: File, byteOffset: number = 0, partSize: number = this.config.defaultPartSize): Blob {
    return file.slice(byteOffset, byteOffset + partSize);
  }

  upload(file: File, options: FileUploadOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadRequestQueue: UploadRequestQueue = [];
      if (this.config.resumableUploadEnabled) {
        options.partSize = options.partSize || this.config.defaultPartSize;

        let bytesUploaded = options.bytesUploaded || 0;
        while (bytesUploaded < file.size) {
          ((size) => {
            uploadRequestQueue.push(() => {
              return this.uploadPart(file, size, options);
            });
          })(bytesUploaded);
          bytesUploaded += options.partSize;
        }

        this.processUploadRequestQueue(uploadRequestQueue).then(resolve, reject);

      } else {
        options.partSize = file.size;
        return this.uploadPart(file, 0, options);
      }
    });
  }

  uploadPart(file: File, byteOffset: number, options: FileUploadOptions): Promise<any> {
    return new Promise((resolve, reject) => {

      const formData = new FormData();
      const partSize = options.partSize || this.config.defaultPartSize;
      const slice = this.sliceFile(file, byteOffset, partSize);

      formData.append(this.config.fileParamName, this.sliceFile(file, byteOffset, partSize));
      formData.append(this.config.fileNameParamName, file.name);
      formData.append(this.config.currentPartSizeParamName, slice.size.toString());
      formData.append(this.config.partSizeParamName, partSize.toString());
      formData.append(this.config.partNumberParamName, Math.ceil(byteOffset / partSize).toString());
      formData.append(this.config.totalSizeParamName, file.size.toString());

      this.http.post(options.url, formData, {headers: options.headers}).subscribe((res: Response) => {
        resolve(res);
      }, (err) => {
        reject(err);
      });
    });
  }
}
