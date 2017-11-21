import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ImageComponent} from '../../models/image-component';
import {NavActionItem} from '../../models/nav-action-item';
import {getHexColorString} from '../../util/colors';
import {UIComponent} from '../component/component.component';
import {UIMediaComponent} from '../media-component/media-component';

export enum ImageLayoutOption {
  Contain = 'Contain', // image size is contained relative to container
  ContainLeft = 'ContainLeft', // image size is contained, positioned left
  ContainRight = 'ContainRight', // image size is contained, positioned right
  ContainLeftEdgeToEdge = 'ContainLeftEdgeToEdge', // image is aligned to left edge of screen
  ContainCenterEdgeToEdge = 'ContainCenterEdgeToEdge', // image is aligned to center, background is edge to edge
  ContainRightEdgeToEdge = 'ContainRightEdgeToEdge', // image size is aligned to right edge of screen
  CoverTopCenter = 'CoverTopCenter', // image covers the container, position origin from top of image
  CoverCenterCenter = 'CoverCenterCenter', // image covers the container, position origin from center of image
  CoverBottomCenter = 'CoverBottomCenter', // image covers the container, position origin from bottom of image,
  CoverTopCenterEdgeToEdge = 'CoverTopCenterEdgeToEdge', // image covers the container, position origin top, edge to edge
  CoverCenterCenterEdgeToEdge = 'CoverCenterCenterEdgeToEdge', // image covers the container, position origin center, edge to edge
  CoverBottomCenterEdgeToEdge = 'CoverBottomCenterEdgeToEdge', // image covers the container, position origin bottom, edge to edge
}

@Component({
  selector: 'app-image-component',
  templateUrl: './image-component.component.html',
  styleUrls: ['./image-component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIImageComponent extends UIMediaComponent {

  @Input() component: ImageComponent = new ImageComponent(null);

  get layoutOptions(): [ImageLayoutOption] {
    return [
      ImageLayoutOption.Contain,
      ImageLayoutOption.ContainLeft,
      ImageLayoutOption.ContainRight,
      ImageLayoutOption.CoverBottomCenter,
      ImageLayoutOption.CoverCenterCenter,
      ImageLayoutOption.CoverTopCenter,
      ImageLayoutOption.ContainLeftEdgeToEdge,
      ImageLayoutOption.ContainCenterEdgeToEdge,
      ImageLayoutOption.ContainRightEdgeToEdge,
      ImageLayoutOption.CoverTopCenterEdgeToEdge,
      ImageLayoutOption.CoverCenterCenterEdgeToEdge,
      ImageLayoutOption.CoverBottomCenterEdgeToEdge
    ];
  }

  get layout(): ImageLayoutOption {
    return super.getLayout();
  }

  set layout(layout: ImageLayoutOption) {
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
        inputPlaceholder: 'Image Size',
        inputType: 'range',
        min: UIComponent.BaseImageSizeValue,
        step: UIComponent.ImageStepSizeValue,
        max: UIComponent.MaxImageSizeValue,
        inputBinding: this.padding,
        onInputChange: (event: Event) => {
          const value = parseFloat((event.target as HTMLInputElement).value);
          this.component.metadata.padding = Math.max(UIComponent.BaseImageSizeValue, value);
          this.ref.markForCheck();
        },
        onInputFocus: this.onInputFocus.bind(this),
        onInputBlur: this.onInputBlur.bind(this),
        onInputClick: this.onInputClick.bind(this)
      }),
    ];
  }

  backgroundPosition(): string {
    let pos = '';
    if (this.isOriginTop()) {
      pos += 'top';
    } else if (this.isOriginBottom()) {
      pos += 'bottom';
    } else {
      pos += 'center';
    }
    pos += ' ';
    if (this.isOriginLeft()) {
      pos += 'left';
    } else if (this.isOriginRight()) {
      pos += 'right';
    } else {
      pos += 'center';
    }
    return pos;
  }

  isLayoutContain(): boolean {
    return /Contain/.test(this.layout);
  }

  isLayoutEdgeToEdge(): boolean {
    return /EdgeToEdge$/.test(this.layout);
  }

  isOriginTop(): boolean {
    return /CoverTop/.test(this.layout);
  }

  isOriginBottom(): boolean {
    return /CoverBottom/.test(this.layout);
  }

  isOriginLeft(): boolean {
    return /ContainLeft/.test(this.layout);
  }

  isOriginRight(): boolean {
    return /ContainRight/.test(this.layout);
  }

  protected fallbackLayout(): ImageLayoutOption {
    return ImageLayoutOption.Contain;
  }

  protected defaultPadding(): number {
    return 15;
  }
}
