export class Positioning {

  position(element: HTMLElement, round = true): ClientRect {
    let elPosition: ClientRect;
    let parentOffset: ClientRect = {width: 0, height: 0, top: 0, bottom: 0, left: 0, right: 0};

    if (this.getStyle(element, 'position') === 'fixed') {
      elPosition = element.getBoundingClientRect();
    } else {
      const offsetParentEl = this.offsetParent(element);

      elPosition = this.offset(element, false);

      if (offsetParentEl !== document.documentElement) {
        parentOffset = this.offset(offsetParentEl, false);
      }

      parentOffset.top += offsetParentEl.clientTop;
      parentOffset.left += offsetParentEl.clientLeft;
    }

    elPosition.top -= parentOffset.top;
    elPosition.bottom -= parentOffset.top;
    elPosition.left -= parentOffset.left;
    elPosition.right -= parentOffset.left;

    if (round) {
      elPosition.top = Math.round(elPosition.top);
      elPosition.bottom = Math.round(elPosition.bottom);
      elPosition.left = Math.round(elPosition.left);
      elPosition.right = Math.round(elPosition.right);
    }

    return elPosition;
  }

  offset(element: HTMLElement, round = true): ClientRect {
    const elBcr = element.getBoundingClientRect();
    const viewportOffset = {
      top: window.pageYOffset - document.documentElement.clientTop,
      left: window.pageXOffset - document.documentElement.clientLeft
    };

    const elOffset = {
      height: elBcr.height || element.offsetHeight,
      width: elBcr.width || element.offsetWidth,
      top: elBcr.top + viewportOffset.top,
      bottom: elBcr.bottom + viewportOffset.top,
      left: elBcr.left + viewportOffset.left,
      right: elBcr.right + viewportOffset.left
    };

    if (round) {
      elOffset.height = Math.round(elOffset.height);
      elOffset.width = Math.round(elOffset.width);
      elOffset.top = Math.round(elOffset.top);
      elOffset.bottom = Math.round(elOffset.bottom);
      elOffset.left = Math.round(elOffset.left);
      elOffset.right = Math.round(elOffset.right);
    }

    return elOffset;
  }

  positionElements(hostElement: HTMLElement, targetElement: HTMLElement, placement: string, appendToBody?: boolean): ClientRect {
    const hostElPosition = appendToBody ? this.offset(hostElement, false) : this.position(hostElement, false);
    const shiftWidth: any = {
      left: hostElPosition.left,
      center: hostElPosition.left + hostElPosition.width / 2 - targetElement.offsetWidth / 2,
      right: hostElPosition.left + hostElPosition.width
    };
    const shiftHeight: any = {
      top: hostElPosition.top,
      center: hostElPosition.top + hostElPosition.height / 2 - targetElement.offsetHeight / 2,
      bottom: hostElPosition.top + hostElPosition.height
    };
    const targetElBCR = targetElement.getBoundingClientRect();

    const targetElPosition: ClientRect = {
      height: targetElBCR.height || targetElement.offsetHeight,
      width: targetElBCR.width || targetElement.offsetWidth,
      top: 0,
      bottom: targetElBCR.height || targetElement.offsetHeight,
      left: 0,
      right: targetElBCR.width || targetElement.offsetWidth
    };

    switch (placement) {
      case 'top':
        targetElPosition.top = hostElPosition.top - targetElement.offsetHeight;
        targetElPosition.bottom += hostElPosition.top - targetElement.offsetHeight;
        if (hostElPosition.left > (window.outerWidth / 2)) {
          // host element is on the right half of the screen, open target element to left of host
          targetElPosition.left = shiftWidth.right - targetElPosition.width;
        } else if (hostElPosition.right < (window.outerWidth / 2)) {
          // host element is on the left half of the screen, open target element to right of host
          targetElPosition.left = shiftWidth.left;
        } else {
          // target element is takes up space on both halves of the screen, open target element centered to host
          targetElPosition.left = shiftWidth.center;
        }
        targetElPosition.right += shiftWidth.center;
        break;
      case 'bottom':
        targetElPosition.top = shiftHeight[placement];
        targetElPosition.bottom += shiftHeight[placement];
        if (hostElPosition.left > (window.outerWidth / 2)) {
          // host element is on the right half of the screen, open target element to left of host
          targetElPosition.left = shiftWidth.right - targetElPosition.width;
        } else if (hostElPosition.right < (window.outerWidth / 2)) {
          // host element is on the left half of the screen, open target element to right of host
          targetElPosition.left = shiftWidth.left;
        } else {
          // target element is takes up space on both halves of the screen, open target element centered to host
          targetElPosition.left = shiftWidth.center;
        }
        targetElPosition.right += shiftWidth.center;
        break;
    }

    targetElPosition.top = Math.round(targetElPosition.top);
    targetElPosition.bottom = Math.round(targetElPosition.bottom);
    targetElPosition.left = Math.round(targetElPosition.left);
    targetElPosition.right = Math.round(targetElPosition.right);

    return targetElPosition;
  }

  positionArrow(hostElement: HTMLElement, targetElement: HTMLElement, arrowElement: HTMLElement, appendToBody?: boolean): ClientRect {
    const hostElPosition = appendToBody ? this.offset(hostElement, false) : this.position(hostElement, false);
    const targetElPosition: ClientRect = {
      height: null,
      width: null,
      top: null,
      bottom: null,
      left: null,
      right: null
    };

    if (hostElPosition.left > (window.outerWidth / 2)) {
      // host element is on the right half of the screen, arrow is offset from right
      targetElPosition.right = (hostElement.offsetWidth / 2) - (arrowElement.offsetWidth / 2);
    } else if (hostElPosition.right < (window.outerWidth / 2)) {
      // host element is on the left half of the screen, arrow is offset from left
      targetElPosition.left = (hostElement.offsetWidth / 2) - (arrowElement.offsetWidth / 2);
    } else {
      // target element is takes up space on both halves of the screen, arrow is centered
      targetElPosition.left = (targetElement.offsetWidth / 2) - (arrowElement.offsetWidth / 2);
    }
    return targetElPosition;
  }

  private getStyle(element: HTMLElement, prop: string): string {
    return window.getComputedStyle(element)[prop];
  }

  private isStaticPositioned(element: HTMLElement): boolean {
    return (this.getStyle(element, 'position') || 'static') === 'static';
  }

  private offsetParent(element: HTMLElement): HTMLElement {
    let offsetParentEl = <HTMLElement>element.offsetParent || document.documentElement;

    while (offsetParentEl && offsetParentEl !== document.documentElement && this.isStaticPositioned(offsetParentEl)) {
      offsetParentEl = <HTMLElement>offsetParentEl.offsetParent;
    }

    return offsetParentEl || document.documentElement;
  }
}

export function positionElements(hostElement: HTMLElement,
                                 targetElement: HTMLElement,
                                 arrowElement: HTMLElement,
                                 placement: string,
                                 appendToBody?: boolean) {

  const positionService = new Positioning();
  const pos = positionService.positionElements(hostElement, targetElement, placement, appendToBody);

  targetElement.style.top = `${pos.top}px`;
  targetElement.style.left = `${pos.left}px`;
  targetElement.style.marginTop = `${(placement === 'top' ? -1 : 1) * 0.5}em`;

  const arrowPosition = positionService.positionArrow(hostElement, targetElement, arrowElement, appendToBody);
  arrowElement.style.left = `${arrowPosition.left}px`;
  arrowElement.style.right = `${arrowPosition.right}px`;
}
