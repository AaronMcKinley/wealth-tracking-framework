import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-900 text-white py-4 fixed bottom-0 left-0 text-center">
      <p>
        Contact us:{" "}
        <a
          href="mailto:wtf@wealth-tracking-framework.com"
          className="text-primaryGreen hover:underline"
        >
          wtf@wealth-tracking-framework.com
        </a>
      </p>
    </footer>
  );
};

export default Footer;
