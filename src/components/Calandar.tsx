import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css'; // Import the Flatpickr CSS

const Calendar: React.FC = () => {
    const flatpickrInstance = useRef<flatpickr.Instance | null>(null); // Ref for the Flatpickr instance
    const calendarInputRef = useRef<HTMLInputElement | null>(null); // Ref for the input
    const buttonRef = useRef<HTMLButtonElement | null>(null); // Ref for the button (to control positioning)

    useEffect(() => {
        if (calendarInputRef.current && buttonRef.current) {
            flatpickrInstance.current = flatpickr(calendarInputRef.current, {
                dateFormat: "Y-m-d",
                enableTime: false,
                altInput: false,
                allowInput: false,
                appendTo: buttonRef.current, // Append the calendar to the button's container
                positionElement: buttonRef.current, // Ensure it's positioned relative to the button
            });
        }

        return () => {
            if (flatpickrInstance.current) {
                flatpickrInstance.current.destroy();
            }
        };
    }, []);

    // Open calendar when icon is clicked
    const openCalendar = () => {
        flatpickrInstance.current?.open(); // Open the calendar
    };

    return (
        <>
            {/* Hidden input for Flatpickr */}
            <input
                type="text"
                ref={calendarInputRef}
                style={{
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                }}
            />
            {/* Button to open the calendar */}
            <button
                ref={buttonRef}
                onClick={openCalendar}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    zIndex: 2000,
                }}
                aria-label="Open calendar"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="black"
                    width="32px"
                    height="32px"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h18M3 10h18M3 15h18M3 20h18M8 5v2m8-2v2"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z"
                    />
                </svg>
            </button>
        </>
    );
};

export default Calendar;
