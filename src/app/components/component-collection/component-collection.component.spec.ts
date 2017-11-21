import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs/Observable';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {ContentEditableModelDirective} from '../../directives/content-editable-model/content-editable-model.directive';
import {XzPopoverModule} from '../../directives/popover/popover.module';
import {XzRichTextDirective} from '../../directives/xz-rich-text-directive/xz-rich-text.directive';
import {Page} from '../../models/page';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {mockCompositionData} from '../../providers/sites.service.spec';
import {UIEmbedComponent} from '../embed-component/embed.component';
import {UIImageComponent} from '../image-component/image-component.component';
import {UISectionComponent} from '../section-component/section-component.component';
import {UISpacerComponent} from '../spacer-component/spacer-component.component';
import {SpinnerComponent} from '../spinner/spinner.component';
import {UITextComponent} from '../text-component/text-component.component';

import {UIComponentCollectionComponent} from './component-collection.component';
import {UIFreeFormHtmlComponent} from '../free-form-html-component/free-form-html-component.component';
import createSpyObj = jasmine.createSpyObj;

export const mockEvent = {
  stopPropagation: () => {
  },
  preventDefault: () => {
  },
} as any;

describe('UIComponentCollectionComponent', () => {
  let component: UIComponentCollectionComponent;
  let fixture: ComponentFixture<UIComponentCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UIComponentCollectionComponent,
        UISectionComponent,
        UIImageComponent,
        UITextComponent,
        UISpacerComponent,
        UIEmbedComponent,
        UIFreeFormHtmlComponent,
        ContentEditableModelDirective,
        XzRichTextDirective,
        SpinnerComponent
      ],
      providers: [
        {provide: PagesService, useValue: pagesServiceStub},
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub}
      ],
      imports: [XzPopoverModule, FeatherModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UIComponentCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send a prop down to change a child components configuration options display', () => {
    component.showOptions();
    expect(component.childShouldShowOptions).toEqual(true);
    component.hideOptions();
    expect(component.childShouldShowOptions).toEqual(false);
  });

  it('should toggle the layout on all child components', () => {
    const viewChild1 = createSpyObj('UISectionComponent', ['toggleLayout']);
    const viewChild2 = createSpyObj('UISectionComponent', ['toggleLayout']);
    const viewChild3 = createSpyObj('UISpacerComponent', ['toggleLayout']);
    const viewChild4 = createSpyObj('UIEmbedComponent', ['toggleLayout']);
    const viewChild5 = createSpyObj('UITextComponent', ['toggleLayout']);
    const viewChild6 = createSpyObj('UIImageComponent', ['toggleLayout']);
    const viewChild7 = createSpyObj('UIFreeFormHtmlComponent', ['toggleLayout']);
    component.sectionComponents = [viewChild1, viewChild2] as any;
    component.spacerComponents = [viewChild3] as any;
    component.embedComponents = [viewChild4] as any;
    component.textComponents = [viewChild5] as any;
    component.imageComponents = [viewChild6] as any;
    component.htmlComponents = [viewChild7] as any;
    component.toggleLayout(mockEvent);
    expect(viewChild1.toggleLayout).toHaveBeenCalled();
    expect(viewChild2.toggleLayout).toHaveBeenCalled();
    expect(viewChild3.toggleLayout).toHaveBeenCalled();
    expect(viewChild4.toggleLayout).toHaveBeenCalled();
    expect(viewChild5.toggleLayout).toHaveBeenCalled();
    expect(viewChild6.toggleLayout).toHaveBeenCalled();
    expect(viewChild7.toggleLayout).toHaveBeenCalled();
  });

  it('should place a popover appropriately', () => {
    const p = new Page({
      metadata: {showNav: false},
      components: [
        {type: 'ComponentCollection'},
        {type: 'DumbCollection'}
      ],
      composition: {...mockCompositionData}
    } as any);
    component.page = p;
    component.componentCollection = p.components[0];
    expect(component.popoverPlacement()).toEqual('bottom');
    component.componentCollection = p.components[1];
    expect(component.popoverPlacement()).toEqual('top');

    component.componentCollection = p.components[0];
    component.page.composition.metadata.showNav = true;
    expect(component.popoverPlacement()).toEqual('bottom');
    delete component.page.composition.metadata.showNav;

    const p2 = new Page({
      metadata: null,
      components: [
        {type: 'ComponentCollection'},
        {type: 'DumbCollection'}
      ],
      composition: null
    } as any);
    component.page = p2;
    component.componentCollection = p2.components[0];
    expect(component.popoverPlacement()).toEqual('top');
  });

  it('should handle unexpected errors when placing a popover appropriately', () => {
    const p = new Page({
      metadata: null,
      components: [
        {type: 'ComponentCollection'},
        {type: 'DumbCollection'}
      ],
      composition: null
    } as any);
    component.page = p;
    component.componentCollection = p.components[0];
    expect(component.popoverPlacement()).toEqual('top');
  });

  it('should remove the component collection from the associated page', () => {
    const p = new Page({
      metadata: {showNav: false},
      components: [
        {type: 'ComponentCollection', id: 2, index: 0},
        {type: 'DumbCollection', id: 234, index: 1}
      ]
    } as any);
    const pagesService = getTestBed().get(PagesService);
    const footerService = getTestBed().get(FooterDelegateService);
    spyOn(pagesService, 'removeComponentCollection').and.callFake(() => {
      return Observable.create(o => o.next({}));
    });
    spyOn(footerService, 'clearCenterActionItems');
    component.page = p;
    expect(component.page.components.length).toEqual(2);
    component.componentCollection = p.components[0];
    component.remove();
    expect(component.page.components.length).toEqual(1);
    expect(pagesService.removeComponentCollection).toHaveBeenCalled();
    expect(footerService.clearCenterActionItems).toHaveBeenCalled();
  });

  it('should handle errors when removing the component collection from the associated page', () => {
    const p = new Page({
      metadata: {showNav: false},
      components: [
        {type: 'ComponentCollection', id: 2, index: 0},
        {type: 'DumbCollection', id: 234, index: 1}
      ]
    } as any);
    const pagesService = getTestBed().get(PagesService);
    const footerService = getTestBed().get(FooterDelegateService);
    spyOn(pagesService, 'removeComponentCollection').and.callFake(() => {
      return Observable.create(o => o.error());
    });
    spyOn(footerService, 'clearCenterActionItems');
    component.page = p;
    component.componentCollection = p.components[0];
    component.remove();
    expect(pagesService.removeComponentCollection).toHaveBeenCalled();
    expect(footerService.clearCenterActionItems).toHaveBeenCalled();
  });

  describe('Swapping Indicies', () => {
    it('should swap the index of the component collection with one with a lower index', () => {
      const p = new Page({
        metadata: {showNav: false},
        components: [
          {type: 'ComponentCollection', id: 2, index: 0},
          {type: 'DumbCollection', id: 234, index: 1}
        ]
      } as any);
      component.page = p;
      component.componentCollection = p.components[1];
      component.moveUp(mockEvent);
      expect(p.components[0].index).toEqual(1);
    });

    it('should swap the index of the component collection with one with a higher index', () => {
      const p = new Page({
        metadata: {showNav: false},
        components: [
          {type: 'ComponentCollection', id: 2, index: 0},
          {type: 'DumbCollection', id: 234, index: 1}
        ]
      } as any);
      component.page = p;
      component.componentCollection = p.components[0];
      component.moveDown(mockEvent);
      expect(p.components[1].index).toEqual(0);
    });

    it('should handle errors by reverting indices', () => {
      const p = new Page({
        metadata: {showNav: false},
        components: [
          {type: 'ComponentCollection', id: 2, index: 0},
          {type: 'DumbCollection', id: 234, index: 1}
        ]
      } as any);
      component.page = p;
      component.componentCollection = p.components[0];
      let callCount = 0;
      const service = getTestBed().get(ComponentCollectionService);
      spyOn(service, 'update').and.callFake(() => {
        return Observable.create(o => {
          if (callCount++ === 0) {
            o.next({});
          } else {
            o.error();
          }
        });
      });
      component.moveDown(mockEvent);
      expect(p.components[0].index).toEqual(0);
      expect(p.components[1].index).toEqual(1);
    });

    it('should handle errors by reverting indices', () => {
      const p = new Page({
        metadata: {showNav: false},
        components: [
          {type: 'ComponentCollection', id: 2, index: 0},
          {type: 'DumbCollection', id: 234, index: 1}
        ]
      } as any);
      component.page = p;
      component.componentCollection = p.components[0];
      let callCount = 0;
      const service = getTestBed().get(ComponentCollectionService);
      spyOn(service, 'update').and.callFake(() => {
        return Observable.create(o => {
          if (callCount++ === 0) {
            o.error();
          } else {
            o.next({});
          }
        });
      });
      component.moveDown(mockEvent);
      expect(p.components[0].index).toEqual(0);
      expect(p.components[1].index).toEqual(1);
    });
  });
});
