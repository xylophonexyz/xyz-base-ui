# Custom Builds
`xyz-base-ui` is designed to be extensible and offers a number of features around specfic builds with custom features.
In order to get started with a custom build, you may want to change the colors, title, and branding images used throughout.

## Changing default images and favicon

The logo should be changed in the following locations:
- `src/favicon.ico`
- `src/favicon.png`
- `src/apple-touch-icon.png`
- `src/apple-touch-icon-precomposed.png`
- `src/android-chrome-96x96.png`
- `src/mstile-150x150.png`

The default placeholder images can be changed here:
- `src/assets/img/no-avatar.png` (this is the image used for users without an avatar)
- `src/assets/img/placeholder.svg` (this is the image used for sites/pages without a cover image)
- `src/assets/img/smpte.jpg` (this is the image used for images that failed to upload properly)
- `src/assets/img/splash.jpg` (this is the image used for the login screen/splash page)

Colors used throughout the app can be changed here:
- `src/app/theme/colors.scss`

## Changing the title
The title of the application should be changed in two places:
- `src/app/app.module.ts` in `getAppTitleFactory()`
- `src/index.html` within the `<title></title>` tag

## Changing the SplashScreen
The splash screen is the entry point to the application and may contain marketing material specific to the
custom version of the app. In addition to changing the splash image, `splash.jpg` you may want to change the 
headline and subhead. This can be done in `splash-screen.component.ts`

- `src/app/components/splash-screen.component.ts`
  - update `headline` and `subhead` in the `ngOnInit()` method.
  
You may also modify this component entirely by modifying the HTML. If doing so, it is recommended to preserve lines
1-20, as these lines contain the logic for displaying the login form in a modal, unless you would like to customize
the login experience.

## Adding custom components
It is possible to extend the functionality provided by the app with your own components. Adding a component is not
hard, and there are some base classes you can inherit from that do a lot of the heavy lifting. Here is the process
for defining your own component.

- Modify `src/available-components.ts`. This file holds the definition for what Components are available to the 
end user for editing their pages. You may disable certain components by removing them from this file.

  - There is a typescript interface for `AvailableComponent` in `src/app/index.ts`. I suggest looking at this
  to get an idea of how to add a new component to `available-components.ts`;
  - The `CanonicalComponentCollectionType`, and `CanonicalComponentType` are types recognized by the 
  API and should not be changed. The API will reject unknown types.
  - The `LocalComponentType` are types recognized by the UI application. These may be changed, but it is up to your
  application code to recognize the different types and do something with them. I suggest only adding new types to
  this, and not modifying any of the existing types.
  - The components that are sent back may change based on who the logged in user is who is requesting access.
  For example, `premium subscribers` or admins may have access to features that free/lower tier users do not. In progress.
  
- Add a new component class that inherits from `UIComponent`, `ConfigurableUIComponent`, or `ConfigurableUIComponentWithToolbar`
  - This component class will contain its own template that can be defined however you wish. You may use the `layout()` 
  method to get the current layout and modify the template accordingly.
  
- Modify `component-collection.component.ts` to include the newly defined component as one of its @ViewChildren
  - Add the new component as an instance variable
  - e.g. `@ViewChildren(MyNewComponent) newComponents: QueryList<MyNewComponent>;`
  - Modify `allComponentCollectionViewChildren` to include this new component
  - e.g. 
  ```typescript
    allComponentCollectionViewChildren() {
      return [].concat(this.sectionComponents.map(c => c))
        .concat(this.textComponents.map(c => c))
        .concat(this.imageComponents.map(c => c))
        .concat(this.embedComponents.map(c => c))
        .concat(this.spacerComponents.map(c => c))
        .concat(this.newComponents.map(c => c)); // added here
    }
  ```
- Modify `component-collection.component.html` to include the new component template
  - Assuming we have created a new angular component with a template, e.g. MyNewUIComponent and `my-new-ui-component.component.html`
  - Assuming we added a new component to `available-components.ts` and gave it a unique MetaType of `NewComponent`
  - Add an additional `ngSwitchCase` that utilizes the "MetaType" you defined in `available-components.ts`
  - e.g.
  ```angular2html
    <div *ngSwitchCase="'NewComponent'">
      <app-new-component-component *ngFor="let component of componentCollection.components"
                              [component]="component"
                              [page]="page"
                              [editable]="editable"
                              [showOptions]="childShouldShowOptions">
      </app-new-component-component>
    </div>
  ```
  Notice that compared to the others, we only changed the name of the component `app-new-component-component`, 
  and the string value given to the `ngSwitchCase` directive. It is recommended to keep all other bindings the same.

