'use client';

import * as React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type SidebarState = {
  isOpen: boolean;
  width: number;
  preferredWidth: number;
};

type BottomBarMode = 'push' | 'overlay';

type BottomBarState = {
  mode: BottomBarMode;
  height: number;
  isVisible: boolean;
};

type EnhancedSidebarContext = {
  // Left sidebar
  leftSidebar: SidebarState;
  toggleLeftSidebar: () => void;
  setLeftSidebarWidth: (width: number) => void;
  setLeftSidebarOpen: (open: boolean) => void;

  // Right sidebar
  rightSidebar: SidebarState;
  toggleRightSidebar: () => void;
  setRightSidebarWidth: (width: number) => void;
  setRightSidebarOpen: (open: boolean) => void;

  // Bottom bar
  bottomBar: BottomBarState;
  setBottomBarMode: (mode: BottomBarMode) => void;
  setBottomBarHeight: (height: number) => void;
  setBottomBarVisible: (visible: boolean) => void;
  toggleBottomBar: () => void;

  // Drag state
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  dragSide: 'left' | 'right' | null;
  setDragSide: (side: 'left' | 'right' | null) => void;

  // Grid CSS custom properties
  updateGridLayout: () => void;
};

const EnhancedSidebarContext = createContext<EnhancedSidebarContext | null>(null);

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_LEFT_WIDTH = 244;
const DEFAULT_RIGHT_WIDTH = 320;

const MIN_BOTTOM_HEIGHT = 56;
const MAX_BOTTOM_HEIGHT = 300;
const DEFAULT_BOTTOM_HEIGHT = 200;

export function useResizableSidebar() {
  const context = useContext(EnhancedSidebarContext);
  if (!context) {
    throw new Error('useResizableSidebar must be used within a ResizableSidebarProvider');
  }
  return context;
}

