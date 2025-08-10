import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <a
        href="mailto:wtf@wealth-tracking-framework.com"
        className="bg-cardBg text-primaryGreen border border-borderGreen rounded-md shadow-lg px-3 py-2 text-sm hover:bg-primaryGreen/20 transition-colors"
      >
        Contact: <span className="underline">wtf@wealth-tracking-framework.com</span>
      </a>
    </div>
  );
};

export default Footer;
