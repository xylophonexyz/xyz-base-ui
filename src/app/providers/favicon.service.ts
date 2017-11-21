export class Favicon {
  static readonly defaultUrl = 'favicon.ico';
  static readonly querySelector = '#favicon';

  static setFavicon(url: string) {
    try {
      const favicon = document.documentElement.querySelector(Favicon.querySelector);
      favicon.setAttribute('href', url);
    } catch (e) {
      console.log('Server platform detected. Skipping setting of favicon');
    }
  }

  static resetFavicon() {
    try {
      const favicon = document.documentElement.querySelector(Favicon.querySelector);
      favicon.setAttribute('href', Favicon.defaultUrl);
    } catch (e) {
      console.log('Server platform detected. Skipping setting of favicon');
    }
  }
}
