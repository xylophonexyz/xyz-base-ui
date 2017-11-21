import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MessageChannelPayload} from '../index';

@Injectable()
export class MessageChannelDelegateService {

  /**
   * Private Subject for MessageChannel messages.
   * @type {Subject}
   */
  private messageChannel: Subject<MessageChannelPayload> = new Subject();

  /**
   * Observable for receiving MessageChannel messages.
   * @type {Observable<MessageChannelPayload>}
   */
  messages$: Observable<MessageChannelPayload> = this.messageChannel.asObservable();

  /**
   * Send a MessageChannelPayload message over the messageChannel observable. Interested parties will receive the
   * message by subscribing to the public messages$ observable.
   * @param message
   */
  sendMessage(message: MessageChannelPayload) {
    this.messageChannel.next(message);
  }
}