## Environment Variables
The following environment variables are required to run the project. These can go in a .env file
at the root of the project, or set by the runtime executing the application code.

Here is an example .env file: 
```angular2html
API_ENDPOINT=http://localhost:3000
API_VERSION=v1
CLIENT_ID=***
CLIENT_SECRET=***
HOST=https://localhost:4200
REDIRECT_URI=http://localhost:4200/callback/email
SU_SCOPE=****
MEMCACHED_URL=http://localhost:11211
```

- `API_ENDPOINT` refers to the `xyz-base` api instance this ui will connect to
- `API_VERSION` refers to the version of the api to use
- `CLIENT_ID` refers to the client id of this ui app instance
- `CLIENT_SECRET` refers to the client secret of this ui app instance. 
- `HOST` refers to the DNS name or IP address of this ui instance. This is used for server side rendering
- `REDIRECT_URI` refers to the redirect uri registered via the OAuth client registration with the API.
- `SU_SCOPE` refers to the scope that allows the UI access to create users.
- `MEMCACHED_URL` refers to the caching server that is used to cache templates rendered by the server. Not required, 
but it speeds up page requests drastically.

## OAuth Notes
The UI is an OAuth consumer, the API is an OAuth provider. Users are also OAuth consumers. 
The UI is essentially a proxy for user behaviors against the API when there is an Authorization header present in the
requests that go out from the UI. If no Authorization header is provided, the UI will fill in with its own 
Authorization header which has limited privileges, e.g. it can only access public data. Access to private user data
is protected by the API, and a 403 will be returned if the requestor does not have access. The only privilege the UI
"client app" has is provided through the `SU_SCOPE` which stands for "Super User Scope". This scope provides privileges
to create users and perform other admin related functionality, however, it does not allow for retrieval of private
user data.

## Building
The build is mostly self contained and should work on systems that have the correct dependencies installed. For this
reason this application uses yarn to lock down versions of dependencies. 

### Prerequisites
- Install nodejs https://nodejs.org/en/
- Install yarn https://yarnpkg.com/en/docs/install

### Build Steps
The build process can be broken down into the following steps:
- `yarn install` - installs the dependencies for the project
- `npm run build:full` - run a full production build

#### Build Notes
`npm run build:full` builds a browser module and a server module using 
Ahead of Time Compilation. It also minifies the output. The complete build will be output to the `dist` directory. That
directory includes a `browser` folder, which should be the source of assets for requests (i.e. when setting up an
express app, serve files from this directory). It also includes a `server` directory, which holds the compiled
code that will be used by the ngUniversalExpressEngine to render angular templates and serve them to the client. To run
the app, run the server file from `dist/server/server.js`

### Running
To run the app, assuming all of the environment variables are present, and a healthy xyz-api instance is available
issue the following command:

```
npm start
```

## Encrypting Environment Variables for Travis Deployment
This is useful when running builds and deployment from a CI system such as travis. Doing this will allow you to define
your environment variables in a file, encrypt that file, and then unpack and use that definitions file in a Docker
build or something of the like. The alternative is to define the environment variables on the system that will be
running the application. I find doing it this way is useful because I can move the application from one environment
to another much more easily.

Package:
```bash
tar -czf .deployment-credentials.tar.gz xyz-base-0db172f7ba1c.json .env.production
```
Encrypt:
```
travis encrypt-file .deployment-credentials.tar.gz --add
```
Unpack:
```bash
tar -xzf .deployment-credentials.tar.gz
```

## Example - Adding a custom component
Lets say we want to add a new component type, `HTMLComponent` that allows a user to write custom HTML and have that
displayed on their page.

- Add an option to the UI to display this new component by adding it to `available-components.ts`:

`src/assets/available-components.ts`
```json
[
  {
    "icon": "layers",
    "text": "Section",
    "type": "ComponentCollection",
    "metatype": "Hero"
  },
  {
    "icon": "type",
    "text": "Text",
    "type": "ComponentCollection",
    "metatype": "Text"
  },
  {
    "icon": "image",
    "text": "Image",
    "type": "ComponentCollection",
    "metatype": "ImageCollection"
  },
  {
    "icon": "hash",
    "text": "Embed",
    "type": "ComponentCollection",
    "metatype": "Embed"
  },
  {
    "icon": "more-horizontal",
    "text": "Empty Space",
    "type": "ComponentCollection",
    "metatype": "Spacer"
  },
  {
    "icon": "code",
    "text": "HTML",
    "type": "ComponentCollection",
    "metatype": "FreeFormHtml"
  }
]
```

