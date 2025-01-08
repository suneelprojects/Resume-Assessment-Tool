import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

const MonthYearPicker = ({ 
  value, 
  onChange, 
  min, 
  allowPresent = true, 
  yearsBack = 50,
  isEndDate = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showYearSelect, setShowYearSelect] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const thisYear = new Date().getFullYear();
  const years = Array.from(
    { length: yearsBack + 1 }, 
    (_, i) => thisYear - yearsBack + i
  ).sort((a, b) => b - a);

  useEffect(() => {
    const calculatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 320; // Approximate height of dropdown

        setDropdownPosition(spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'top' : 'bottom');
      }
    };

    if (isOpen) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }

    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen]);

  const changeYear = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + increment);
    setCurrentDate(newDate);
  };

  const handleMonthSelect = (event, month) => {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation(); // Stop event bubbling
    const newDate = `${month}, ${currentDate.getFullYear()}`;
    onChange(newDate);
    setInputValue(newDate);
    setIsOpen(false);
  };

  const handleYearSelect = (event, year) => {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation(); // Stop event bubbling
    setCurrentDate(new Date(year, currentDate.getMonth()));
    setShowYearSelect(false);
  };

  const handlePresentSelect = (event) => {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation(); // Stop event bubbling
    onChange("Present");
    setInputValue("Present");
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue === "Present") {
      onChange("Present");
      return;
    }
    
    const regex = /^(January|February|March|April|May|June|July|August|September|October|November|December),\s*\d{4}$/;
    if (regex.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleClear = (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    setInputValue('');
    onChange('');
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowYearSelect(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize with current date or selected date
  useEffect(() => {
    if (value && value !== "Present") {
      const [month, year] = value.split(", ");
      if (!isNaN(parseInt(year))) {
        setCurrentDate(new Date(parseInt(year), new Date(`${month} 1`).getMonth()));
      }
    }
    setInputValue(value || '');
  }, [value]);

  const isDateDisabled = (month, year) => {
    if (!min) return false;
    if (min === "Present") return false;
    const [minMonth, minYear] = min.split(", ");
    const minDate = new Date(`${minMonth} 1, ${minYear}`);
    const currentDate = new Date(`${month} 1, ${year}`);
    return currentDate < minDate;
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        placeholder={`Month, Year ${isEndDate ? 'or Present' : ''}`}
        className="mt-1 p-3 pr-16 border border-gray-300 rounded-lg w-full bg-white/70 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center pr-3">
        {inputValue && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 rounded-full mr-1"
            title="Clear"
            type="button"
          >
            <XIcon className="h-4 w-4 text-gray-500" />
          </button>
        )}
        <button 
          onClick={toggleDropdown}
          className="p-1 hover:bg-gray-100 rounded-full"
          type="button"
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>

    {isOpen && (
      <div 
        className={`absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg ${
          dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
        }`}
      >
        {isEndDate && allowPresent && (
          <button
            onClick={handlePresentSelect}
            type="button"
            className="w-full p-2 text-left hover:bg-purple-100 border-b text-purple-600 font-medium"
          >
            Present
          </button>
        )}
        
        <div className="flex justify-between items-center p-2 border-b">
          <button
            onClick={(e) => {
              e.preventDefault();
              changeYear(-1);
            }}
            type="button"
            className="p-1 hover:bg-purple-100 rounded-full"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowYearSelect(!showYearSelect);
            }}
            type="button"
            className="font-medium px-4 py-1 hover:bg-purple-100 rounded-lg transition-colors"
          >
            {currentDate.getFullYear()}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              changeYear(1);
            }}
            type="button"
            className="p-1 hover:bg-purple-100 rounded-full"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        
        {showYearSelect ? (
          <div className="grid grid-cols-4 gap-1 p-2 max-h-48 overflow-y-auto">
            {years.map((year) => (
              <button
                key={year}
                onClick={(e) => handleYearSelect(e, year)}
                type="button"
                className="p-2 text-sm rounded hover:bg-purple-100 text-gray-700"
              >
                {year}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 p-2 max-h-48 overflow-y-auto">
            {months.map((month) => (
              <button
                key={month}
                type="button"
                onClick={(e) => handleMonthSelect(e, month)}
                disabled={isDateDisabled(month, currentDate.getFullYear())}
                className={`p-2 text-sm rounded hover:bg-purple-100 ${
                  isDateDisabled(month, currentDate.getFullYear())
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
  );
};

export default MonthYearPicker;