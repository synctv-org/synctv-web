import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  easing: 'ease',
  speed: 500,
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.2
})

export const start = () => {
  NProgress.start()
}

export const close = () => {
  NProgress.done()
}
