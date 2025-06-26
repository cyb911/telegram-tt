import { IS_IOS, IS_SAFARI } from '../util/browser/windowEnvironment';

if (IS_SAFARI || IS_IOS) {
  document.addEventListener('click', initializeSoundsForSafari, { once: true });
}
