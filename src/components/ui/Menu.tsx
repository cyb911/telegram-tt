import type {
  ElementRef } from '../../lib/teact/teact';
import type React from '../../lib/teact/teact';
import {
  beginHeavyAnimation,
  type FC, memo, useEffect, useRef,
} from '../../lib/teact/teact';

import { IS_BACKDROP_BLUR_SUPPORTED } from '../../util/browser/windowEnvironment';
import buildClassName from '../../util/buildClassName';
import captureEscKeyListener from '../../util/captureEscKeyListener';

import useAppLayout from '../../hooks/useAppLayout';
import useEffectWithPrevDeps from '../../hooks/useEffectWithPrevDeps';
import useHistoryBack from '../../hooks/useHistoryBack';
import useKeyboardListNavigation from '../../hooks/useKeyboardListNavigation';
import useLastCallback from '../../hooks/useLastCallback';
import useShowTransition from '../../hooks/useShowTransition';
import useVirtualBackdrop from '../../hooks/useVirtualBackdrop';

import Portal from './Portal';

import './Menu.scss';

type OwnProps =
  {
    ref?: ElementRef<HTMLDivElement>;
    isOpen: boolean;
    shouldCloseFast?: boolean;
    id?: string;
    className?: string;
    bubbleClassName?: string;
    ariaLabelledBy?: string;
    autoClose?: boolean;
    footer?: string;
    noCloseOnBackdrop?: boolean;
    backdropExcludedSelector?: string;
    noCompact?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<any>) => void;
    onCloseAnimationEnd?: () => void;
    onClose: () => void;
    onMouseEnter?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseEnterBackdrop?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    withPortal?: boolean;
    children?: React.ReactNode;
  };

const ANIMATION_DURATION = 200;

const Menu: FC<OwnProps> = ({
  ref: externalRef,
  shouldCloseFast,
  isOpen,
  id,
  className,
  bubbleClassName,
  ariaLabelledBy,
  children,
  autoClose = false,
  footer,
  noCloseOnBackdrop = false,
  backdropExcludedSelector,
  noCompact,
  onCloseAnimationEnd,
  onClose,
  onMouseEnter,
  onMouseLeave,
  withPortal,
  onMouseEnterBackdrop,
  ...positionOptions
}) => {
  const { isTouchScreen } = useAppLayout();

  const containerRef = useRef<HTMLDivElement>();

  const { ref: bubbleRef } = useShowTransition({
    isOpen,
    ref: externalRef,
    onCloseAnimationEnd,
  });

  useEffect(
    () => (isOpen ? captureEscKeyListener(onClose) : undefined),
    [isOpen, onClose],
  );

  useHistoryBack({
    isActive: isOpen,
    onBack: onClose,
    shouldBeReplaced: true,
  });

  useEffectWithPrevDeps(([prevIsOpen]) => {
    if (isOpen || (!isOpen && prevIsOpen === true)) {
      beginHeavyAnimation(ANIMATION_DURATION);
    }
  }, [isOpen]);

  const handleKeyDown = useKeyboardListNavigation(bubbleRef, isOpen, autoClose ? onClose : undefined, undefined, true);

  useVirtualBackdrop(
    isOpen,
    containerRef,
    noCloseOnBackdrop ? undefined : onClose,
    undefined,
    backdropExcludedSelector,
  );

  const bubbleFullClassName = buildClassName(
    'bubble menu-container custom-scroll',
    footer && 'with-footer',
    bubbleClassName,
    shouldCloseFast && 'close-fast',
  );

  const handleClick = useLastCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (autoClose) {
      onClose();
    }
  });

  const menu = (
    <div
      ref={containerRef}
      id={id}
      className={buildClassName(
        'Menu',
        !noCompact && !isTouchScreen && 'compact',
        !IS_BACKDROP_BLUR_SUPPORTED && 'no-blur',
        withPortal && 'in-portal',
        className,
      )}
      aria-labelledby={ariaLabelledBy}
      role={ariaLabelledBy ? 'menu' : undefined}
      onKeyDown={isOpen ? handleKeyDown : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={isOpen ? onMouseLeave : undefined}
    >
      {isOpen && (
        // This only prevents click events triggering on underlying elements
        <div
          className="backdrop"
          onMouseEnter={onMouseEnterBackdrop}
        />
      )}
      <div
        role="presentation"
        ref={bubbleRef}
        className={bubbleFullClassName}
        onClick={handleClick}
      >
        {children}
        {footer && <div className="footer">{footer}</div>}
      </div>
    </div>
  );

  if (withPortal) {
    return <Portal>{menu}</Portal>;
  }

  return menu;
};

export default memo(Menu);
