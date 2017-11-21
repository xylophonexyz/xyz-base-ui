export interface NavActionItemOptions {
  cssClass?: string;
  isImg?: boolean;
  imgSrc?: string;
  isButton?: boolean;
  hasIcon?: boolean;
  iconName?: string;
  isInput?: boolean;
  inputPlaceholder?: string;
  inputType?: 'text' | 'email' | 'number' | 'tel' | 'range' | 'url';
  max?: number;
  min?: number;
  step?: number;
  inputBinding?: any;
  onInputChange?: (event: Event) => any;
  onInputFocus?: (event: FocusEvent) => any;
  onInputBlur?: (event: FocusEvent) => any;
  onInputClick?: (event: MouseEvent) => any;
}

export class NavActionItem {
  text: string;
  options?: NavActionItemOptions;

  constructor(text: string, options?: NavActionItemOptions) {
    this.text = text;
    this.options = options;
  }

  get cssClass(): string {
    if (this.options && this.options.cssClass) {
      return this.options.cssClass;
    } else {
      return '';
    }
  }

  get inputPlaceholder(): string {
    if (this.options && this.options.inputPlaceholder) {
      return this.options.inputPlaceholder;
    } else {
      return '';
    }
  }

  get inputType(): string {
    if (this.options && this.options.inputType) {
      return this.options.inputType;
    } else {
      return 'text';
    }
  }

  get max(): number {
    if (this.options && this.options.max) {
      return this.options.max;
    } else {
      return Infinity;
    }
  }

  get min(): number {
    if (this.options && this.options.min) {
      return this.options.min;
    } else {
      return 1;
    }
  }

  get step(): number {
    if (this.options && this.options.step) {
      return this.options.step;
    } else {
      return 1;
    }
  }

  get inputBinding(): any {
    if (this.options && this.options.inputBinding) {
      return this.options.inputBinding;
    } else {
      return '';
    }
  }

  get onInputChange(): (event: FocusEvent) => any {
    if (this.options && this.options.onInputChange) {
      return this.options.onInputChange;
    } else {
      return () => null;
    }
  }


  get onInputFocus(): (event: FocusEvent) => any {
    if (this.options && this.options.onInputFocus) {
      return this.options.onInputFocus;
    } else {
      return () => null;
    }
  }

  get onInputBlur(): (event: FocusEvent) => any {
    if (this.options && this.options.onInputBlur) {
      return this.options.onInputBlur;
    } else {
      return () => null;
    }
  }

  get onInputClick(): (event: MouseEvent) => any {
    if (this.options && this.options.onInputClick) {
      return this.options.onInputClick;
    } else {
      return () => null;
    }
  }

  hasIcon(): boolean {
    return !!(this.options && this.options.hasIcon);
  }

  isImage(): boolean {
    return !!(this.options && this.options.isImg);
  }

  isButton(): boolean {
    return !!(this.options && this.options.isButton);
  }

  isInput(): boolean {
    return !!(this.options && this.options.isInput);
  }

  isRange(): boolean {
    return this.isInput() && this.inputType === 'range';
  }
}
