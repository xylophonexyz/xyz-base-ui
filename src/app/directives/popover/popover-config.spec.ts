import {XzPopoverConfig} from './popover-config';

describe('XzPopoverConfig', () => {
  it('should have sensible default values', () => {
    const config = new XzPopoverConfig();

    expect(config.placement).toBe('top');
    expect(config.triggers).toBe('click');
    expect(config.container).toBeUndefined();
  });
});
