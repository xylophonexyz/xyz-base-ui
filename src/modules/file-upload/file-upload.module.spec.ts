import {getTestBed, inject, TestBed} from '@angular/core/testing';
import {FileUploadConfig} from './file-upload-config';
import {FileUploadTestingModule} from './file-upload-testing.module';
import {FileUploadModule} from './file-upload.module';
import {FileUploadService} from './file-upload.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';

describe('FileUploadModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileUploadModule, HttpClientTestingModule, HttpClientModule]
    });
  });

  it('should import the module with no configuration', inject([FileUploadService], (service: FileUploadService) => {
    expect(service).toBeTruthy();
  }));
});

describe('FileUploadTestingModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FileUploadTestingModule.forRoot({
          resumableUploadEnabled: false,
          defaultPartSize: 1000,
          totalSizeParamName: 'totalSize',
          partNumberParamName: 'partNum',
          partSizeParamName: 'def_size',
          currentPartSizeParamName: 'curr',
          fileParamName: 'FILE_UPLOAD',
          fileNameParamName: 'filename'
        })
      ]
    });
  });

  it('should provide a forRoot() method with allowed configuration', () => {
    expect(FileUploadModule.forRoot).toBeDefined();
    expect(FileUploadModule.forRoot(null)).toBeDefined();
  });

  it('should import the module with given configuration', inject([FileUploadService], (service: FileUploadService) => {
    const config = getTestBed().get(FileUploadConfig);
    expect(service).toBeTruthy();
    expect(config.resumableUploadEnabled).toEqual(false);
    expect(config.defaultPartSize).toEqual(1000);
    expect(config.totalSizeParamName).toEqual('totalSize');
    expect(config.partNumberParamName).toEqual('partNum');
    expect(config.partSizeParamName).toEqual('def_size');
    expect(config.currentPartSizeParamName).toEqual('curr');
    expect(config.fileParamName).toEqual('FILE_UPLOAD');
    expect(config.fileNameParamName).toEqual('filename');
  }));
});

describe('FileUploadModule forRoot()', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FileUploadModule.forRoot({
          resumableUploadEnabled: false,
          defaultPartSize: 1000,
          totalSizeParamName: 'totalSize',
          partNumberParamName: 'partNum',
          partSizeParamName: 'def_size',
          currentPartSizeParamName: 'curr',
          fileParamName: 'FILE_UPLOAD',
          fileNameParamName: 'filename'
        }),
        HttpClientTestingModule,
        HttpClientModule
      ]
    });
  });

  it('should provide a forRoot() method with allowed configuration', () => {
    expect(FileUploadModule.forRoot).toBeDefined();
    expect(FileUploadModule.forRoot(null)).toBeDefined();
  });

  it('should import the module with given configuration', inject([FileUploadService], (service: FileUploadService) => {
    const config = getTestBed().get(FileUploadConfig);
    expect(service).toBeTruthy();
    expect(config.resumableUploadEnabled).toEqual(false);
    expect(config.defaultPartSize).toEqual(1000);
    expect(config.totalSizeParamName).toEqual('totalSize');
    expect(config.partNumberParamName).toEqual('partNum');
    expect(config.partSizeParamName).toEqual('def_size');
    expect(config.currentPartSizeParamName).toEqual('curr');
    expect(config.fileParamName).toEqual('FILE_UPLOAD');
    expect(config.fileNameParamName).toEqual('filename');
  }));
});