Notice the addition at the end, we will call our new Component `FreeFormHtml`. This will be our `MetaType`, so we
will add it to our type definition:

`src/app/index.ts`
```typescript
export type LocalComponentType = 'FreeFormHtml' | 'ComponentCollection' | 'Text' | 'ImageCollection' | 'Embed' | 'Spacer' | 'Hero';
```
We can now use this type to discern this component from others within our code.

The next step is to define a Component class that will handle the view/render logic for this new component.
Create a new angular component that inherits from UIComponent.

```bash
ng g component FreeFormHtmlComponent
```
You will end up with a name like `free-form-html-component.component.ts`, which is a mouthful. Just keep in mind the
difference between xyz components and angular components.

This new component class should inherit from either `UIComponent`, `ConfigurableUIComponent`, or `ConfigurableUIComponentWithToolbar`

- `UIComponent` defines a number of lifecycle hooks for editing, saving, and viewing a component. It also contains
some hooks that can be implemented to get access to certain pieces of functionality. Those will be covered below.
- `ConfigurableUIComponent` inherits from `UIComponent` but provides some basic getters for commonly used configration
options such as padding, and event handlers for preventing event propagation when editing a components configurable
fields. For clarity, a Configurable Component refers to the fact that this component will add additional customization
options to the application footer when in edit mode. These extra options are user defined values, such as hex codes
for color values, titles, etc. See `FooterDelegateService` and `FooterComponent` for more info.
- `ConfigrableUIComponentWithToolbar` inherits from `ConfigurableUIComponent`, but is designed to be used by components
that make use of the RichTextEditor provided via the `XzRichTextDirective`. `textEditorToolbarOptions` may be overriden
to provide custom options to the text editor's toolbar. If toolbar functionality is not required or differs from what
is offered by this class, it is recommended to inherit from `ConfigurableUIComponent` and define your own toolbar options.
See `text-component.component.ts` and `section-component.component.ts` for examples.

Overrides and Hooks:

- `get layout()` 
Provide the current layout. This is overridden only to provide the specific type def that is returned for the 
synthesized component. Call `super.getLayout()` to get the actual stored layout from the component's metadata.
- `set layout(layout)`
Set the layout. This is overriden only to provide the specific type definition for the component. Call 
`super.setLayout(layout)` to store the layout in the component's metadata.
- `layoutOptions()`
Implement the `layoutOptions()` to provide any number of layout configurations your new component can take. For example,
an image might be full width, half width, etc. It is up to you to define the CSS and and template styles for the
layoutOption you are defining. For our custom HTML component, we only need one layout option, and that will cover the
screen full width.
- `fallbackLayout()`
Implemented by subclass to return a fallback layout for the component when no layout is currently defined in its 
metadata.
- `configuration()`
Implemented by subclasses to provide configuration options that get added to the footer
- `didGetMessage()`
Implemented by subclasses to act on inter-class messages sent through MessageChannelService.

Of course, any method within `UIComponent` can be overridden when inheriting from that class, but it is not 
recommended to do so until you get acquainted with the code and know what you are doing. There are several important
lifecycle considerations, such as auto-save, which need to be maintained if overriding any of those methods. Please
proceed with caution if you are overriding any methods other than the ones listed above.

So our `free-form-html-component.component.ts` might look something like this:

```typescript
import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NavActionItem} from '../../models/nav-action-item';
import {getHexColorString} from '../../util/colors';
import {ConfigurableUIComponent, UIComponent} from '../component/component.component';

export enum FreeFormHtmlLayoutOption {
  FullWidth = 'FullWidth',
}

@Component({
  selector: 'app-free-form-html-component',
  templateUrl: './free-form-html.component.html',
  styleUrls: ['./free-form-html.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIFreeFormHtmlComponent extends ConfigurableUIComponent {
  /**
  * provide no toolbar options. There will be no formatting of the HTML code the user enters
  */
  textEditorToolbarOptions: StringMap = [];
  /**
  * Generate a text preview of the HTML. For use in server side rendering.
  */
  htmlPreview: string = '';
  
  get htmlModel(): any {
    return this.component.media;
  }
  
  htmlDidChange(html: any) {
    this.component.media = html;
    this.ref.markForCheck();
  }
  
  get layoutOptions(): [FreeFormHtmlLayoutOption] {
    return [
      FreeFormHtmlLayoutOption.FullWidth,
    ];
  }

  get layout(): FreeFormHtmlLayoutOption {
    return super.getLayout();
  }

  set layout(layout: FreeFormHtmlLayoutOption) {
    this.setLayout(layout);
  }

  configuration(): NavActionItem[] {
    return [];
  }

  isInFocus(): boolean {
    return this.showOptions;
  }
  
  isEditable(): boolean {
    return this.editable;
  }
  
  getHtml(): string {
    return XzRichTextDirective.textContent(this.component.media);
  }

  protected fallbackLayout(): FreeFormHtmlLayoutOption {
    return FreeFormHtmlLayoutOption.FullWidth;
  }
}
```

