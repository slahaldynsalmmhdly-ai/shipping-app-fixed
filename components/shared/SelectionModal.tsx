import React, { useState, useMemo } from 'react';
import '../auth/Modal.css';
import './SelectionModal.css';

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: string[];
  onSelect: (item: string) => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content selection-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle-bar"></div>
        <header className="selection-modal-header">
          <h3>{title}</h3>
        </header>
        <div className="selection-modal-search">
          <div className="form-group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <main className="selection-modal-list">
          {filteredItems.length > 0 ? (
            <ul>
              {filteredItems.map(item => (
                <li key={item} onClick={() => onSelect(item)}>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">لا توجد نتائج</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default SelectionModal;
