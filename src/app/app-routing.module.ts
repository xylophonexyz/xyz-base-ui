import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminComponent} from './components/admin/admin.component';
import {PageErrorComponent} from './components/page-error/page-error.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {PageUnauthorizedComponent} from './components/page-unauthorized/page-unauthorized.component';
import {PageComponent} from './components/page/page.component';
import {SettingsComponent} from './components/settings/settings.component';
import {SiteAdminComponent} from './components/site-admin/site-admin.component';
import {SiteAdvancedSettingsComponent} from './components/site-advanced-settings/site-advanced-settings.component';
import {SiteNavigationComponent} from './components/site-navigation/site-navigation.component';
import {SitePagesComponent} from './components/site-pages/site-pages.component';
import {SiteSettingsComponent} from './components/site-settings/site-settings.component';
import {SiteThemeComponent} from './components/site-theme/site-theme.component';
import {SitesComponent} from './components/sites/sites.component';
import {SplashScreenComponent} from './components/splash-screen/splash-screen.component';
import {TokenCallbackComponent} from './components/token-callback/token-callback.component';
import {AuthGuard} from './guards/auth.guard';
import {PageGuard} from './guards/page.guard';
import {SiteFilesComponent} from './components/site-files/site-files.component';

const routes: Routes = [
  {
    // root components
    path: '',
    children: [
      // handle oauth callbacks for authentication
      {
        path: 'callback',
        children: [
          {
            path: 'email',
            component: TokenCallbackComponent
          }
        ]
      },
      // generic error pages
      {
        path: '500',
        component: PageErrorComponent
      },
      {
        path: '401',
        component: PageUnauthorizedComponent
      },
      {
        path: '404',
        component: PageNotFoundComponent
      },
      // the "home" page when the user is not signed in, also the default login page
      {
        path: 'login',
        component: SplashScreenComponent
      },
      {
        path: 'admin/sites/:id',
        component: SiteAdminComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: 'pages',
            pathMatch: 'full'
          },
          {
            path: 'settings',
            component: SiteSettingsComponent,
          },
          {
            path: 'pages',
            component: SitePagesComponent,
          },
          {
            path: 'theme',
            component: SiteThemeComponent,
          },
          {
            path: 'files',
            component: SiteFilesComponent,
          },
          {
            path: 'navigation',
            component: SiteNavigationComponent,
          },
          {
            path: 'advanced',
            component: SiteAdvancedSettingsComponent,
          }
        ]
      },
      // the "home" page when a user is logged in, if user is not authenticated, will redirect to "login"
      {
        path: 'admin',
        canActivate: [AuthGuard],
        component: AdminComponent,
        children: [
          {
            path: '',
            redirectTo: 'sites',
            pathMatch: 'full'
          },
          {
            path: 'sites',
            component: SitesComponent,
          },
          {
            path: 'settings',
            canActivate: [AuthGuard],
            component: SettingsComponent
          },
        ]
      },
      {
        path: ':pageSlug',
        component: PageComponent,
        canActivate: [PageGuard]
      },
      {
        path: 'p/:pageId',
        component: PageComponent,
        canActivate: [PageGuard]
      },
      {
        path: 'p/:pageId/:pageSlug',
        component: PageComponent,
        canActivate: [PageGuard]
      },
      // set default page ("/") to admin
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'admin'
      },
      // all other requested pages will redirect to "admin"
      {
        path: '**',
        redirectTo: 'admin'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {initialNavigation: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
