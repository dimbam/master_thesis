import React, { useEffect, useState } from 'react';
import '.././TooltipInfo.css'; // optional for styling

interface TooltipInfoProps {
  text: string;
}

const TooltipInfo: React.FC<TooltipInfoProps> = ({ text }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (visible) {
      timeout = setTimeout(() => {
        setVisible(false);
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [visible]);

  return (
    <span className="tooltip-wrapper">
      <button type="button" className="tooltip-button" onClick={() => setVisible((prev) => !prev)}>
        ?
      </button>
      {visible && <span className="tooltip-popup">{text}</span>}
    </span>
  );
};

export default TooltipInfo;
