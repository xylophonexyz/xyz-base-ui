import {ModuleWithProviders, NgModule} from '@angular/core';
import {XzPopoverConfig} from './popover-config';
import {PopoverDirective, PopoverPanelComponent} from './popover.directive';

@NgModule({
  declarations: [PopoverDirective, PopoverPanelComponent],
  providers: [XzPopoverConfig],
  exports: [PopoverDirective],
  entryComponents: [PopoverPanelComponent]
})
export class XzPopoverModule {
  static forRoot(): ModuleWithProviders {
    return {ngModule: XzPopoverModule, providers: [XzPopoverConfig]};
  }
}
