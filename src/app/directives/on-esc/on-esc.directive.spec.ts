import {OnEscDirective} from './on-esc.directive';

describe('OnEscDirective', () => {
  it('should create an instance', () => {
    const directive = new OnEscDirective();
    expect(directive).toBeTruthy();
  });

  it('should respond to keyup events by calling its output binding', () => {
    const directive = new OnEscDirective();
    spyOn(directive.onKeyPressed, 'emit');
    let event = new KeyboardEvent('keyup', {
      key: 'Enter'
    });
    directive.keyup(event);
    expect(directive.onKeyPressed.emit).not.toHaveBeenCalled();

    event = new KeyboardEvent('keyup', {
      key: 'Escape'
    });
    directive.keyup(event);
    expect(directive.onKeyPressed.emit).toHaveBeenCalled();
  });
});
