import {ChangeDetectorRef} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {XzRichTextMock} from '../../../test/stubs/rich-text-directive.stub.spec';
import {Component} from '../../models/component';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';

import {TextLayoutOption, UITextComponent} from './text-component.component';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';

describe('UITextComponent', () => {
  let component: UITextComponent;
  let fixture: ComponentFixture<UITextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UITextComponent,
        XzRichTextMock
      ],
      providers: [
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: DomSanitizer, useValue: mockDomSanitizer},
        MessageChannelDelegateService,
        ChangeDetectorRef,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UITextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a binding to the contenteditable model', () => {
    component.component = new Component({media: 'foo'} as any);
    expect(component.textModel).toEqual('foo');
  });

  it('should provide a binding to the contenteditable model and handle invalid input gracefully', () => {
    component.component = null;
    expect(component.textModel).toEqual(null);
  });

  it('should react to changes from contentEditable model changes', () => {
    component.component = new Component({media: 'foo'} as any);
    component.textDidChange('bar');
    expect(component.textModel).toEqual('bar');
  });

  it('should provide a getter that returns its layout options', () => {
    const layout = component.layoutOptions;
    expect(layout).toEqual([
      TextLayoutOption.NormalLeftFull,
      TextLayoutOption.NormalLeft,
      TextLayoutOption.NormalCenter,
      TextLayoutOption.NormalRight,
      TextLayoutOption.NormalRightFull,
      TextLayoutOption.TitleLeftFull,
      TextLayoutOption.TitleLeft,
      TextLayoutOption.TitleCenter,
      TextLayoutOption.TitleRight,
      TextLayoutOption.TitleRightFull,
      TextLayoutOption.SubtitleLeftFull,
      TextLayoutOption.SubtitleLeft,
      TextLayoutOption.SubtitleCenter,
      TextLayoutOption.SubtitleRight,
      TextLayoutOption.SubtitleRightFull,
    ]);
  });

  it('should provide a default layout option', () => {
    expect(component.layout).toEqual(TextLayoutOption.NormalLeft);
  });

  it('should provide a setter to set a layout', () => {
    expect(component.layout).toEqual(TextLayoutOption.NormalLeft);
    component.layout = TextLayoutOption.SubtitleLeft;
    expect(component.layout).toEqual(TextLayoutOption.SubtitleLeft);
  });

  describe('Configuration Options', () => {

    it('should provide a NavActionItem with an input to receive custom text color', () => {
      const colorConfig = component.configuration()[0];
      expect(colorConfig.isInput()).toEqual(true);
      const event = {target: {value: '#444444'}} as any;
      expect(component.paletteColor).toBeUndefined();
      colorConfig.onInputChange(event);
      expect(component.paletteColor).toEqual('#444444');
    });

    it('should handle blur events on palette color input and update footer', async(() => {
      const colorConfig = component.configuration()[0];
      expect(colorConfig.onInputBlur).toBeDefined();

      const footer = getTestBed().get(FooterDelegateService);
      spyOn(footer, 'clearCenterActionItems');
      component.canHideFooterConfig = false;
      colorConfig.onInputBlur(null);
      expect(component.canHideFooterConfig).toEqual(true);
      setTimeout(() => {
        expect(footer.clearCenterActionItems).toHaveBeenCalled();
      });
    }));

    it('should handle blur events on text color input and update footer', async(() => {
      const colorConfig = component.configuration()[0];
      expect(colorConfig.onInputBlur).toBeDefined();

      const footer = getTestBed().get(FooterDelegateService);
      spyOn(footer, 'clearCenterActionItems');
      component.canHideFooterConfig = false;
      colorConfig.onInputBlur(null);
      expect(component.canHideFooterConfig).toEqual(true);
      setTimeout(() => {
        expect(footer.clearCenterActionItems).toHaveBeenCalled();
      });
    }));

    it('should handle focus events and prevent the footer options from hiding', () => {
      const colorConfig = component.configuration()[0];
      expect(colorConfig.onInputFocus).toBeDefined();
      component.canHideFooterConfig = true;
      colorConfig.onInputFocus(null);
      expect(component.canHideFooterConfig).toEqual(false);
    });
  });
});
