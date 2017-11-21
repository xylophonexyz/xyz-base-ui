import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {abbreviate} from '../../util/abbreviation';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderComponent {

  @Input() title = 'Untitled';
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';

  abbreviation() {
    return abbreviate(this.title);
  }

  titleSize() {
    switch (this.size) {
      case 'sm':
        return '1rem';
      case 'md':
        return '2rem';
      case 'lg':
        return '4rem';
      default:
        return '1rem';
    }
  }
}
