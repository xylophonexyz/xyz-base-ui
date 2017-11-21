import {ChangeDetectorRef} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
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
import {FreeFormHtmlLayoutOption, UIFreeFormHtmlComponent} from './free-form-html-component.component';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';


describe('UIFreeFormHtmlComponent', () => {
  let component: UIFreeFormHtmlComponent;
  let fixture: ComponentFixture<UIFreeFormHtmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UIFreeFormHtmlComponent,
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
    fixture = TestBed.createComponent(UIFreeFormHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a getter that returns its layout options', () => {
    const layout = component.layoutOptions;
    expect(layout).toEqual([
      FreeFormHtmlLayoutOption.FullWidth,
    ]);
  });

  it('should provide a custom configuration ', () => {
    expect(component.configuration().length).toEqual(0);
  });

  it('should provide a default layout option', () => {
    expect(component.layout).toEqual(FreeFormHtmlLayoutOption.FullWidth);
  });

  it('should provide a setter to set a layout', () => {
    expect(component.layout).toEqual(FreeFormHtmlLayoutOption.FullWidth);
    component.layout = FreeFormHtmlLayoutOption.FullWidth;
    expect(component.layout).toEqual(FreeFormHtmlLayoutOption.FullWidth);
  });

  it('should provide a method to handle changes to the input binding', () => {
    component.component = new Component({media: null} as any);
    expect(component.component.media).toBeNull();
    component.htmlDidChange('<h1></h1>');
    expect(component.component.media).toEqual('<h1></h1>');
  });
});