Notice we don't define configuration options. This is because we dont need to bind any user input configuration
from input fields in the footer. Instead, we are going to use a flag given to us to determine if the component is
in focus to decide whether we will show a text field that the user can use to write HTML or show the actual HTML

Here is the template:
`free-form-html-component.component.html`

```angular2html
<section class="section has-text-centered">
  <div class="container" *ngIf="isInFocus()">
    <pre [xzRichTextModel]="htmlModel"
              (xzRichTextModelChange)="htmlDidChange($event)"
              (xzTextPreview)="htmlPreview = $event"
              [xzRichTextEnabled]="isEditable()"
              [xzRichTextEditorToolbarOptions]="textEditorToolbarOptions"
              xzRichTextPlaceholderText="Title..."></pre>
  </div>
  <div class="container" *ngIf="!isInFocus()" [innerHTML]="getHtml()">
  </div>
</section>
```
`editable` and `showOptions` are bindings provided to us by `UIComponent` and are passed down from the parent
component collection. These can be seen in the methods `isInFocus()` and `isEditable()`

Finally, we modify `component-collection.component.ts` and `component-collection.component.html` to reflect the
addition of this new component.

`component-collection.component.ts`
```typescript
...
// excerpt
export class UIComponentCollectionComponent {

  @ViewChildren(UISectionComponent) sectionComponents: QueryList<UISectionComponent>;
  @ViewChildren(UITextComponent) textComponents: QueryList<UITextComponent>;
  @ViewChildren(UIImageComponent) imageComponents: QueryList<UIImageComponent>;
  @ViewChildren(UISpacerComponent) spacerComponents: QueryList<UISpacerComponent>;
  @ViewChildren(UIEmbedComponent) embedComponents: QueryList<UIEmbedComponent>;
  @ViewChildren(UIFreeFormHtmlComponent) htmlComponents: QueryList<UIFreeFormHtmlComponent>;

  @Input() page: Page;
  @Input() componentCollection: ComponentCollection;
  @Input() editable = false;
  childShouldShowOptions = false;

  constructor(private pagesService: PagesService,
              private footer: FooterDelegateService,
              private componentCollectionService: ComponentCollectionService) {
  }

  /**
   * Return all of the ViewChildren ComponentCollections that are resizable.
   * @returns {any[]}
   */
  allComponentCollectionViewChildren() {
    return [].concat(this.sectionComponents.map(c => c))
      .concat(this.textComponents.map(c => c))
      .concat(this.imageComponents.map(c => c))
      .concat(this.embedComponents.map(c => c))
      .concat(this.spacerComponents.map(c => c))
      .concat(this.htmlComponents.map(c => c));
  }
  
  ...
```

`component-collection.component.html`
```angular2html
... excerpt
<div *ngSwitchCase="'Embed'">
    <app-embed-component *ngFor="let component of componentCollection.components"
                         [component]="component"
                         [page]="page"
                         [editable]="editable"
                         [showOptions]="childShouldShowOptions">
    </app-embed-component>
  </div>
  <div *ngSwitchCase="'Spacer'">
    <app-spacer-component *ngFor="let component of componentCollection.components"
                          [component]="component"
                          [page]="page"
                          [editable]="editable"
                          [showOptions]="childShouldShowOptions">
    </app-spacer-component>
  </div>
  <div *ngSwitchCase="'FreeFormHtml'">
      <app-free-form-html-component *ngFor="let component of componentCollection.components"
                            [component]="component"
                            [page]="page"
                            [editable]="editable"
                            [showOptions]="childShouldShowOptions">
      </app-free-form-html>
    </div>
    ...
```

And that is it. The FreeFormHtml component is now available to the editor and can be used immediately. The backend
will accept this change because it doesnt care what the type is as long as it sees "ComponentCollection" as the
container type and "Component" as the child type. The "MetaType" is stored inside the metadata of the component
collection and is only recognized by the version of the app with your changes.
