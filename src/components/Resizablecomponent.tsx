import React, { useState, useCallback } from 'react';
import { PanelToggleIcon } from './icons/PanelToggleIcon';

const MIN_PANEL_WIDTH = 400;
const MAX_PANEL_WIDTH = 800;

const ResizableLayout = ({ children, rightPanel }:any) => {
  const [rightPanelWidth, setRightPanelWidth] = useState(MIN_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMouseDown = useCallback((e:any) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e:any) => {
    if (!isResizing) return;
    
    const newWidth = Math.max(
      MIN_PANEL_WIDTH,
      Math.min(
        MAX_PANEL_WIDTH,
        window.innerWidth - e.clientX
      )
    );
    
    setRightPanelWidth(newWidth);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Clone children and inject isCollapsed prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement<any>(child, { isCollapsed });
    }
    return child;
  });

  return (
    <div 
      className="flex h-screen overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {childrenWithProps}
      </div>

      {/* Resizer and Right panel */}
      {rightPanel && (
        <>
          <div
            className="w-1 bg-gray-800 hover:bg-gray-700 cursor-col-resize"
            onMouseDown={handleMouseDown}
          />
          <div
            style={{ width: isCollapsed ? 0 : rightPanelWidth }}
            className={`transition-all duration-300 ease-in-out relative ${
              isCollapsed ? 'w-0' : ''
            }`}
          >
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`absolute ${!isCollapsed ? "-left-5":"-left-8"} top-24 -translate-y-1/2 z-50  p-2 hover:bg-gray-700 text-[#A7A7A7] rounded-l-md`}
            >
              <PanelToggleIcon className="w-6 h-6" isCollapsed={isCollapsed} />
            </button>
            {rightPanel}
          </div>
        </>
      )}
    </div>
  );
};

export default ResizableLayout;