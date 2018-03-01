import {ModuleWithProviders, NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {FileUploadConfig} from './file-upload-config';
import {FileUploadService} from './file-upload.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClientModule} from '@angular/common/http';

export const fileUploadStub = () => {
  return {
    upload: () => {
      return new Promise(resolve => resolve());
    }
  };
};

@NgModule({
  imports: [HttpClientTestingModule, HttpClientModule],
  declarations: [],
  providers: [
    FileUploadConfig,
    {provide: FileUploadService, useFactory: fileUploadStub}
  ]
})
export class FileUploadTestingModule {
  static forRoot(config: FileUploadConfig): ModuleWithProviders {
    return {
      ngModule: FileUploadTestingModule,
      providers: [
        {provide: FileUploadConfig, useValue: config},
      ]
    };
  }
}
