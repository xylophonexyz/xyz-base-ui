import {ModuleWithProviders, NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {FileUploadConfig} from './file-upload-config';
import {FileUploadService} from './file-upload.service';

@NgModule({
  imports: [HttpModule],
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
