import * as React from 'react';
import Box, { BoxProps } from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';

const Root = (props: BoxProps) => (
  <Box
    {...props}
    sx={[
      {
        bgcolor: 'background.bodyEmail',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(64px, 200px) minmax(450px, 1fr)',
          md: 'minmax(160px, 300px) minmax(300px, 500px) minmax(500px, 1fr)',
        },
        gridTemplateRows: '64px 1fr',
        minHeight: '100vh',
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
);

const Header = (props: BoxProps) => (
  <Box
    component="header"
    className="Header"
    {...props}
    sx={[
      {
        p: 2,
        gap: 2,
        bgcolor: 'background.componentBg',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gridColumn: '1 / -1',
        gridRow: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
);

const SideNav = (props: BoxProps) => (
  <Box
    component="nav"
    className="Navigation"
    {...props}
    sx={[
      {
        gridColumn: { sm: 1 },
        gridRow: 2,
        p: 2,
        bgcolor: 'background.componentBg',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflowY: 'auto',
        minHeight: 0,
        display: {
          xs: 'none',
          sm: 'block',
        },
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
);

export type SidePaneProps = BoxProps & {
  /** When set, shows the pane as a bottom sheet on viewports below `md`. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const DISMISS_DISTANCE_PX = 72;
const DISMISS_VELOCITY_PX_MS = 0.45;

function useBottomSheetSwipe(
  mobileOpen: boolean,
  onMobileClose: (() => void) | undefined,
  paneRef: React.RefObject<HTMLDivElement | null>
) {
  const [dragY, setDragY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const touchRef = React.useRef<{
    startY: number;
    startTime: number;
    fromHandle: boolean;
    scrollTopAtStart: number;
  } | null>(null);
  const onMobileCloseRef = React.useRef(onMobileClose);
  onMobileCloseRef.current = onMobileClose;

  const resetDrag = React.useCallback(() => {
    touchRef.current = null;
    setDragY(0);
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    const pane = paneRef.current;
    if (!pane || !mobileOpen || !onMobileCloseRef.current) return;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const fromHandle = Boolean(
        (event.target as HTMLElement).closest('[data-sheet-handle]')
      );
      touchRef.current = {
        startY: touch.clientY,
        startTime: Date.now(),
        fromHandle,
        scrollTopAtStart: pane.scrollTop,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const touchState = touchRef.current;
      if (!touchState) return;

      const touch = event.touches[0];
      if (!touch) return;

      const deltaY = touch.clientY - touchState.startY;
      const canDragSheet =
        touchState.fromHandle ||
        (touchState.scrollTopAtStart <= 0 && deltaY > 0);

      if (!canDragSheet || deltaY <= 0) {
        if (deltaY <= 0) setDragY(0);
        return;
      }

      if (deltaY > 6) {
        setIsDragging(true);
        event.preventDefault();
        setDragY(deltaY);
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touchState = touchRef.current;
      const close = onMobileCloseRef.current;
      if (!touchState || !close) {
        resetDrag();
        return;
      }

      const touch = event.changedTouches[0];
      if (!touch) {
        resetDrag();
        return;
      }

      const deltaY = touch.clientY - touchState.startY;
      const elapsed = Math.max(Date.now() - touchState.startTime, 1);
      const velocity = deltaY / elapsed;
      const shouldDismiss =
        deltaY > DISMISS_DISTANCE_PX || velocity > DISMISS_VELOCITY_PX_MS;

      if (shouldDismiss && deltaY > 0) {
        close();
      }

      resetDrag();
    };

    pane.addEventListener('touchstart', onTouchStart, {passive: true});
    pane.addEventListener('touchmove', onTouchMove, {passive: false});
    pane.addEventListener('touchend', onTouchEnd, {passive: true});
    pane.addEventListener('touchcancel', onTouchEnd, {passive: true});

    return () => {
      pane.removeEventListener('touchstart', onTouchStart);
      pane.removeEventListener('touchmove', onTouchMove);
      pane.removeEventListener('touchend', onTouchEnd);
      pane.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [mobileOpen, paneRef, resetDrag]);

  React.useEffect(() => {
    if (!mobileOpen) resetDrag();
  }, [mobileOpen, resetDrag]);

  return {dragY, isDragging};
}

const SidePane = ({
  mobileOpen = false,
  onMobileClose,
  sx,
  children,
  ...props
}: SidePaneProps) => {
  const paneRef = React.useRef<HTMLDivElement>(null);
  const {dragY, isDragging} = useBottomSheetSwipe(mobileOpen, onMobileClose, paneRef);

  const mobileTransform =
    mobileOpen ? `translateY(${dragY}px)` : 'translateY(100%)';

  return (
    <>
      {mobileOpen && onMobileClose && (
        <Box
          role="presentation"
          onClick={onMobileClose}
          sx={{
            display: {xs: 'block', md: 'none'},
            position: 'fixed',
            inset: 0,
            zIndex: 1250,
            bgcolor: (theme) =>
              `rgba(${theme.vars.palette.neutral.darkChannel} / ${isDragging ? 0.35 : 0.5})`,
            transition: 'background-color 0.2s',
          }}
        />
      )}
      <Box
        ref={paneRef}
        className="SidePane"
        {...props}
        sx={[
          {
            gridColumn: {md: 3},
            gridRow: 2,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            bgcolor: 'background.componentBg',
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            position: {xs: 'fixed', md: 'static'},
            bottom: {xs: 0, md: 'auto'},
            left: {xs: 0, md: 'auto'},
            right: {xs: 0, md: 'auto'},
            top: {xs: 'auto', md: 'auto'},
            zIndex: {xs: 1300, md: 'auto'},
            maxHeight: {xs: 'min(85vh, 100%)', md: 'none'},
            width: {xs: '100%', md: 'auto'},
            borderTopLeftRadius: {xs: 'md', md: 0},
            borderTopRightRadius: {xs: 'md', md: 0},
            boxShadow: {xs: 'lg', md: 'none'},
            transform: {xs: mobileTransform, md: 'none'},
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
            visibility: {
              xs: mobileOpen ? 'visible' : 'hidden',
              md: 'visible',
            },
            pointerEvents: {
              xs: mobileOpen ? 'auto' : 'none',
              md: 'auto',
            },
            touchAction: {xs: 'pan-y', md: 'auto'},
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box
          data-sheet-handle
          aria-hidden
          sx={{
            display: {xs: 'flex', md: 'none'},
            flexShrink: 0,
            justifyContent: 'center',
            pt: 1.25,
            pb: 0.75,
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 'sm',
              bgcolor: 'neutral.400',
            }}
          />
        </Box>
        {children}
      </Box>
    </>
  );
};

const Main = (props: BoxProps) => (
  <Box
    component="main"
    className="Main"
    {...props}
    sx={[
      {
        gridColumn: { xs: 1, sm: 2, md: 2 },
        gridRow: 2,
        minHeight: 0,
        minWidth: 0,
        overflowY: 'auto',
        p: 2,
      },
      ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
    ]}
  />
);

type SideDrawerProps = BoxProps & {
  onClose: () => void;
};

const SideDrawer = ({ onClose, children, sx, ...props }: SideDrawerProps) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <Box
      role="dialog"
      aria-modal="true"
      {...props}
      sx={[
        { position: 'fixed', zIndex: 1200, width: '100%', height: '100%' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        role="button"
        tabIndex={-1}
        aria-label="Close navigation"
        onClick={onClose}
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: (theme) => `rgba(${theme.vars.palette.neutral.darkChannel} / 0.8)`,
        }}
      />
      <Sheet
        sx={{
          position: 'relative',
          zIndex: 1,
          minWidth: 256,
          maxWidth: 'min(320px, 85vw)',
          width: 'max-content',
          height: '100%',
          p: 2,
          boxShadow: 'lg',
          bgcolor: 'background.componentBg',
          overflowY: 'auto',
        }}
      >
        {children}
      </Sheet>
    </Box>
  );
};

const exports = {
  Root,
  Header,
  SideNav,
  SidePane,
  SideDrawer,
  Main,
};

export default exports;
