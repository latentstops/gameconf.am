let MobileDetect = require('mobile-detect')
let md = new MobileDetect(window.navigator.userAgent)

let volumeTest = document.createElement('audio')
volumeTest.volume = 0.5
/**
 *
 * @type {{mobile: boolean, phone: boolean, tablet: boolean, android: boolean, ios: boolean, ipad: boolean, iphone: boolean, wphone: boolean, edge: boolean, firefox: boolean, ie11: boolean, safari: boolean, prerenderer: boolean, volume: boolean}}
 */
let Platform = {
  mobile: !!md.mobile(),
  phone: !!md.phone(),
  tablet: !!md.tablet(),
  android: !!md.is('AndroidOS'),
  ios: !!md.is('iOS'),
  ipad: !!md.is('iPad'),
  iphone: !!md.is('iPhone'),
  wphone: !!md.is('WindowsPhoneOS'),
  edge: !!/Edge\/\d+/i.test(window.navigator.userAgent),
  firefox: md.version('Gecko') > 1,
  ie11: !!/Trident.*rv:11\./i.test(window.navigator.userAgent),
  safari: /Safari/.test(window.navigator.userAgent) && /Apple Computer/.test(window.navigator.vendor),
  prerenderer: window['__PRERENDER_INJECTED'] !== undefined, // /PhantomJS/.test(window.navigator.userAgent),
  volume: volumeTest.volume === 0.5
}

export default Platform
