import { memo } from '../../../lib/teact/teact';
import { getActions, getGlobal } from '../../../global';

import type { TabState } from '../../../global/types';

import { isOwnMessage } from '../../../global/helpers';
import { selectTheme } from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';

import useCurrentOrPrev from '../../../hooks/useCurrentOrPrev';
import useLastCallback from '../../../hooks/useLastCallback';
import useOldLang from '../../../hooks/useOldLang';
import useShowTransitionDeprecated from '../../../hooks/useShowTransitionDeprecated';

import Button from '../../ui/Button';

import styles from './OneTimeMediaModal.module.scss';

export type OwnProps = {
  modal: TabState['oneTimeMediaModal'];
};

const OneTimeMediaModal = ({
  modal,
}: OwnProps) => {
  const {
    closeOneTimeMediaModal,
  } = getActions();

  const lang = useOldLang();
  const message = useCurrentOrPrev(modal?.message, true);

  const {
    shouldRender,
    transitionClassNames,
  } = useShowTransitionDeprecated(Boolean(modal));


  const handleClose = useLastCallback(() => {
    closeOneTimeMediaModal();
  });

  if (!shouldRender || !message) {
    return undefined;
  }

  const isOwn = isOwnMessage(message);
  const theme = selectTheme(getGlobal());
  const closeBtnTitle = isOwn ? lang('Chat.Voice.Single.Close') : lang('Chat.Voice.Single.DeleteAndClose');

  function renderMedia() {
    if (!message?.content) {
      return undefined;
    }
    return undefined;
  }

  return (
    <div className={buildClassName(styles.root, transitionClassNames)}>
      {renderMedia()}
      <div className={styles.footer}>
        <Button
          faded
          onClick={handleClose}
          pill
          size="smaller"
          color={theme === 'dark' ? 'dark' : 'secondary'}
          className={styles.closeBtn}
        >
          {closeBtnTitle}
        </Button>
      </div>
    </div>
  );
};

export default memo(OneTimeMediaModal);
