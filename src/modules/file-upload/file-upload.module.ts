import {ModuleWithProviders, NgModule} from '@angular/core';
import {FileUploadConfig} from './file-upload-config';
import {FileUploadService} from './file-upload.service';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule],
  declarations: [],
  providers: [
    FileUploadConfig,
    FileUploadService
  ]
})
export class FileUploadModule {
  static forRoot(config: FileUploadConfig): ModuleWithProviders {
    return {
      ngModule: FileUploadModule,
      providers: [
        {provide: FileUploadConfig, useValue: config}
      ]
    };
  }
}
