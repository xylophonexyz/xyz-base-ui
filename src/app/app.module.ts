import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Http, HttpModule} from '@angular/http';
import {BrowserModule, Meta, Title} from '@angular/platform-browser';
import {MomentModule} from 'angular2-moment';
import {FeatherModule} from '../modules/feather/feather.module';
import {FileUploadModule} from '../modules/file-upload/file-upload.module';

import {AppRoutingModule} from './app-routing.module';
import {AdminComponent} from './components/admin/admin.component';
import {AppComponent} from './components/app.component';
import {UIComponentCollectionComponent} from './components/component-collection/component-collection.component';
import {
  ConfigurableUIComponent, ConfigurableUIComponentWithToolbar,
  UIComponent
} from './components/component/component.component';
import {UIEmbedComponent} from './components/embed-component/embed.component';
import {FooterComponent} from './components/footer/footer.component';
import {UIFreeFormHtmlComponent} from './components/free-form-html-component/free-form-html-component.component';
import {UIImageComponent} from './components/image-component/image-component.component';
import {LoginComponent} from './components/login/login.component';
import {UIMediaComponent} from './components/media-component/media-component';
import {ModalComponent} from './components/modal/modal.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {PageUIComponentCollectionAdditionComponent} from './components/page-component-addition/page-component-addition.component';
import {PageErrorComponent} from './components/page-error/page-error.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {PageUnauthorizedComponent} from './components/page-unauthorized/page-unauthorized.component';
import {PageComponent} from './components/page/page.component';
import {PlaceholderComponent} from './components/placeholder/placeholder.component';
import {UISectionComponent} from './components/section-component/section-component.component';
import {SettingsComponent} from './components/settings/settings.component';
import {SiteAdminComponent} from './components/site-admin/site-admin.component';
import {SiteAdvancedSettingsComponent} from './components/site-advanced-settings-component/site-advanced-settings.component';
import {SiteNavigationComponent} from './components/site-navigation/site-navigation.component';
import {SitePagesComponent} from './components/site-pages/site-pages.component';
import {SiteSettingsComponent} from './components/site-settings/site-settings.component';
import {SiteThemeComponent} from './components/site-theme/site-theme.component';
import {SitesComponent} from './components/sites/sites.component';
import {UISpacerComponent} from './components/spacer-component/spacer-component.component';
import {SpinnerComponent} from './components/spinner/spinner.component';
import {SplashScreenComponent} from './components/splash-screen/splash-screen.component';
import {UITextComponent} from './components/text-component/text-component.component';
import {TokenCallbackComponent} from './components/token-callback/token-callback.component';
import {ContentEditableModelDirective} from './directives/content-editable-model/content-editable-model.directive';
import {OnEscDirective} from './directives/on-esc/on-esc.directive';
import {XzPopoverModule} from './directives/popover/popover.module';
import {ToggleOnClickDirective} from './directives/toggle-on-click/toggle-on-click.directive';
import {XzRichTextDirective} from './directives/xz-rich-text-directive/xz-rich-text.directive';
import {AuthGuard} from './guards/auth.guard';
import {PageGuard} from './guards/page.guard';
import {APPLICATION_NAME, ORIGIN_URL} from './index';
import {ApiService} from './providers/api.service';
import {AuthService} from './providers/auth.service';
import {AuthenticatedHttpService} from './providers/authenticated-http.service';
import {ComponentCollectionService} from './providers/component-collection.service';
import {ComponentService} from './providers/component.service';
import {FooterDelegateService} from './providers/footer-delegate.service';
import {LoginModalDelegateService} from './providers/login-modal-delegate.service';
import {LoginService} from './providers/login.service';
import {MessageChannelDelegateService} from './providers/message-channel.service';
import {NavbarDelegateService} from './providers/navbar-delegate.service';
import {PagesService} from './providers/pages.service';
import {SitesService} from './providers/sites.service';
import {StorageService} from './providers/storage.service';
import {UserService} from './providers/user.service';
import {WindowRefService} from './providers/window-ref.service';
import {UtilService} from './providers/util.service';

export function getBrowserOriginFactory() {
  return () => null;
}

export function getAppTitleFactory() {
  return () => 'Merla';
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    ModalComponent,
    OnEscDirective,
    SplashScreenComponent,
    PageUnauthorizedComponent,
    TokenCallbackComponent,
    AdminComponent,
    ToggleOnClickDirective,
    SitesComponent,
    SiteSettingsComponent,
    PageNotFoundComponent,
    PlaceholderComponent,
    PageComponent,
    FooterComponent,
    PageUIComponentCollectionAdditionComponent,
    UIComponent,
    ConfigurableUIComponent,
    ConfigurableUIComponentWithToolbar,
    UIMediaComponent,
    UIComponentCollectionComponent,
    UISpacerComponent,
    UITextComponent,
    UISectionComponent,
    UIFreeFormHtmlComponent,
    UIImageComponent,
    UIEmbedComponent,
    ContentEditableModelDirective,
    SpinnerComponent,
    SiteAdminComponent,
    SitePagesComponent,
    SettingsComponent,
    SiteNavigationComponent,
    SiteThemeComponent,
    XzRichTextDirective,
    PageErrorComponent,
    SiteAdvancedSettingsComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule.withServerTransition({appId: 'xyz-ui'}),
    FormsModule,
    HttpModule,
    AppRoutingModule,
    FileUploadModule,
    MomentModule,
    XzPopoverModule,
    FeatherModule
  ],
  providers: [
    {provide: Http, useClass: AuthenticatedHttpService},
    Title,
    Meta,
    StorageService,
    LoginModalDelegateService,
    NavbarDelegateService,
    FooterDelegateService,
    LoginService,
    ApiService,
    AuthService,
    AuthGuard,
    PageGuard,
    SitesService,
    PagesService,
    ComponentService,
    WindowRefService,
    MessageChannelDelegateService,
    ComponentCollectionService,
    UserService,
    UtilService,
    {provide: ORIGIN_URL, useFactory: () => getBrowserOriginFactory()},
    {provide: APPLICATION_NAME, useFactory: () => getAppTitleFactory()},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
