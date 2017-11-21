import {NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {getServerOriginFactory} from '../main.server';

import {AppModule} from './app.module';
import {AppComponent} from './components/app.component';
import {ORIGIN_URL} from './index';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {provide: ORIGIN_URL, useFactory: () => getServerOriginFactory()},
  ]
})
export class AppServerModule {
}
