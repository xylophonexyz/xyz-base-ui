import {ChangeDetectorRef} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {mockFile} from '../../../modules/file-upload/file-upload.service.spec';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {UIComponent} from '../component/component.component';
import {SpinnerComponent} from '../spinner/spinner.component';
import {UIMediaComponent} from './media-component';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {QuillService} from '../../providers/quill.service';

describe('UIMediaComponent', () => {
  let component: UIMediaComponent;
  let fixture: ComponentFixture<UIMediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UIMediaComponent, SpinnerComponent],
      providers: [
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: WindowRefService, useValue: windowRefStub},
        {provide: QuillService, useClass: QuillService},
        MessageChannelDelegateService,
        UtilService,
        WindowRefService,
        ChangeDetectorRef,
        DomSanitizer
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UIMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a getter for the media model', () => {
    component.component.media = 'cat.foo';
    expect(component.mediaModel).toEqual('cat.foo');
    component.component = undefined;
    expect(component.mediaModel).toEqual(null);
  });

  it('should provide a getter for status text, based on what point in processing the media it is', () => {
    component.component.media = {url: 'https://works.com'};
    expect(component.statusText).toEqual('');
    expect(component.statusIsComplete()).toEqual(true);
    component.component.media = mockFile(1, 'file.jpg');
    expect(component.statusText).toEqual('Uploading...');
    expect(component.statusIsLoading()).toEqual(true);
    component.component.mediaIsProcessing = true;
    expect(component.statusText).toEqual('Processing...');
    expect(component.statusIsProcessing()).toEqual(true);
    component.component.mediaIsProcessing = false;
    component.component.media = {error: 'Something unexpected happened'};
    expect(component.statusText).toEqual('Failed');
    expect(component.statusIsFailed()).toEqual(true);
  });

  it('should provide a method that returns whether or not to show status text', () => {
    component.component.mediaIsProcessing = true;
    expect(component.shouldShowStatusText()).toEqual(true);
    component.component.mediaIsProcessing = false;
    component.component.media = {url: 'https://works.com'};
    expect(component.shouldShowStatusText()).toEqual(false);
  });

  it('should provide the media url on an observable stream with file', () => {
    component.component.media = mockFile(100, 'cat.foo');
    component.mediaUrl.subscribe(url => {
      expect(url).toBeTruthy();
    });
  });

  it('should provide the media url on an observable stream with url', () => {
    component.component.media = {url: 'https://cat.jpg'};
    component.mediaUrl.subscribe(url => {
      expect(url).toBeTruthy();
    });
  });

  it('should provide the media url on an observable stream with fallback', () => {
    component.component.media = {};
    component.mediaUrl.subscribe(url => {
      expect(url).toBeTruthy();
    });
  });

  it('should provide an override for receiving messages', () => {
    const channel = getTestBed().get(MessageChannelDelegateService);
    spyOn((component as any).ref, 'markForCheck');
    channel.sendMessage({topic: UIComponent.GenericMessageTopic, data: UIComponent.DetectChangesMessage});
    expect((component as any).ref.markForCheck).toHaveBeenCalled();
  });
});