export function ResizableSidebarProvider({ children }: { children: React.ReactNode }) {
  const [leftSidebar, setLeftSidebar] = useState<SidebarState>({
    isOpen: true,
    width: DEFAULT_LEFT_WIDTH,
    preferredWidth: DEFAULT_LEFT_WIDTH,
  });

  const [rightSidebar, setRightSidebar] = useState<SidebarState>({
    isOpen: false,
    width: DEFAULT_RIGHT_WIDTH,
    preferredWidth: DEFAULT_RIGHT_WIDTH,
  });

  const [bottomBar, setBottomBar] = useState<BottomBarState>({
    mode: 'push',
    height: DEFAULT_BOTTOM_HEIGHT,
    isVisible: false,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragSide, setDragSide] = useState<'left' | 'right' | null>(null);

  // Debounced save to localStorage
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Update CSS Grid layout
  const updateGridLayout = useCallback(() => {
    const leftWidth = leftSidebar.isOpen ? leftSidebar.width : 0;
    const rightWidth = rightSidebar.isOpen ? rightSidebar.width : 0;
    const bottomHeight = bottomBar.isVisible ? bottomBar.height : MIN_BOTTOM_HEIGHT;

    document.documentElement.style.setProperty('--sidebar-left-width', `${leftWidth}px`);
    document.documentElement.style.setProperty('--sidebar-right-width', `${rightWidth}px`);
    document.documentElement.style.setProperty('--bottombar-height', `${bottomHeight}px`);
    document.documentElement.style.setProperty('--bottombar-mode', bottomBar.mode);
    document.documentElement.style.setProperty(
      '--grid-template-columns',
      `${leftWidth}px 1fr ${rightWidth}px`
    );
  }, [leftSidebar.isOpen, leftSidebar.width, rightSidebar.isOpen, rightSidebar.width, bottomBar]);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      // Load left sidebar state
      const savedLeftOpen = localStorage.getItem('sidebar-left-open');
      const savedLeftWidth = localStorage.getItem('sidebar-left-width');
      const savedLeftPreferred = localStorage.getItem('sidebar-left-preferred-width');

      if (savedLeftOpen !== null) {
        const isOpen = savedLeftOpen === 'true';
        const width = savedLeftWidth ? parseInt(savedLeftWidth, 10) : DEFAULT_LEFT_WIDTH;
        const preferredWidth = savedLeftPreferred ? parseInt(savedLeftPreferred, 10) : width;

        const validWidth = !isNaN(width) && width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH ? width : DEFAULT_LEFT_WIDTH;
        const validPreferred = !isNaN(preferredWidth) && preferredWidth >= MIN_SIDEBAR_WIDTH && preferredWidth <= MAX_SIDEBAR_WIDTH ? preferredWidth : validWidth;

        setLeftSidebar({
          isOpen,
          width: validWidth,
          preferredWidth: validPreferred,
        });
      }

      // Load right sidebar state
      const savedRightOpen = localStorage.getItem('sidebar-right-open');
      const savedRightWidth = localStorage.getItem('sidebar-right-width');
      const savedRightPreferred = localStorage.getItem('sidebar-right-preferred-width');

      if (savedRightOpen !== null) {
        const isOpen = savedRightOpen === 'true';
        const width = savedRightWidth ? parseInt(savedRightWidth, 10) : DEFAULT_RIGHT_WIDTH;
        const preferredWidth = savedRightPreferred ? parseInt(savedRightPreferred, 10) : width;

        const validWidth = !isNaN(width) && width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH ? width : DEFAULT_RIGHT_WIDTH;
        const validPreferred = !isNaN(preferredWidth) && preferredWidth >= MIN_SIDEBAR_WIDTH && preferredWidth <= MAX_SIDEBAR_WIDTH ? preferredWidth : validWidth;

        setRightSidebar({
          isOpen,
          width: validWidth,
          preferredWidth: validPreferred,
        });
      }

      // Load bottom bar state
      const savedBottomMode = localStorage.getItem('ui:bottomBarMode');
      const savedBottomHeight = localStorage.getItem('ui:bottomBarHeight');
      const savedBottomVisible = localStorage.getItem('ui:bottomBarVisible');

      if (savedBottomMode !== null || savedBottomHeight !== null || savedBottomVisible !== null) {
        const mode = (savedBottomMode === 'overlay' ? 'overlay' : 'push') as BottomBarMode;
        const height = savedBottomHeight ? parseInt(savedBottomHeight, 10) : DEFAULT_BOTTOM_HEIGHT;
        const isVisible = savedBottomVisible ? savedBottomVisible === 'true' : false;

        const validHeight = !isNaN(height) && height >= MIN_BOTTOM_HEIGHT && height <= MAX_BOTTOM_HEIGHT ? height : DEFAULT_BOTTOM_HEIGHT;

        setBottomBar({
          mode,
          height: validHeight,
          isVisible,
        });
      }
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
    }
  }, []);

  // Update grid layout whenever sidebar states change
  useEffect(() => {
    updateGridLayout();
  }, [updateGridLayout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Save state to localStorage with debouncing
  const saveToLocalStorage = useCallback((side: 'left' | 'right', state: SidebarState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(`sidebar-${side}-open`, state.isOpen.toString());
        localStorage.setItem(`sidebar-${side}-width`, state.width.toString());
        localStorage.setItem(`sidebar-${side}-preferred-width`, state.preferredWidth.toString());
      } catch (error) {
        console.warn(`Failed to save ${side} sidebar state to localStorage:`, error);
      }
    }, 500);
  }, []);

  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebar(prev => {
      const newState = {
        ...prev,
        isOpen: !prev.isOpen,
        width: !prev.isOpen ? prev.preferredWidth : prev.width,
        preferredWidth: !prev.isOpen ? prev.preferredWidth : prev.width,
      };
      saveToLocalStorage('left', newState);
      return newState;
    });
  }, [saveToLocalStorage]);

  const setLeftSidebarOpen = useCallback((open: boolean) => {
    setLeftSidebar(prev => {
      const newState = {
        ...prev,
        isOpen: open,
        width: open ? prev.preferredWidth : prev.width,
        preferredWidth: open ? prev.preferredWidth : prev.width,
      };
      saveToLocalStorage('left', newState);
      return newState;
    });
  }, [saveToLocalStorage]);

  const setLeftSidebarWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width));

    setLeftSidebar(prev => {
      if (clampedWidth !== prev.width && prev.isOpen) {
        const newState = {
          ...prev,
          width: clampedWidth,
          preferredWidth: clampedWidth,
        };
        saveToLocalStorage('left', newState);
        return newState;
      }
      return prev;
    });
  }, [saveToLocalStorage]);

  const toggleRightSidebar = useCallback(() => {
    setRightSidebar(prev => {
      const newState = {
        ...prev,
        isOpen: !prev.isOpen,
        width: !prev.isOpen ? prev.preferredWidth : prev.width,
        preferredWidth: !prev.isOpen ? prev.preferredWidth : prev.width,
      };
      saveToLocalStorage('right', newState);
      return newState;
    });
  }, [saveToLocalStorage]);

  const setRightSidebarOpen = useCallback((open: boolean) => {
    setRightSidebar(prev => {
      const newState = {
        ...prev,
        isOpen: open,
        width: open ? prev.preferredWidth : prev.width,
        preferredWidth: open ? prev.preferredWidth : prev.width,
      };
      saveToLocalStorage('right', newState);
      return newState;
    });
  }, [saveToLocalStorage]);

  const setRightSidebarWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width));

    setRightSidebar(prev => {
      if (clampedWidth !== prev.width && prev.isOpen) {
        const newState = {
          ...prev,
          width: clampedWidth,
          preferredWidth: clampedWidth,
        };
        saveToLocalStorage('right', newState);
        return newState;
      }
      return prev;
    });
  }, [saveToLocalStorage]);

  // Bottom bar management functions
  const setBottomBarMode = useCallback((mode: BottomBarMode) => {
    setBottomBar(prev => {
      const newState = { ...prev, mode };
      try {
        localStorage.setItem('ui:bottomBarMode', mode);
      } catch (error) {
        console.warn('Failed to save bottom bar mode to localStorage:', error);
      }
      return newState;
    });
  }, []);

  const setBottomBarHeight = useCallback((height: number) => {
    const clampedHeight = Math.max(MIN_BOTTOM_HEIGHT, Math.min(MAX_BOTTOM_HEIGHT, height));

    setBottomBar(prev => {
      const newState = { ...prev, height: clampedHeight };
      try {
        localStorage.setItem('ui:bottomBarHeight', clampedHeight.toString());
      } catch (error) {
        console.warn('Failed to save bottom bar height to localStorage:', error);
      }
      return newState;
    });
  }, []);

  const setBottomBarVisible = useCallback((visible: boolean) => {
    setBottomBar(prev => {
      const newState = { ...prev, isVisible: visible };
      try {
        localStorage.setItem('ui:bottomBarVisible', visible.toString());
      } catch (error) {
        console.warn('Failed to save bottom bar visibility to localStorage:', error);
      }
      return newState;
    });
  }, []);

  const toggleBottomBar = useCallback(() => {
    setBottomBar(prev => {
      const newState = { ...prev, isVisible: !prev.isVisible };
      try {
        localStorage.setItem('ui:bottomBarVisible', newState.isVisible.toString());
      } catch (error) {
        console.warn('Failed to save bottom bar visibility to localStorage:', error);
      }
      return newState;
    });
  }, []);

  const contextValue = React.useMemo(
    () => ({
      leftSidebar,
      toggleLeftSidebar,
      setLeftSidebarWidth,
      setLeftSidebarOpen,
      rightSidebar,
      toggleRightSidebar,
      setRightSidebarWidth,
      setRightSidebarOpen,
      bottomBar,
      setBottomBarMode,
      setBottomBarHeight,
      setBottomBarVisible,
      toggleBottomBar,
      isDragging,
      setIsDragging,
      dragSide,
      setDragSide,
      updateGridLayout,
    }),
    [
      leftSidebar,
      toggleLeftSidebar,
      setLeftSidebarWidth,
      setLeftSidebarOpen,
      rightSidebar,
      toggleRightSidebar,
      setRightSidebarWidth,
      setRightSidebarOpen,
      bottomBar,
      setBottomBarMode,
      setBottomBarHeight,
      setBottomBarVisible,
      toggleBottomBar,
      isDragging,
      setIsDragging,
      dragSide,
      setDragSide,
      updateGridLayout,
    ]
  );

  return (
    <EnhancedSidebarContext.Provider value={contextValue}>
      {children}
    </EnhancedSidebarContext.Provider>
  );
}
