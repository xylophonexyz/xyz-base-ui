import {ToggleOnClickDirective} from './toggle-on-click.directive';

describe('NavToggleDirective', () => {
  it('should create an instance', () => {
    const directive = new ToggleOnClickDirective();
    expect(directive).toBeTruthy();
  });

  it('should respond to click events by modifying its input binding', () => {
    const directive = new ToggleOnClickDirective();
    expect(directive.toggle).toEqual(false);
    directive.doToggle();
    expect(directive.toggle).toEqual(true);
  });

  it('should respond to click events by sending output events', () => {
    const directive = new ToggleOnClickDirective();
    spyOn(directive.toggleChange, 'emit');
    directive.doToggle();
    expect(directive.toggleChange.emit).toHaveBeenCalledWith(true);
  });
});
