import React, { useEffect, useRef } from 'react';

export default function SolarDesigner({ initialPanelQty }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleIframeLoad = () => {
      if (iframeRef.current && initialPanelQty) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SET_INITIAL_QTY',
          qty: initialPanelQty
        }, '*');
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      
      // If already loaded
      if (iframe.contentWindow && iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        handleIframeLoad();
      }
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, [initialPanelQty]);

  return (
    <div className="w-full h-screen min-h-[900px] flex flex-col bg-emerald-50 overflow-hidden rounded-xl border border-emerald-200 shadow-2xl relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-500 z-10" />
      <iframe
        ref={iframeRef}
        src="/solar_designer_xb.html"
        className="w-full h-full border-none"
        title="Smart Tech - 2D/3D Designer"
      />
    </div>
  );
}
