import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search cryptocurrencies..."
        className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg
          border border-gray-700 focus:border-blue-500 focus:outline-none
          placeholder-gray-500"
      />
    </div>
  );
};