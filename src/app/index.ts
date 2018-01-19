import {InjectionToken} from '@angular/core';
import {Component} from './models/component';
import {ComponentCollection} from './models/component-collection';
import {Composition} from './models/composition';
import {User} from './models/user';

export const ORIGIN_URL = new InjectionToken<string>('ORIGIN_URL');
export const APPLICATION_NAME = new InjectionToken<string>('APPLICATION_NAME');

/** A simple type to make AuthService methods clear */
export type AuthorizationCode = string;

/**
 * The ComponentCollection types recognized by the API.
 */
export type CanonicalComponentCollectionType = 'ComponentCollection';

/**
 * The Component types recognized by the API.
 */
export type CanonicalComponentType = 'Component' | 'ImageComponent' | 'AudioComponent' | 'VideoComponent';

/**
 * Page Navigation Types. Can be internally pointing pages, or external urls (also #hashbangs)
 */
export enum PageNavigationItemNavigationStrategy {
  Internal = 'INTERNAL',
  External = 'EXTERNAL'
}

/**
 * Page Navigation Types. Can be internally pointing pages, or external urls (also #hashbangs)
 */
export type PageNavigationType = PageNavigationItemNavigationStrategy.Internal | PageNavigationItemNavigationStrategy.External;

/**
 * The payload type for messages transmitted via MessageChannelService
 */
export interface MessageChannelPayload {
  topic: string;
  data: any;
}

/**
 * Binding strategies for content editable elements. Can either be set to use innerText value or the innerHTML value of
 * the underlying DOM node.
 */
export enum ContentEditableBindingStrategy {
  TextContent = 'innerText',
  HtmlContent = 'innerHTML'
}

/**
 *
 */
export enum ComponentStatus {
  LOADING = 'LOADING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED'
}

/**
 * Enum of ComponentCollection types recognized locally by this app instance
 */
export enum LocalComponentTypes {
  ComponentCollection = 'ComponentCollection',
  Text = 'Text',
  ImageCollection = 'ImageCollection',
  Embed = 'Embed',
  Spacer = 'Spacer',
  Hero = 'Hero',
  FreeFormHtml = 'FreeFormHtml'
}

/**
 * The ComponentCollection types recognized locally by this app instance.
 */
export type LocalComponentType =
  'ComponentCollection'
  | 'Text'
  | 'ImageCollection'
  | 'Embed'
  | 'Spacer'
  | 'Hero'
  | 'FreeFormHtml';

export enum LoginType {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}

/**
 * A simple interface to define the types of components that are available to this app instance
 */
export interface AvailableComponent {
  icon: string;
  text: string;
  type: CanonicalComponentCollectionType;
  metatype: LocalComponentType;
}

/**
 * The format of the data expected by the API to create a Composition object
 */
export interface CompositionParams {
  title?: string;
  add_cover?: boolean;
  remove_cover?: boolean;
  publish?: boolean;
  metadata?: CompositionMetadata;
}

/**
 * The format of the data expected by the API to create a Page object
 */
export interface PageParams {
  title?: string;
  description?: string;
  published?: boolean;
  composition_id?: number;
  metadata?: any;
}

/**
 * The format of the OAuth response as returned by the xyz api
 */
export interface OAuthToken {
  /**
   * the access token
   */
  access_token: string;
  /**
   * token type. typically "Bearer"
   */
  token_type: string;
  /**
   * the number of seconds from "created_at" that this access token will expire
   */
  expires_in: number;
  /**
   * the time of creation of this access token
   */
  created_at: number;
  /**
   * a token used to reauth without using an authorization code
   */
  refresh_token: string;
}

/**
 * The structure of the user object returned by the xyz backend
 */
export interface UserDataInterface {
  id: number;
  email: string;
  bio: string;
  first_name: string;
  last_name: string;
  username: string;
  created_at: number;
  followers: UserDataInterface[];
  following: UserDataInterface[];
  metadata: any;
  type: string;
  session: any;
  avatar: { url: string };
  errors?: any[];
}

/**
 * the format of the data returned by the api
 */
export interface CompositionDataInterface {
  id: number;
  title: string;
  published: boolean;
  published_on: number;
  created_at: number;
  updated_at: number;
  parent: CompositionDataInterface;
  cover: any;
  metadata: any;
  compositions: CompositionDataInterface[];
  pages: PageDataInterface[];
  errors?: any[];
}

/**
 * the format of the data returned by the api
 */
export interface PageDataInterface {
  id: number;
  title: string;
  description: string;
  created_at: number;
  updated_at: number;
  published: boolean;
  cover: any;
  components: ComponentCollectionDataInterface<ComponentMedia, ComponentMetadata>[];
  guessed_title: string;
  session: any;
  rating: number;
  comment_count: number;
  views: number;
  nods: any[];
  metadata: any;
  user_id: number;
  user?: UserDataInterface;
  composition_id: number;
  composition?: CompositionDataInterface;
  tags: any[];
  errors?: any[];
}

/**
 * the format of the data returned by the api
 */
export interface ComponentDataInterface<T1 = ComponentMedia, T2 = ComponentMetadata> {
  id: number;
  index: number;
  type: string;
  media: T1;
  media_processing: boolean;
  component_collection_id: number;
  metadata: T2;
  created_at: number;
  updated_at: number;
}

/**
 * Generic type to define component's embedded media objects
 */
export type ComponentMedia = any;

