import {ChangeDetectionStrategy, Component, OnChanges} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';
import {NavActionItem} from '../../models/nav-action-item';
import {getHexColorString} from '../../util/colors';
import {ConfigurableUIComponent} from '../component/component.component';

export enum EmbedLayoutOption {
  Contain = 'Contain',
  Large = 'Large',
  FullWidth = 'FullWidth'
}

@Component({
  selector: 'app-embed-component',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIEmbedComponent extends ConfigurableUIComponent implements OnChanges {

  get embedSrc(): string {
    return this.component.media;
  }

  get layoutOptions(): [EmbedLayoutOption] {
    return [
      EmbedLayoutOption.Contain,
      EmbedLayoutOption.Large,
      EmbedLayoutOption.FullWidth,
    ];
  }

  get layout(): EmbedLayoutOption {
    return super.getLayout();
  }

  set layout(layout: EmbedLayoutOption) {
    this.setLayout(layout);
  }

  configuration(): NavActionItem[] {
    return [
      new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Background Color',
        inputBinding: this.bgColor,
        onInputChange: (event: Event) => {
          this.component.metadata.bgColor = getHexColorString((event.target as HTMLInputElement).value);
          this.ref.markForCheck();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      }),
      new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Embed URL',
        inputBinding: this.embedSrc,
        onInputChange: (event: Event) => {
          this.component.media = (event.target as HTMLInputElement).value;
          this.ref.markForCheck();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      })
    ];
  }

  embedUrl(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.embedSrc);
  }

  hasEmbedSrc(): boolean {
    return !!this.embedSrc;
  }

  isFullWidth(): boolean {
    return /FullWidth/.test(this.layout);
  }

  isLarge(): boolean {
    return /Large/.test(this.layout);
  }

  protected fallbackLayout() {
    return EmbedLayoutOption.Contain;
  }
}
