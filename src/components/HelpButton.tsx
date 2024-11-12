import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

interface HelpContent {
  content: string;
}

export const helpContent: Record<string, HelpContent> = {
  dashboard: {
    content: "This page allows you to navigate the main features.",
  },
  "chart-of-accounts": {
    content: "This page displays a structured list of all accounts used for financial tracking, including account numbers, names, descriptions, and balances.",
  },
  "general-ledger": {
    content: "This page is where you can access a comprehensive view of all financial transactions and record financial transactions by creating new journal entries.",
  },
  inbox: {
    content: "This page is where you access and manage your emails and communications.",
  },
  "send-email": {
    content: "This page is where you compose and send emails directly from within the app.",
  },
  "journal-entry-requests": {
    content: "This page is where you review and approve pending journal entries submitted by users.",
  },
  "add-user": {
    content: "This page is where you add a new user with specific roles and permissions to the platform.",
  },
  "update-user-search": {
    content: "This page is where you update details of existing users in the system.",
  },
  "add": {
    content: "This page allows you to add new accounts into the database."
  },
  "journal-entry-detail": {
    content: "This page shows all transaction details of a specific journal entry."
  },
  "journal-entry-form": {
    content: "This page shows allows you to add new journal entries with multiple transactions."
  },
  "update-transaction": {
    content: "This page allows you to update the details of a transaction."
  },
  "event-logs": {
    content: "This page allows you to view all the change history for a specific account."
  }
};

type PageType = keyof typeof helpContent;

const HelpButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  useEffect(() => {
    const path = window.location.pathname;
    const matchedPage = path.split("/").pop() as PageType;

    if (matchedPage && matchedPage in helpContent) {
      setCurrentPage(matchedPage);
    } else {
      setCurrentPage("dashboard");
    }
  }, []);

  return (
    <div
      className="help-icon-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      style={{ position: 'absolute', display: 'inline-block', top: '2.57vmin', right: '35vmin', zIndex: 30000}}
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
          <p>{helpContent[currentPage].content}</p>
        </div>
      )}
    </div>
  );
};

export default HelpButton;
