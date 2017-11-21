import {abbreviate} from './abbreviation';

describe('Abbreviation Utility', () => {
  it('should abbreviate a word down to its first letter', () => {
    const toAbbreviate = 'Hello';
    expect(abbreviate(toAbbreviate)).toEqual('H');
    const toAbbreviate2 = 'hello';
    expect(abbreviate(toAbbreviate2)).toEqual('H');
  });

  it('should abbreviate more than one word down to the first letter of the first two words', () => {
    const toAbbreviate = 'Hello World';
    expect(abbreviate(toAbbreviate)).toEqual('HW');
    const toAbbreviate2 = 'Hello World Foo';
    expect(abbreviate(toAbbreviate2)).toEqual('HW');
  });

  it('should ignore non-word characters', () => {
    const toAbbreviate = 'Hello & World';
    expect(abbreviate(toAbbreviate)).toEqual('HW');
    const toAbbreviate2 = 'Hello & ! @ # #$% 345 World';
    expect(abbreviate(toAbbreviate2)).toEqual('HW');
    const toAbbreviate3 = 'Hello & ! @ # #$% 345';
    expect(abbreviate(toAbbreviate3)).toEqual('H');
    const toAbbreviate4 = '& ! @ # #$% 345';
    expect(abbreviate(toAbbreviate4)).toEqual('');
  });

  it('should abbreviate to a given limit', () => {
    const toAbbreviate = 'Hello World Foo Bar';
    expect(abbreviate(toAbbreviate, 3)).toEqual('HWF');
  });

  it('should ignore reserved words', () => {
    const toAbbreviate = 'Events and Media';
    expect(abbreviate(toAbbreviate, 3)).toEqual('EM');
    const toAbbreviate2 = 'Pictures or Videos';
    expect(abbreviate(toAbbreviate2, 3)).toEqual('PV');
  });

  it('should automatically capitalize the abbreviation', () => {
    const toAbbreviate = 'events and media';
    expect(abbreviate(toAbbreviate, 3)).toEqual('EM');
  });
});
