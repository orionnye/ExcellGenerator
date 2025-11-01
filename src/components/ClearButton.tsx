import React from 'react';
import './ClearButton.css';
import { useFileDataActions } from '../contexts/FileDataContext';

interface ClearButtonProps {
  disabled?: boolean;
}

const ClearButton: React.FC<ClearButtonProps> = ({ disabled = false }) => {
  const { clearSelection } = useFileDataActions();
  
  const handleClear = () => {
    clearSelection();
    console.log('Selection cleared');
  };

  return (
    <button 
      onClick={handleClear}
      disabled={disabled}
      className="clear-button"
    >
      🗑️ Clear
    </button>
  );
};

export default ClearButton;
