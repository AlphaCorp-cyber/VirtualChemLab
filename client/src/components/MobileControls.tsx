import React, { useState, useEffect } from 'react';

interface MobileControlsProps {
  isVisible: boolean;
  onMove?: (direction: string) => void;
  onZoom?: (direction: 'in' | 'out') => void;
}

export function MobileControls({ isVisible, onMove, onZoom }: MobileControlsProps) {
  const [isMoving, setIsMoving] = useState<string | null>(null);
  const [moveInterval, setMoveInterval] = useState<NodeJS.Timeout | null>(null);

  // Handle movement
  const handleMove = (direction: string) => {
    if (onMove) {
      onMove(direction);
    }
  };

  // Handle zoom
  const handleZoom = (direction: 'in' | 'out') => {
    if (onZoom) {
      onZoom(direction);
    }
  };

  // Start continuous movement
  const startMove = (direction: string) => {
    setIsMoving(direction);
    handleMove(direction);
    
    const interval = setInterval(() => {
      handleMove(direction);
    }, 50); // 20 FPS movement updates
    
    setMoveInterval(interval);
  };

  // Stop movement
  const stopMove = () => {
    setIsMoving(null);
    if (moveInterval) {
      clearInterval(moveInterval);
      setMoveInterval(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (moveInterval) {
        clearInterval(moveInterval);
      }
    };
  }, [moveInterval]);

  if (!isVisible) return null;

  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'none',
    transition: 'all 0.1s ease',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    borderColor: 'rgba(33, 150, 243, 1)',
    transform: 'scale(0.95)',
  };

  const zoomButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    width: '50px',
    height: '50px',
    fontSize: '24px',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 1000,
    }}>
      {/* Movement Controls - Left Side */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        pointerEvents: 'auto',
      }}>
        {/* Directional Pad */}
        <div style={{
          position: 'relative',
          width: '180px',
          height: '180px',
        }}>
          {/* Up Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              startMove('forward');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopMove();
            }}
            onMouseDown={() => startMove('forward')}
            onMouseUp={stopMove}
            onMouseLeave={stopMove}
            style={{
              ...buttonStyle,
              ...(isMoving === 'forward' ? activeButtonStyle : {}),
              position: 'absolute',
              top: '0px',
              left: '60px',
            }}
          >
            ↑
          </button>

          {/* Down Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              startMove('backward');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopMove();
            }}
            onMouseDown={() => startMove('backward')}
            onMouseUp={stopMove}
            onMouseLeave={stopMove}
            style={{
              ...buttonStyle,
              ...(isMoving === 'backward' ? activeButtonStyle : {}),
              position: 'absolute',
              bottom: '0px',
              left: '60px',
            }}
          >
            ↓
          </button>

          {/* Left Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              startMove('left');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopMove();
            }}
            onMouseDown={() => startMove('left')}
            onMouseUp={stopMove}
            onMouseLeave={stopMove}
            style={{
              ...buttonStyle,
              ...(isMoving === 'left' ? activeButtonStyle : {}),
              position: 'absolute',
              left: '0px',
              top: '60px',
            }}
          >
            ←
          </button>

          {/* Right Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              startMove('right');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopMove();
            }}
            onMouseDown={() => startMove('right')}
            onMouseUp={stopMove}
            onMouseLeave={stopMove}
            style={{
              ...buttonStyle,
              ...(isMoving === 'right' ? activeButtonStyle : {}),
              position: 'absolute',
              right: '0px',
              top: '60px',
            }}
          >
            →
          </button>

          {/* Center Circle - Lab Info */}
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '60px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            textAlign: 'center',
          }}>
            MOVE
          </div>
        </div>
      </div>

      {/* Height Controls - Left Side, Above Movement */}
      <div style={{
        position: 'absolute',
        bottom: '220px',
        left: '20px',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        {/* Up Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            startMove('up');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopMove();
          }}
          onMouseDown={() => startMove('up')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          style={{
            ...buttonStyle,
            ...(isMoving === 'up' ? activeButtonStyle : {}),
          }}
        >
          ⬆
        </button>

        {/* Down Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            startMove('down');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopMove();
          }}
          onMouseDown={() => startMove('down')}
          onMouseUp={stopMove}
          onMouseLeave={stopMove}
          style={{
            ...buttonStyle,
            ...(isMoving === 'down' ? activeButtonStyle : {}),
          }}
        >
          ⬇
        </button>
      </div>

      {/* Zoom Controls - Right Side */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}>
        {/* Zoom In */}
        <button
          style={zoomButtonStyle}
          onTouchStart={(e) => {
            e.preventDefault();
            handleZoom('in');
          }}
          onClick={() => handleZoom('in')}
        >
          +
        </button>

        {/* Zoom Out */}
        <button
          style={zoomButtonStyle}
          onTouchStart={(e) => {
            e.preventDefault();
            handleZoom('out');
          }}
          onClick={() => handleZoom('out')}
        >
          −
        </button>
      </div>

      {/* Instructions - Top Center */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        textAlign: 'center',
        pointerEvents: 'auto',
        maxWidth: '300px',
      }}>
        📱 <strong>Touch Controls Active</strong><br/>
        Use buttons to move around the lab
      </div>
    </div>
  );
}