// import { ScrollbarPlugin } from 'smooth-scrollbar'
// import Platform from '@/platform'
//
// const DIVISION_FACTOR = 2.2
//
// export default class DDDScrollbar extends ScrollbarPlugin {
//   static get pluginName () {
//     return 'DDDScrollbar'
//   }
//
//   static defaultOptions = {
//     enabled: false
//   }
//
//   transformDelta (delta, fromEvent) {
//     if (this.options.enabled) {
//       return {
//         x: 0,
//         y: (Platform.mobile) ? delta.y / (DIVISION_FACTOR / 2) : delta.y / DIVISION_FACTOR
//       }
//     } else {
//       return {
//         x: 0,
//         y: 0
//       }
//     }
//   }
//
//   // onRender (momentum) {
//   //   if (momentum.x === 0 && momentum.y === 0) {
//   //     console.log('not scrolling')
//   //   } else {
//   //     console.log('scrolling')
//   //   }
//   // }
// }
