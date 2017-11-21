import {Injectable} from '@angular/core';

@Injectable()
export class FileUploadConfig {
  /**
   * Enable resumable uploads. If set to false, the upload will be attempted in a single request
   * @type {boolean}
   */
  resumableUploadEnabled = true;
  /**
   * Default chunk size. The given file will be divided into "parts" of this size up to the last "part", which may be
   * smaller.
   * @type {number}
   */
  defaultPartSize: number = 8 * 1000000; // 8MB
  /**
   * Specify the param name to use when sending resumable upload metadata to the backend server. This field specifies
   * the param name given to the total size of the file being uploaded.
   * @type {string}
   */
  totalSizeParamName = '_total_size';
  /**
   * Specify the param name to use when sending resumable upload metadata to the backend server. This field specifies
   * the param name given to the index of the "part" being uploaded, zero-indexed.
   * @type {string}
   */
  partNumberParamName = '_part_number';
  /**
   * Specify the param name to use when sending resumable upload metadata to the backend server. This field specifies
   * the param name given to the default "part" size.
   * @type {string}
   */
  partSizeParamName = '_part_size';
  /**
   * Specify the param name to use when sending resumable upload metadata to the backend server. This field specifies
   * the param name given to the size of the current "part" being uploaded.
   * @type {string}
   */
  currentPartSizeParamName = '_current_part_size';
  /**
   * Specify the param name to use when sending resumable upload metadata to the backend server. This field specifies
   * the param name given to the file sent in the body of the multipart/form-data request
   * @type {string}
   */
  fileParamName = 'file';
  /**
   * Specify the param name to use when sending resumable upload metadata to the backend server. This field specifies
   * the param name given to the filename property sent in the body of the multipart/form-data request
   * @type {string}
   */
  fileNameParamName = 'filename';
}
