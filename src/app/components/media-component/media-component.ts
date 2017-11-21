import {isPlatformBrowser} from '@angular/common';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {ComponentStatus} from '../../index';
import {ConfigurableUIComponent, UIComponent} from '../component/component.component';

export class UIMediaComponent extends ConfigurableUIComponent {

  mediaUrl: Observable<string> = Observable.create((observer: Subscriber<string>) => {
    const media = this.mediaModel;
    if (media) {
      if (isPlatformBrowser(this.platformId) && media instanceof File) {
        observer.next('/assets/img/placeholder.svg');
        UIMediaComponent.getDataUrl(media).subscribe(dataUrl => {
          observer.next(dataUrl);
        });
      } else if (media.hasOwnProperty('url')) {
        observer.next(media.url);
      } else {
        // placeholder/isProcessing/isFailed image
        observer.next('/assets/img/smpte.jpg');
      }
    }
  });

  get mediaModel(): any {
    try {
      return this.component.media;
    } catch (e) {
      return null;
    }
  }

  get statusText(): string {
    if (this.statusIsLoading()) {
      return 'Uploading...';
    }
    if (this.statusIsProcessing()) {
      return 'Processing...';
    }
    if (this.statusIsFailed()) {
      return 'Failed';
    }
    return '';
  }

  static getDataUrl(file: File): Observable<string> {
    return Observable.create(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        observer.next(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  didGetMessage(data: any) {
    if (data === UIComponent.DetectChangesMessage) {
      this.ref.markForCheck();
    }
  }

  statusIsLoading(): boolean {
    const status = this.status();
    return status === ComponentStatus.LOADING;
  }

  statusIsProcessing(): boolean {
    const status = this.status();
    return status === ComponentStatus.PROCESSING;
  }

  statusIsComplete(): boolean {
    const status = this.status();
    return status === ComponentStatus.COMPLETE;
  }

  statusIsFailed(): boolean {
    const status = this.status();
    return status === ComponentStatus.FAILED;
  }

  shouldShowStatusText(): boolean {
    return !this.statusIsComplete();
  }

  private status(): ComponentStatus {
    const isProcessing = this.component.mediaIsProcessing;
    if (isProcessing) {
      return ComponentStatus.PROCESSING;
    } else {
      if (this.component.media) {
        if (this.component.media.hasOwnProperty('url')) {
          return ComponentStatus.COMPLETE;
        } else if (this.component.media.hasOwnProperty('error')) {
          return ComponentStatus.FAILED;
        } else if (this.component.media instanceof File) {
          return ComponentStatus.LOADING;
        }
      } else {
        return ComponentStatus.FAILED;
      }
    }
  }
}
