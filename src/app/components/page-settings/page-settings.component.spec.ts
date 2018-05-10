import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSettingsComponent } from './page-settings.component';
import {FormsModule} from '@angular/forms';
import {UIEmbedComponent} from '../embed-component/embed.component';
import {ActivatedRoute, Router} from '@angular/router';
import {WindowRefService} from '../../providers/window-ref.service';
import {UISectionComponent} from '../section-component/section-component.component';
import {routerStub} from '../../../test/stubs/router.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {navbarNotifierStub} from '../../../test/stubs/navbar-notifier.service.stub.spec';
import {PagesService} from '../../providers/pages.service';
import {UITextComponent} from '../text-component/text-component.component';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {UISpacerComponent} from '../spacer-component/spacer-component.component';
import {PageUIComponentCollectionAdditionComponent} from '../page-component-addition/page-component-addition.component';
import {ToggleOnClickDirective} from '../../directives/toggle-on-click/toggle-on-click.directive';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {XzChangeBgColorOnHoverDirective} from '../../directives/xz-change-bg-color-on-hover/xz-change-bg-color-on-hover.directive';
import {SpinnerComponent} from '../spinner/spinner.component';
import {XzRichTextMock} from '../../../test/stubs/rich-text-directive.stub.spec';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {PageComponent} from '../page/page.component';
import {UIImageComponent} from '../image-component/image-component.component';
import {authServiceStub} from '../../../test/stubs/auth.service.stub.spec';
import {activatedRouteStub} from '../../../test/stubs/activated-route.stub.spec';
import {NavbarDelegateService} from '../../providers/navbar-delegate.service';
import {RouterTestingModule} from '@angular/router/testing';
import {ModalComponent} from '../modal/modal.component';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {Meta, Title} from '@angular/platform-browser';
import {AuthService} from '../../providers/auth.service';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {UIComponentCollectionComponent} from '../component-collection/component-collection.component';
import {UIFreeFormHtmlComponent} from '../free-form-html-component/free-form-html-component.component';
import {ContentEditableModelDirective} from '../../directives/content-editable-model/content-editable-model.directive';
import {XzPopoverModule} from '../../directives/popover/popover.module';
import {ComponentCollectionService} from '../../providers/component-collection.service';

describe('PageSettingsComponent', () => {
  let component: PageSettingsComponent;
  let fixture: ComponentFixture<PageSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: NavbarDelegateService, useValue: navbarNotifierStub},
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: AuthService, useValue: authServiceStub},
        {provide: PagesService, useValue: pagesServiceStub},
        {provide: Router, useValue: routerStub},
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: WindowRefService, useValue: windowRefStub},
        Title,
        Meta,
      ],
      imports: [
        RouterTestingModule,
        XzPopoverModule,
        FormsModule,
        FeatherModule
      ],
      declarations: [
        ToggleOnClickDirective,
        SpinnerComponent,
        PageComponent,
        ModalComponent,
        PageUIComponentCollectionAdditionComponent,
        UIComponentCollectionComponent,
        UITextComponent,
        UIImageComponent,
        UISpacerComponent,
        UISectionComponent,
        UIFreeFormHtmlComponent,
        UIEmbedComponent,
        ContentEditableModelDirective,
        XzRichTextMock,
        XzChangeBgColorOnHoverDirective,
        PageSettingsComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
