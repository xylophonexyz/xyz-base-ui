import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NavActionItem} from '../../models/nav-action-item';
import {getHexColorString} from '../../util/colors';
import {ConfigurableUIComponent, UIComponent} from '../component/component.component';

export enum SpacerLayoutOption {
  Dots = 'Dots',
  Empty = 'Empty'
}

@Component({
  selector: 'app-spacer-component',
  templateUrl: './spacer-component.component.html',
  styleUrls: ['./spacer-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UISpacerComponent extends ConfigurableUIComponent {

  get layoutOptions(): [SpacerLayoutOption] {
    return [
      SpacerLayoutOption.Dots,
      SpacerLayoutOption.Empty,
    ];
  }

  get layout(): SpacerLayoutOption {
    return super.getLayout();
  }

  set layout(layout: SpacerLayoutOption) {
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
        inputPlaceholder: 'Padding',
        inputType: 'range',
        min: UIComponent.MinPaddingValue,
        max: UIComponent.MaxPaddingValue,
        inputBinding: this.padding,
        onInputChange: (event: Event) => {
          const value = parseFloat((event.target as HTMLInputElement).value);
          this.component.metadata.padding = Math.max(UIComponent.MinPaddingValue, value);
          this.ref.markForCheck();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      }),
    ];
  }

  isLayoutDots(): boolean {
    return /Dots/.test(this.layout);
  }

  protected fallbackLayout(): SpacerLayoutOption {
    return SpacerLayoutOption.Dots;
  }

  protected defaultPadding(): number {
    return UIComponent.BasePaddingValue;
  }
}
