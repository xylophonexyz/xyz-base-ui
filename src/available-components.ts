import {Request} from 'express';
import {AvailableComponent} from './app/index';

export const BASE_AVAILABLE_COMPONENTS: AvailableComponent[] = [
  {
    icon: 'layers',
    text: 'Section',
    type: 'ComponentCollection',
    metatype: 'Hero'
  },
  {
    icon: 'type',
    text: 'Text',
    type: 'ComponentCollection',
    metatype: 'Text'
  },
  {
    icon: 'image',
    text: 'Image',
    type: 'ComponentCollection',
    metatype: 'ImageCollection'
  },
  {
    icon: 'link',
    text: 'Embed',
    type: 'ComponentCollection',
    metatype: 'Embed'
  },
  {
    icon: 'more-horizontal',
    text: 'Space',
    type: 'ComponentCollection',
    metatype: 'Spacer'
  },
  {
    icon: 'hash',
    text: 'HTML',
    type: 'ComponentCollection',
    metatype: 'FreeFormHtml'
  }
];

export function getAvailableComponents(req?: Request): AvailableComponent[] {
  const availableComponents = [...BASE_AVAILABLE_COMPONENTS];
  if (req && req.headers.Authorization) {
    // TODO: return additional components based on whether the logged in user has access
    return availableComponents.concat([]);
  }
  return availableComponents;
}
