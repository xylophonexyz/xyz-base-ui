import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FeatherIconComponent} from './feather-icon/feather-icon.component';
import {FeatherIconPipe} from './feather-icon.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FeatherIconPipe,
    FeatherIconComponent,
  ],
  exports: [
    FeatherIconPipe,
    FeatherIconComponent
  ]
})
export class FeatherModule {
}
