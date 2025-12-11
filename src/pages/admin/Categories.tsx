import React, { useEffect, useState } from 'react';
import {
  getAllCategories,
  saveCategory,
  updateCategory,
  // deleteCategory,
  
} from '../../services/CategoryService';
import type { Category } from '../../services/CategoryService';

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newCategory, setNewCategory] = useState<Omit<Category, 'categoryId'>>({ name: '' });

  const fetchCategories = async () => {
    const response = await getAllCategories();
    setCategories(response.categoryDTOList || response); // fallback if response is array
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredAndSortedCategories = categories
    .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aValue = a.name.toLowerCase();
      const bValue = b.name.toLowerCase();
      if (sortOrder === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Category name is required!');
      return;
    }
    if (editingCategory) {
      await updateCategory(editingCategory.categoryId!, newCategory);
    } else {
      await saveCategory(newCategory);
    }
    fetchCategories();
    resetModal();
  };

  const handleEditCategory = (category: Category) => {
    setNewCategory({ name: category.name });
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // const handleDeleteCategory = async (categoryId?: number) => {
  //   if (!categoryId) return;
  //   if (window.confirm('Are you sure you want to delete this category?')) {
  //     await deleteCategory(categoryId);
  //     fetchCategories();
  //   }
  // };

  const resetModal = () => {
    setNewCategory({ name: '' });
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Controls Section */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
            </div>
            {/* Controls */}
            <div className="flex gap-3 flex-wrap">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
              >
                <option value="asc">Name A-Z</option>
                <option value="desc">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-20rem)] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-blue-50 text-black border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold">Category Name</th>
                  <th className="p-4 text-left font-semibold">Edit</th>
                  {/* <th className="p-4 text-left font-semibold">Delete</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCategories.map((category, index) => (
                  <tr
                    key={category.categoryId}
                    className={`border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="p-4 text-black font-medium">{category.name}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 px-3 py-1 text-sm font-medium border border-blue-100 rounded hover:bg-blue-50 w-full"
                      >
                        Edit
                      </button>
                    </td>
                    {/* <td className="p-4">
                      <button
                        onClick={() => handleDeleteCategory(Number(category.categoryId))}
                        className="text-red-600 px-3 py-1 text-sm font-medium border border-red-100 rounded hover:bg-red-50 w-full"
                      >
                        Delete
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAndSortedCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No categories found matching your search</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Add Category Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white border border-blue-600 shadow-lg px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-all duration-200 z-50"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      >
        Add Category
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-black">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {editingCategory ? 'Update category information' : 'Fill in the category details'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex flex-col gap-3 border-t border-gray-200">
              <button
                onClick={resetModal}
                className="flex-1 bg-white text-black border border-gray-300 py-2 rounded hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
