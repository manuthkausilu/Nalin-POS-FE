import React from 'react';

interface ScrollItem {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryScrollProps {
  items: ScrollItem[];
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryScroll: React.FC<CategoryScrollProps> = ({ items, selected, onSelect }) => {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 pb-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all duration-200 ${
              selected === item.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryScroll;
