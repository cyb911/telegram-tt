import type { FC } from '../../lib/teact/teact';
import { memo } from '../../lib/teact/teact';

import type { ApiSticker, ApiStickerSet } from '../../api/types';
import type { ObserveFn } from '../../hooks/useIntersectionObserver';

import { CHAT_HEIGHT_PX } from '../../config';
import buildClassName from '../../util/buildClassName';

import useLastCallback from '../../hooks/useLastCallback';
import useOldLang from '../../hooks/useOldLang';

import ListItem from '../ui/ListItem';

import './StickerSetCard.scss';

type OwnProps = {
  stickerSet?: ApiStickerSet;
  noPlay?: boolean;
  className?: string;
  observeIntersection: ObserveFn;
  onClick: (value: ApiSticker) => void;
};

const StickerSetCard: FC<OwnProps> = ({
  stickerSet,
  className,
  onClick,
}) => {
  const lang = useOldLang();

  const firstSticker = stickerSet?.stickers?.[0];

  const handleCardClick = useLastCallback(() => {
    if (firstSticker) onClick(firstSticker);
  });

  if (!stickerSet?.stickers) {
    return undefined;
  }

  return (
    <ListItem
      className={buildClassName('StickerSetCard', 'chat-item-clickable small-icon', className)}
      style={`height: ${CHAT_HEIGHT_PX}px;`}
      inactive={!firstSticker}
      onClick={handleCardClick}
    >
      <div className="multiline-item">
        <div className="title">{stickerSet.title}</div>
        <div className="subtitle">{lang('StickerPack.StickerCount', stickerSet.count, 'i')}</div>
      </div>
    </ListItem>
  );
};

export default memo(StickerSetCard);
