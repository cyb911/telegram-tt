import type { FC } from '../../../lib/teact/teact';
import {
  memo, useEffect, useRef,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type { ApiVideo } from '../../../api/types';

import { selectCurrentMessageList, selectIsChatWithSelf } from '../../../global/selectors';
import { IS_TOUCH_ENV } from '../../../util/browser/windowEnvironment';
import buildClassName from '../../../util/buildClassName';

import './GifPicker.scss';

type OwnProps = {
  className: string;
  loadAndPlay: boolean;
  canSendGifs?: boolean;
  onGifSelect?: (gif: ApiVideo, isSilent?: boolean, shouldSchedule?: boolean) => void;
};

type StateProps = {
  savedGifs?: ApiVideo[];
  isSavedMessages?: boolean;
};

const GifPicker: FC<OwnProps & StateProps> = ({
  className,
  loadAndPlay,
}) => {
  const { loadSavedGifs } = getActions();

  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (loadAndPlay) {
      loadSavedGifs();
    }
  }, [loadAndPlay, loadSavedGifs]);
  return (
    <div>
      <div
        ref={containerRef}
        className={buildClassName('GifPicker', className, IS_TOUCH_ENV ? 'no-scrollbar' : 'custom-scroll')}
      >
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const { chatId } = selectCurrentMessageList(global) || {};
    const isSavedMessages = Boolean(chatId) && selectIsChatWithSelf(global, chatId);
    return {
      savedGifs: global.gifs.saved.gifs,
      isSavedMessages,
    };
  },
)(GifPicker));
