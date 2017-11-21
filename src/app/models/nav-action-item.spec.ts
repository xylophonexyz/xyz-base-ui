import {NavActionItem} from './nav-action-item';

describe('NavActionItem', () => {

  it('should create a NavActionItem', () => {
    const action = () => null;
    const item = new NavActionItem('Foo', {
      onInputChange: action
    });
    expect(item.text).toEqual('Foo');
    expect(item.onInputChange).toEqual(action);
    expect(item.options).toBeDefined();

    const item2 = new NavActionItem('Foo', null);
    expect(item2.onInputChange).not.toThrow();
  });

  it('should provide getters for optional values', () => {
    let item = new NavActionItem('Foo', {
      isImg: true,
      imgSrc: 'cat.jpg'
    });
    expect(item.isImage()).toEqual(true);
    expect(item.isButton()).toEqual(false);
    expect(item.hasIcon()).toEqual(false);
    expect(item.cssClass).toEqual('');
    expect(item.options.imgSrc).toEqual('cat.jpg');

    item = new NavActionItem('Foo', {
      cssClass: 'quo qux-qoo'
    });
    expect(item.isImage()).toBeFalsy();
    expect(item.cssClass).toEqual('quo qux-qoo');

    item = new NavActionItem('Foo', {
      isButton: true
    });
    expect(item.isButton()).toEqual(true);
  });

  describe('Item Types', () => {
    it('should support a default type', () => {
      const buttonItem = new NavActionItem(null, {
        isButton: true,
      });
      expect(buttonItem.isButton()).toEqual(true);

      const inputItem = new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Foo',
        inputType: 'email',
        inputBinding: 'startingVal',
        onInputFocus: () => {
          return 1;
        },
        onInputBlur: () => {
          return 2;
        },
        onInputClick: () => {
          return 5;
        }
      });
      expect(inputItem.isInput()).toEqual(true);
      expect(inputItem.inputType).toEqual('email');
      expect(inputItem.inputBinding).toEqual('startingVal');
      expect(inputItem.inputPlaceholder).toEqual('Foo');
      expect(inputItem.onInputBlur(null)).toEqual(2);
      expect(inputItem.onInputFocus(null)).toEqual(1);
      expect(inputItem.onInputClick(null)).toEqual(5);
    });

    it('should provide defaults for input types', () => {
      let inputItem = new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Foo',
        inputBinding: 'startingVal'
      });
      expect(inputItem.inputType).toEqual('text');

      inputItem = new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: 'Foo',
        inputBinding: null
      });
      expect(inputItem.inputBinding).toEqual('');

      inputItem = new NavActionItem(null, {
        isInput: true,
        inputPlaceholder: null,
      });
      expect(inputItem.inputPlaceholder).toEqual('');
      expect(inputItem.onInputBlur(null)).toBeNull();
      expect(inputItem.onInputFocus(null)).toBeNull();
      expect(inputItem.onInputClick(null)).toBeNull();
    });

    it('should support a range type', () => {
      const inputItem = new NavActionItem(null, {
        isInput: true,
        inputType: 'range',
      });
      expect(inputItem.isButton()).toEqual(false);
      expect(inputItem.isInput()).toEqual(true);
      expect(inputItem.isRange()).toEqual(true);

      expect(inputItem.max).toEqual(Infinity);
      expect(inputItem.min).toEqual(1);
      expect(inputItem.step).toEqual(1);

      inputItem.options.max = 5;
      inputItem.options.min = 2;
      inputItem.options.step = 3;

      expect(inputItem.max).toEqual(5);
      expect(inputItem.min).toEqual(2);
      expect(inputItem.step).toEqual(3);
    });
  });
});
