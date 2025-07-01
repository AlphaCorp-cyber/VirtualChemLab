import React from "react";

export default function TestScrolling() {
  return (
    <div className="bg-black text-white">
      <div className="p-8">
        <h1 className="text-4xl mb-4">Scroll Test</h1>
        <p className="mb-8">This page tests if vertical scrolling works properly.</p>
        
        {/* Generate lots of content to force scrolling */}
        {Array.from({ length: 100 }, (_, i) => (
          <div key={i} className="mb-4 p-4 bg-gray-800 rounded">
            <h2 className="text-xl mb-2">Section {i + 1}</h2>
            <p>
              This is content section {i + 1}. Lorem ipsum dolor sit amet, 
              consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut 
              labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
              nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        ))}
        
        <div className="text-center p-8">
          <h2 className="text-2xl">End of Content</h2>
          <p>If you can see this, scrolling worked!</p>
        </div>
      </div>
    </div>
  );
}