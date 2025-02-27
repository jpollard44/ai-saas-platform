import React, { useState } from 'react';
import './BatchOperations.css';

const BatchOperations = ({ 
  selectedAgents, 
  onBatchAction, 
  onSelectAll, 
  totalAgents, 
  allSelected 
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBatchAction = async (action) => {
    if (action === 'delete') {
      setActionToConfirm('delete');
      setShowConfirmation(true);
      return;
    }
    
    try {
      setIsProcessing(true);
      await onBatchAction(action);
    } catch (error) {
      console.error(`Error performing batch ${action}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAction = async () => {
    try {
      setIsProcessing(true);
      await onBatchAction(actionToConfirm);
      setShowConfirmation(false);
    } catch (error) {
      console.error(`Error performing batch ${actionToConfirm}:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setActionToConfirm(null);
  };

  if (selectedAgents.length === 0) {
    return null;
  }

  return (
    <div className="batch-operations">
      {!showConfirmation ? (
        <>
          <div className="selection-info">
            <div className="checkbox-wrapper">
              <input 
                type="checkbox" 
                checked={allSelected}
                onChange={onSelectAll}
                id="select-all-checkbox"
              />
              <label htmlFor="select-all-checkbox">
                {selectedAgents.length} of {totalAgents} agents selected
              </label>
            </div>
            
            {selectedAgents.length < totalAgents && (
              <button className="select-all-button" onClick={onSelectAll}>
                Select all {totalAgents} agents
              </button>
            )}
          </div>
          
          <div className="batch-actions">
            <button 
              className="batch-action deploy"
              onClick={() => handleBatchAction('deploy')}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Deploy Selected'}
            </button>
            <button 
              className="batch-action deactivate"
              onClick={() => handleBatchAction('deactivate')}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Deactivate Selected'}
            </button>
            <button 
              className="batch-action export"
              onClick={() => handleBatchAction('export')}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Export Selected'}
            </button>
            <button 
              className="batch-action delete"
              onClick={() => handleBatchAction('delete')}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Delete Selected'}
            </button>
          </div>
        </>
      ) : (
        <div className="confirmation-dialog">
          <div className="confirmation-content">
            <div className="confirmation-icon">⚠️</div>
            <h3>Confirm {actionToConfirm}</h3>
            <p>
              Are you sure you want to {actionToConfirm} {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''}? 
              {actionToConfirm === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="confirmation-actions">
              <button 
                className="cancel-button"
                onClick={cancelAction}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`confirm-button ${actionToConfirm}`}
                onClick={confirmAction}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Yes, ${actionToConfirm}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchOperations;
