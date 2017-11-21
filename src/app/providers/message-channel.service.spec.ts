import {inject, TestBed} from '@angular/core/testing';

import {MessageChannelDelegateService} from './message-channel.service';

describe('MessageChannelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageChannelDelegateService]
    });
  });

  it('should be created', inject([MessageChannelDelegateService], (service: MessageChannelDelegateService) => {
    expect(service).toBeTruthy();
  }));

  it('should expose an observable for receiving messages',
    inject([MessageChannelDelegateService], (service: MessageChannelDelegateService) => {
      expect(service.messages$).toBeDefined();
    }));

  it('should expose a method for sending messages',
    inject([MessageChannelDelegateService], (service: MessageChannelDelegateService) => {
      expect(service.sendMessage).toBeDefined();
    }));

  it('should allow sending of a message and receiving by two disparate parties',
    inject([MessageChannelDelegateService], (service: MessageChannelDelegateService) => {
      // listener
      service.messages$.subscribe(message => {
        expect(message.topic).toEqual('BlandTopic');
        expect(message.data.foo).toEqual('bar');
      });
      // emitter
      service.sendMessage({topic: 'BlandTopic', data: {foo: 'bar'}});
    }));
});
