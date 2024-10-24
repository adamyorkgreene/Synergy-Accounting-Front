import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

interface HelpContent {
  content: string;
}

const helpContent: Record<string, HelpContent> = {
  home: {
    content: "This page allows you to see your dashboard and navigate the main features.",
  },
  settings: {
    content: "Here you can adjust your application settings, including language and notifications.",
  },
  profile: {
    content: "This is where you update your profile details like name, avatar, and contact information.",
  },
};

interface HelpButtonProps {
  page: keyof typeof helpContent; // Define the props to accept the page key
}

const HelpButton: React.FC<HelpButtonProps> = ({ page }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="help-icon-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      style={{ position: 'relative', display: 'inline-block' }} // Ensure positioning is inline
    >
      <FontAwesomeIcon
        icon={faQuestionCircle}
        className="help-icon"
        style={{ cursor: 'pointer',
        position: 'ansolute'
        fontSize: '28px',
        top: '20px',
        left: '20px', }}
      />
      {isVisible && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            top: '100%', // Position below the icon
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            zIndex: 10,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // Add shadow for visibility
          }}
        >
          <p>{helpContent[page].content}</p>
        </div>
      )}
    </div>
  );
};

export default HelpButton;
