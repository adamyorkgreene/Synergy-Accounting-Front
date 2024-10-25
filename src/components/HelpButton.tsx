import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

interface HelpContent {
  content: string;
}

export const helpContent: Record<string, HelpContent> = {
  dashboard: {
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
  page: keyof typeof helpContent;
}

const HelpButton: React.FC<HelpButtonProps> = ({ page }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="help-icon-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      style={{ position: 'fixed', display: 'inline-block', top: '24px', right: '250px', zIndex: 30000}}
    >
      <FontAwesomeIcon
        icon={faQuestionCircle}
        className="help-icon"
        style={{ cursor: 'pointer',
        fontSize: '28px'}}
      />
      {isVisible && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            top: '100%',
            right: '50%',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '8px',
            zIndex: 10,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <p>{helpContent[page].content}</p>
        </div>
      )}
    </div>
  );
};

export default HelpButton;