/**
 * Generic type to define component's embedded metadata definition
 */
export interface ComponentMetadata {
  bgColor: string;
  layout: string;
  padding: number;
  paletteColor: string;
  textSize: number;
}

/**
 * Define metadata type for SectionComponents
 */
export interface SectionComponentMetadata {
  bgColor: string;
  layout: string;
  padding: number;
  paletteColor: string;
  textSize: number;
  bgImage: ComponentCollectionDataInterface<ImageComponentMedia, ComponentMetadata>;
  title: string;
  subtitle: string;
}

/**
 * Define media type for ImageComponents
 */
export interface ImageComponentMedia {
  original?: { url: string };
  transcoding?: {
    blur: TranscodingResponse[];
    image: TranscodingResponse[];
    thumb: TranscodingResponse[];
  };
  upload?: any;
  url?: string;
  error?: any;
}

/**
 * the format of the data returned by the api
 */
export interface ComponentCollectionDataInterface<T1 = ComponentMedia, T2 = ComponentMetadata> {
  id: number;
  type: CanonicalComponentCollectionType;
  metadata: any;
  index: number;
  components: ComponentDataInterface<T1, T2>[];
  collectible_id: number;
  collectible_type: string;
  created_at: number;
  updated_at: number;
}

/**
 * The user model used internally by the app
 */
export interface UserInterface {
  readonly id: number;
  readonly email: string;
  readonly bio: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly username: string;
  readonly createdAt: Date;
  readonly followers: User[];
  readonly following: User[];
  readonly metadata: any;
  readonly type: string;
  readonly session: any;
  readonly avatar: string;

  hasAvatar(): boolean;

  asJson(): UserDataInterface;
}

/**
 * The Page model used internally by the app
 */
export interface PageInterface {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly published: boolean;
  readonly cover: any;
  readonly components: ComponentCollection[];
  readonly bestGuessTitle: string;
  readonly session: any;
  readonly rating: number;
  readonly commentCount: number;
  readonly views: number;
  readonly nods: any[];
  readonly metadata: any;
  readonly userId: number;
  readonly compositionId: number;
  readonly composition: Composition;
  readonly tags: any[];
  readonly errors?: any[];

  asJson(): PageDataInterface;

  hasCover(): boolean;

  hasHeader(): boolean;
}

/**
 * The Component model (for building UI components) used internally by the app
 */
export interface ComponentInterface<T1, T2> {
  readonly id: number;
  readonly index: number;
  readonly type: string;
  readonly media: T1;
  readonly mediaIsProcessing: boolean;
  readonly componentCollectionId: number;
  readonly metadata: T2;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TranscodingResponse {
  basename: string;
  cost: number;
  ext: string;
  field: any;
  from_batch_import: boolean;
  id: string;
  is_tus_file: boolean;
  md5hash: string;
  meta: any;
  mime: string;
  name: string;
  original_basename: string;
  original_id: string;
  original_md5hash: string;
  original_path: string;
  queue: string;
  size: number;
  ssl_url: string;
  tus_upload_url: string;
  type: string;
  url: string;
}

/**
 * The ComponentCollection model that holds collections of Components; this interface is used to define the model
 * used internally by the app.
 */
export interface ComponentCollectionInterface {
  readonly id: number;
  readonly index: number;
  readonly type: string;
  readonly collectibleId: number;
  readonly collectibleType: string;
  readonly components: Component[];
  readonly metadata: any;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * The metadata model used by the Page class
 */
export interface PageMetadata {
  index: number;
  showNav: boolean;
  hasTransparentHeader: boolean;
  navigationItem: boolean;
  navigationType?: PageNavigationType;
  navigationHref?: string;
}

/**
 * The metadata model used by the Composition class
 */
export interface CompositionMetadata {
  theme: {
    primaryColor: string;
    headerColor: string;
    headerHoverColor: string;
  };
  showLogoInHeader: boolean;
  hasHeaderShadow: boolean;
  hasTabbedNav: boolean;
  customDomain?: CompositionCustomDomain;
  favicon?: ComponentCollectionDataInterface<ImageComponentMedia, ComponentMetadata>;
}

/**
 * The Composition model used internally by the app. Known throughout the app as a "Site"
 */
export interface CompositionInterface {
  readonly id: number;
  readonly title: string;
  readonly published: boolean;
  readonly publishedOn: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly parent: Composition;
  readonly cover: any;
  readonly sites: Composition[];
  readonly pages: any[];
  readonly metadata: CompositionMetadata;

  asJson(): CompositionDataInterface;

  hasCover(): boolean;
}

export interface EnvironmentConfig {
  PORT: number;
  API_ENDPOINT: string;
  API_VERSION: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  REDIRECT_URI: string;
  SU_SCOPE: string;
  HOST: string;
}

/**
 * The model used to represent custom domains
 */
export interface CompositionCustomDomain {
  zoneId: string;
  domainName: string;
  selfManagedDns: boolean;
  nameServers?: string[];
  domainMappings?: string[];
  requiredDnsRecords?: string[];
}

/**
 * Structure of the response returned when adding a custom domain. This is a multi-part process, the response payload
 * reflects each part of the process, hence the fields below.
 */
export interface CreateZoneResponse {
  createZoneResult: any;
  addRootDnsResult: any;
  addWwwDnsResult: any;
  enableAlwaysUseHttpsResult: any;
}
