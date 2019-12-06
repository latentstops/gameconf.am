import anime from 'animejs'
import charming from 'charming'
import filter from 'lodash/filter'
import Platform from '@/platform'

class AnimationUtils {
  showTitle (ref, duration = 250, stagger = 30, delay = 100, forceLetterSplitting = false) {
    if (!ref) {
      return
    }

    // let old = ref.innerHTML

    if (Platform.mobile && !forceLetterSplitting) {
      anime({
        targets: ref,
        translateY: ['30px', '0px'],
        opacity: [0, 1],
        duration: duration,
        delay: delay,
        easing: 'easeInOutQuad'
      })
    } else {
      charming(ref, { splitRegex: /(\s+)/, classPrefix: 'word', tagName: 'em' })
      let words = Array.from(ref.querySelectorAll('[class*="word"]', ref)) // eslint-disable-line

      words = filter(words, o => o.innerHTML !== ' ')

      words.forEach(function (word) {
        word.classList.add('overflow--hidden')
        charming(word, { classPrefix: 'letter', tagName: 'em' })
      })

      anime({
        targets: ref.querySelectorAll('[class*="letter"]', ref),
        translateY: ['-100px', '0px'],
        duration: duration,
        delay: anime.stagger(stagger, { start: delay }),
        easing: 'easeOutQuad'
        // complete: () => {
        //   // console.log('completed')

        //   // ref.innerHTML = old
        // }
      })
    }
  }

  showImage (ref, duration = 400, delay = 0) {
    if (!ref) {
      return
    }

    anime({
      targets: ref,
      translateY: ['80px', '0px'],
      rotateY: ['70deg', '0deg'],
      opacity: [0, 1],
      duration: duration,
      delay: delay,
      easing: 'easeInOutQuad'
    })
  }

  showText (ref, duration = 300, stagger = 2, delay = 150, permanent = false) {
    if (!ref) {
      console.log('no ref')
      return
    }

    if (Platform.mobile) {
      anime({
        targets: ref,
        translateY: ['30px', '0px'],
        opacity: [0, 1],
        duration: duration,
        delay: delay,
        easing: 'easeInOutQuad'
      })
    } else {
      charming(ref, { splitRegex: /([A-zÀ-ú]+[\s+|\D]|\s)/gm, classPrefix: 'word', tagName: 'em' })

      let wordsDom = ref.querySelectorAll('[class*="word"]', ref)

      for (let i = 0; i < wordsDom.length; i++) {
        if (wordsDom[i].innerHTML === '') {
          wordsDom[i].remove()
        }
      }

      let words = Array.from(wordsDom) // eslint-disable-line

      words = filter(words, o => {
        return (o.innerHTML !== ' ' && o.innerHTML.length > 0)
      })

      ref.classList.add('animated-text')

      anime({
        targets: words,
        translateY: ['30px', '0px'],
        opacity: [0, 1],
        duration: duration,
        delay: anime.stagger(stagger, { start: delay }),
        easing: 'easeInOutQuad'
      })
    }
  }

  resetSection (selector) {
    let animatedBlocks = selector.querySelectorAll('.animated-text')

    for (let i = 0; i < animatedBlocks.length; i++) {
      animatedBlocks[i].innerHTML = animatedBlocks[i].innerText
    }
  }

  showSvg (ref, duration = 300) {
    if (!ref) {
      return
    }

    anime({
      targets: ref,
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 1500,
      delay: (el, i) => i * 250,
      direction: 'alternate',
      loop: true,
      complete: () => {
        console.log('ok complete')
      }
    })
  }
}

export default new AnimationUtils()
