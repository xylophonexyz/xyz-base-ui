"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_AVAILABLE_COMPONENTS = [
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
        text: 'Empty Space',
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
function getAvailableComponents(req) {
    var availableComponents = exports.BASE_AVAILABLE_COMPONENTS.slice();
    if (req && req.headers.Authorization) {
        // TODO: return additional components based on whether the logged in user has access
        return availableComponents.concat([]);
    }
    return availableComponents;
}
exports.getAvailableComponents = getAvailableComponents;
