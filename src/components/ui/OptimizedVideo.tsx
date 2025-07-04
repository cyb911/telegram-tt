import type { ElementRef } from '../../lib/teact/teact';
import type React from '../../lib/teact/teact';
import { memo, useMemo, useRef } from '../../lib/teact/teact';

import useBuffering from '../../hooks/useBuffering';
import useLastCallback from '../../hooks/useLastCallback';
import useSyncEffect from '../../hooks/useSyncEffect';
import useVideoCleanup from '../../hooks/useVideoCleanup';

type VideoProps = React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;

type OwnProps =
  {
    ref?: ElementRef<HTMLVideoElement>;
    isPriority?: boolean;
    canPlay: boolean;
    children?: React.ReactNode;
    onReady?: NoneToVoidFunction;
    onBroken?: NoneToVoidFunction;
  }
  & VideoProps;

function OptimizedVideo({
  ref,
  isPriority,
  canPlay,
  children,
  onReady,
  onBroken,
  onTimeUpdate,
  ...restProps
}: OwnProps) {
  const localRef = useRef<HTMLVideoElement>();
  if (!ref) {
    ref = localRef;
  }
  const isReadyRef = useRef(false);
  const handleReady = useLastCallback(() => {
    if (!isReadyRef.current) {
      onReady?.();
      isReadyRef.current = true;
    }
  });

  // This is only needed for browsers not allowing autoplay
  const { isBuffered, bufferingHandlers } = useBuffering(true, onTimeUpdate, onBroken);
  const { onPlaying: handlePlayingForBuffering, ...otherBufferingHandlers } = bufferingHandlers;
  useSyncEffect(([prevIsBuffered]) => {
    if (prevIsBuffered === undefined) {
      return;
    }

    handleReady();
  }, [isBuffered, handleReady]);

  const handlePlaying = useLastCallback((e) => {
    handlePlayingForBuffering(e);
    handleReady();
    restProps.onPlaying?.(e);
  });

  const mergedOtherBufferingHandlers = useMemo(() => {
    const mergedHandlers: Record<string, AnyFunction> = {};
    Object.keys(otherBufferingHandlers).forEach((keyString) => {
      const key = keyString as keyof typeof otherBufferingHandlers;
      mergedHandlers[key] = (event: Event) => {
        restProps[key as keyof typeof restProps]?.(event);
        otherBufferingHandlers[key]?.(event);
      };
    });

    return mergedHandlers;
  }, [otherBufferingHandlers, restProps]);

  useVideoCleanup(ref, mergedOtherBufferingHandlers);

  return (

    <video ref={ref} autoPlay {...restProps} {...mergedOtherBufferingHandlers} onPlaying={handlePlaying}>
      {children}
    </video>
  );
}

export default memo(OptimizedVideo);
