import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NavActionItem} from '../../models/nav-action-item';
import {getHexColorString} from '../../util/colors';
import {ConfigurableUIComponentWithToolbar} from '../component/component.component';

export enum TextLayoutOption {
  NormalLeftFull = 'NormalLeftFull',
  NormalLeft = 'NormalLeft',
  NormalCenter = 'NormalCenter',
  NormalRight = 'NormalRight',
  NormalRightFull = 'NormalRightFull',
  TitleLeftFull = 'TitleLeftFull',
  TitleLeft = 'TitleLeft',
  TitleCenter = 'TitleCenter',
  TitleRight = 'TitleRight',
  TitleRightFull = 'TitleRightFull',
  SubtitleLeftFull = 'SubtitleLeftFull',
  SubtitleLeft = 'SubtitleLeft',
  SubtitleCenter = 'SubtitleCenter',
  SubtitleRight = 'SubtitleRight',
  SubtitleRightFull = 'SubtitleRightFull'
}

@Component({
  selector: 'app-text-component',
  templateUrl: './text-component.component.html',
  styleUrls: ['./text-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Text component provides free form text editing capabilities via contenteditable. Supports HTML content as well.
 * This class makes use of its parent class heavily, so be sure to read the docs on UIComponent.
 */
export class UITextComponent extends ConfigurableUIComponentWithToolbar {

  get textModel() {
    try {
      return this.component.media;
    } catch (e) {
      return null;
    }
  }

  get layoutOptions(): [TextLayoutOption] {
    return [
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
    ];
  }

  get layout(): TextLayoutOption {
    return super.getLayout();
  }

  set layout(layout: TextLayoutOption) {
    this.setLayout(layout);
  }

  configuration(): NavActionItem[] {
    return [
      new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Palette Color',
        inputBinding: this.paletteColor,
        onInputChange: (event: Event) => {
          this.component.metadata.paletteColor = getHexColorString((event.target as HTMLInputElement).value);
          this.ref.markForCheck();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      }),
    ];
  }

  textDidChange(text: string) {
    this.component.media = text;
  }

  isCenterAligned() {
    return /Center$/.test(this.layout.toString());
  }

  isRightAligned() {
    return /Right|RightFull$/.test(this.layout.toString());
  }

  isFullWidth() {
    return /Full$/.test(this.layout.toString());
  }

  isTitle() {
    return /^Title/.test(this.layout.toString());
  }

  isSubtitle() {
    return /^Subtitle/.test(this.layout.toString());
  }

  protected fallbackLayout(): TextLayoutOption {
    return TextLayoutOption.NormalLeft;
  }
}
