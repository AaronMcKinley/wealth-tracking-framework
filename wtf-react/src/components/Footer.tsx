import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-cardBg border-t border-borderGreen py-2 text-center text-sm text-primaryGreen">
      Contact: <span className="underline">wtf@wealth-tracking-framework.com</span>
    </footer>
  );
};

export default Footer;