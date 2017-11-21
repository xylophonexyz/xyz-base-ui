import {positionElements, Positioning} from './positioning';

describe('Positioning', () => {
  const positioning = new Positioning();
  const documentMargin = document.documentElement.style.margin;
  const bodyMargin = document.body.style.margin;
  const bodyHeight = document.body.style.height;
  const bodyWidth = document.body.style.width;

  function createElement(height: number, width: number, marginTop: number, marginLeft: number): HTMLElement {
    const element = document.createElement('div');
    element.style.display = 'inline-block';
    element.style.height = height + 'px';
    element.style.width = width + 'px';
    element.style.marginTop = marginTop + 'px';
    element.style.marginLeft = marginLeft + 'px';

    return element;
  }

  let element, targetElement, arrowElement;

  beforeEach(() => {
    element = createElement(200, 300, 100, 150);
    document.body.appendChild(element);
    targetElement = createElement(50, 100, 10, 20);
    document.body.appendChild(targetElement);
    arrowElement = createElement(10, 10, 0, 0);
    document.body.appendChild(arrowElement);

    document.documentElement.style.margin = '0';
    document.body.style.margin = '0';
    document.body.style.height = '2000px';
    document.body.style.width = '2000px';
  });

  afterEach(() => {
    document.body.removeChild(element);
    document.body.removeChild(targetElement);
    document.body.removeChild(arrowElement);
    document.documentElement.style.margin = documentMargin;
    document.body.style.margin = bodyMargin;
    document.body.style.height = bodyHeight;
    document.body.style.width = bodyWidth;
  });

  it('should calculate the element offset', () => {
    const position = positioning.offset(element);

    expect(position.height).toBe(200);
    expect(position.width).toBe(300);
    expect(position.left).toBe(150);
    expect(position.right).toBe(450);
  });

  it('should calculate the element offset when scrolled', () => {
    document.documentElement.scrollTop = 1000;
    document.documentElement.scrollLeft = 1000;

    const position = positioning.offset(element);

    expect(position.left).toBe(150);
    expect(position.right).toBe(450);

    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
  });

  it('should calculate the element position', () => {
    const position = positioning.position(element);

    expect(position.height).toBe(200);
    expect(position.width).toBe(300);
    expect(position.left).toBe(150);
    expect(position.right).toBe(450);
  });

  it('should calculate the element position when scrolled', () => {
    document.documentElement.scrollTop = 1000;
    document.documentElement.scrollLeft = 1000;

    const position = positioning.position(element);

    expect(position.left).toBe(150);
    expect(position.right).toBe(450);

    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
  });

  it('should calculate the element position on positioned ancestor', () => {
    const childElement = createElement(100, 150, 50, 75);

    element.style.position = 'relative';
    element.appendChild(childElement);

    const position = positioning.position(childElement);

    expect(position.left).toBe(75);
    expect(position.right).toBe(225);

    element.style.position = '';
    element.removeChild(childElement);
  });

  it('should position the element top-left', () => {
    const position = positioning.positionElements(element, targetElement, 'top');

    expect(position.left).toBe(150);
  });

  it('should position the element when it is fixed', () => {
    spyOn(positioning, 'getStyle' as any).and.returnValue('fixed');
    spyOn(element, 'getBoundingClientRect').and.returnValue({
      left: 150,
      right: 150,
    });
    const position = positioning.positionElements(element, targetElement, 'top');
    expect(position.left).toBe(150);
  });

  it('should position the element top-center', () => {
    element.style.width = `${window.outerWidth}px`;
    element.style.margin = `${0}px`;
    const position = positioning.positionElements(element, targetElement, 'top');
    const left = element.getBoundingClientRect().left + element.offsetWidth / 2 - targetElement.offsetWidth / 2;
    expect(position.left).toBe(Math.round(left));
  });

  it('should position the element top-right', () => {
    element.style.position = 'absolute';
    element.style.left = `${window.outerWidth / 2 + 1 + 150}px`;
    const position = positioning.positionElements(element, targetElement, 'top');
    const right = element.offsetLeft + element.offsetWidth - (element.offsetWidth / 2) + 50;
    expect(position.right).toBe(right);
  });

  it('should position the element bottom-left', () => {
    const position = positioning.positionElements(element, targetElement, 'bottom');

    expect(position.left).toBe(150);
  });

  it('should position the element bottom-center', () => {
    element.style.width = `${window.outerWidth}px`;
    element.style.margin = `${0}px`;
    const position = positioning.positionElements(element, targetElement, 'bottom');
    const left = element.getBoundingClientRect().left + element.offsetWidth / 2 - targetElement.offsetWidth / 2;
    expect(position.left).toBe(Math.round(left));
  });

  it('should position the element bottom-right', () => {
    element.style.position = 'absolute';
    element.style.left = `${window.outerWidth / 2 + 1 - 150}px`;
    const position = positioning.positionElements(element, targetElement, 'bottom');
    const right = element.offsetLeft + element.offsetWidth - (element.offsetWidth / 2) + 50;
    expect(position.right).toBe(right);
  });

  it('should position the arrow left', () => {
    const position = positioning.positionArrow(element, targetElement, arrowElement);
    expect(position.left).toEqual(element.offsetWidth / 2 - arrowElement.offsetWidth / 2);
  });

  it('should position the arrow right', () => {
    element.style.position = 'absolute';
    element.style.left = `${window.outerWidth / 2 + 1}px`;
    const position = positioning.positionArrow(element, targetElement, arrowElement);
    expect(position.right).toEqual(element.offsetWidth / 2 - arrowElement.offsetWidth / 2);
  });

  it('should position the arrow center', () => {
    element.style.position = 'absolute';
    element.style.left = `${window.outerWidth / 2 - 1 - 150}px`;
    element.style.right = `${window.outerWidth / 2 + 1 - 150}px`;
    element.style.width = `${window.outerWidth}px`;
    const position = positioning.positionArrow(element, targetElement, arrowElement);
    expect(position.left).toEqual(targetElement.offsetWidth / 2 - arrowElement.offsetWidth / 2);
  });

  it('should call apply styling to elements', () => {
    const style = Object.assign({}, element.style);
    const style2 = Object.assign({}, arrowElement.style);
    positionElements(element, targetElement, arrowElement, 'top');
    expect(style).not.toEqual(element.style);
    expect(style2).not.toEqual(arrowElement.style);
  });

});
