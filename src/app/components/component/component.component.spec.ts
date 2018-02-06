import {ChangeDetectorRef} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {XzRichTextDirective} from '../../directives/xz-rich-text-directive/xz-rich-text.directive';
import {Component} from '../../models/component';
import {mockComponentData} from '../../models/component.spec';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {getColorPalette} from '../../util/colors';
import {mockEvent} from '../component-collection/component-collection.component.spec';
import {TextLayoutOption} from '../text-component/text-component.component';

import {ConfigurableUIComponent, ConfigurableUIComponentWithToolbar, UIComponent} from './component.component';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {QuillService} from '../../providers/quill.service';
import createSpyObj = jasmine.createSpyObj;

class FakeUIComponent extends UIComponent {
  get layout() {
    return super.getLayout();
  }
}

describe('UIComponent', () => {
  let component: UIComponent;
  let fixture: ComponentFixture<UIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UIComponent, FakeUIComponent, ConfigurableUIComponent, ConfigurableUIComponentWithToolbar],
      providers: [
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: QuillService, useClass: QuillService},
        MessageChannelDelegateService,
        ChangeDetectorRef,
        UtilService,
        WindowRefService,
        DomSanitizer
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a getter for its layout', () => {
    const f = TestBed.createComponent(FakeUIComponent);
    const subclass = f.componentInstance as any;
    subclass.component.metadata = {layout: null};
    expect(subclass.layout).toEqual(null);
  });

  it('should provide a method for subclasses to provide an array of NavActionItems that will be added to footer', () => {
    expect(component.configuration()).toEqual([]);
  });

  it('should invoke the footer service to remove configuration options', () => {
    const footer = getTestBed().get(FooterDelegateService);
    spyOn(footer, 'clearCenterActionItems');
    component.emitHideOptions();
    expect(footer.clearCenterActionItems).toHaveBeenCalled();
  });

  it('should invoke the footer service to add configuration options', () => {
    const footer = getTestBed().get(FooterDelegateService);
    spyOn(footer, 'setCenterActionItems');
    spyOn(component, 'configuration').and.returnValue(['Foo']);
    component.editable = true;
    component.emitShowOptions();
    expect(footer.setCenterActionItems).toHaveBeenCalledWith(['Foo']);
  });

  it('should provide an input binding to make the component editable', () => {
    component.editable = true;
    expect(component.editable).toEqual(true);
  });

  it('should provide an input binding to show the components configuration options', () => {
    component.showOptions = true;
    expect(component.showOptions).toEqual(true);
  });

  it('should provide a method to stop events from propagating when element is focused', () => {
    const event = createSpyObj(['stopPropagation']);
    component.showOptions = true;
    component.didFocusField(event);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should call a showOptions or hideOptions method on change detection', async(() => {
    spyOn(component, 'emitShowOptions').and.callThrough();
    spyOn(component, 'emitHideOptions').and.callThrough();

    component.ngOnChanges({showOptions: {currentValue: true}} as any);
    setTimeout(() => {
      expect(component.emitShowOptions).toHaveBeenCalled();
    });

    component.ngOnChanges({showOptions: {currentValue: false}} as any);
    expect(component.emitHideOptions).toHaveBeenCalled();
  }));

  it('should provide a method to return the layout options for descendants', () => {
    expect(component.layoutOptions).toEqual([]);
  });

  it('should provide a getter for the layout', () => {
    expect(component.layout).toEqual(null);
  });

  it('should toggle a components layout based on a common metadata definition', () => {
    spyOnProperty(component, 'layoutOptions', 'get').and.returnValue([TextLayoutOption.NormalCenter, TextLayoutOption.NormalLeft]);
    component.component.metadata = {layout: TextLayoutOption.NormalLeft};
    component.toggleLayout();
    fixture.detectChanges();
    expect(component.component.metadata.layout).toEqual(TextLayoutOption.NormalCenter);
  });

  describe('Messages', () => {
    it('should provide an overridable method for receiving messages', () => {
      expect(component.didGetMessage).toBeDefined();
      expect(component.didGetMessage(null)).toBeUndefined();
    });

    it('should receive messages', () => {
      const channel = getTestBed().get(MessageChannelDelegateService);
      spyOn(component, 'didGetMessage');
      channel.sendMessage({topic: UIComponent.GenericMessageTopic, data: 'foo'});
      expect(component.didGetMessage).toHaveBeenCalled();
    });
  });

  describe('Save', () => {
    it('should provide a method to save the component', () => {
      const service = getTestBed().get(ComponentService);
      spyOn(service, 'update');
      component.editable = true;
      component.component = new Component(mockComponentData);
      component.save();
      expect(service.update).toHaveBeenCalled();
    });

    it('should fail silently if edit mode is false', () => {
      const service = getTestBed().get(ComponentService);
      spyOn(service, 'update');
      component.editable = false;
      component.component = new Component(mockComponentData);
      component.save();
      expect(service.update).not.toHaveBeenCalled();
    });
  });

  describe('Getters', () => {
    let configurableComponent: ConfigurableUIComponent;
    let configurableComponentFixture: ComponentFixture<ConfigurableUIComponent>;

    beforeEach(() => {
      configurableComponentFixture = TestBed.createComponent(ConfigurableUIComponent);
      configurableComponent = configurableComponentFixture.componentInstance;
    });

    it('should provide a getter to return the components padding value', () => {
      configurableComponent.component = new Component(mockComponentData);
      configurableComponent.component.metadata = {padding: 5};
      configurableComponentFixture.detectChanges();
      expect(configurableComponent.padding).toEqual(5);
    });

    it('should provide a getter to return the components padding value', () => {
      configurableComponent.component = new Component(mockComponentData);
      configurableComponent.component.metadata = {paletteColor: '#ffaaff'};
      configurableComponentFixture.detectChanges();
      expect(configurableComponent.paletteColor).toEqual('#ffaaff');
    });

    it('should fallback to default values', () => {
      configurableComponent.component = new Component(mockComponentData);
      configurableComponent.component.metadata = null;
      configurableComponentFixture.detectChanges();
      expect(configurableComponent.paletteColor).toEqual(null);
      expect(configurableComponent.padding).toEqual(null);
      expect(configurableComponent.bgColor).toEqual(null);
    });

    it('should provide a handler for inputFocus events from NavActionItem', () => {
      spyOn(configurableComponent, 'didFocusField');
      configurableComponent.onInputFocus(null);
      expect(configurableComponent.didFocusField).toHaveBeenCalled();
    });

    it('should provide a handler for inputClick events from NavActionItem', () => {
      spyOn(configurableComponent, 'didFocusField');
      configurableComponent.onInputClick(null);
      expect(configurableComponent.didFocusField).toHaveBeenCalled();
    });

    it('should provide a handler for inputBlur events from NavActionItem', () => {
      configurableComponent.onInputBlur(mockEvent);
      expect(configurableComponent.canHideFooterConfig).toEqual(true);
    });
  });

  describe('ConfigurableUIComponentWithToolbar', () => {
    let configurableComponent: ConfigurableUIComponentWithToolbar;
    let configurableComponentFixture: ComponentFixture<ConfigurableUIComponentWithToolbar>;

    beforeEach(() => {
      configurableComponentFixture = TestBed.createComponent(ConfigurableUIComponentWithToolbar);
      configurableComponent = configurableComponentFixture.componentInstance;
    });

    it('should instantiate options for the xzRichTextDirective text toolbar', () => {
      expect(configurableComponent.textEditorToolbarOptions).toEqual(XzRichTextDirective.DefaultToolbarOptions);
    });

    it('should provide an override for ngOnChanges that updates the toolbar options', () => {
      expect(configurableComponent.textEditorToolbarOptions[1][0].color).not.toEqual(getColorPalette('#ff0000'));
      configurableComponent.component = new Component(mockComponentData);
      configurableComponent.component.metadata.paletteColor = '#ff0000';
      configurableComponent.ngOnChanges({});
      expect(configurableComponent.textEditorToolbarOptions[1][0].color).toEqual(getColorPalette('#ff0000'));
    });
  });
});
