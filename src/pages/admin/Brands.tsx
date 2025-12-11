import React, { useEffect, useState } from 'react';
import {
  getAllBrands,
  saveBrand,
  updateBrand,
  deleteBrand,
} from '../../services/BrandService';

interface Brand {
  brandId: number;
  brandName: string;
} 

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBrand, setModalBrand] = useState<Partial<Brand> | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBrands();
      // Handle the sample response structure
      let brandsArray: Brand[] = [];
      if (Array.isArray(data)) {
        brandsArray = data;
      } else if (data && Array.isArray(data.brandDTOList)) {
        brandsArray = data.brandDTOList;
      } else if (data && Array.isArray(data.data)) {
        brandsArray = data.data;
      } else if (data && Array.isArray(data.brands)) {
        brandsArray = data.brands;
      }
      setBrands(brandsArray);
    } catch (err: any) {
      setError('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((brand) =>
    brand.brandName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add/Edit Modal handlers
  // const openAddModal = () => {
  //   setModalBrand({ brandName: '' });
  //   setModalOpen(true);
  // };

  // const openEditModal = (brand: Brand) => {
  //   setModalBrand({ ...brand });
  //   setModalOpen(true);
  // };

  const closeModal = () => {
    setModalOpen(false);
    setModalBrand(null);
  };

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalBrand((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBrand?.brandName) return;
    setModalLoading(true);
    try {
      if (modalBrand.brandId) {
        await updateBrand(modalBrand.brandId, { brandName: modalBrand.brandName });
      } else {
        await saveBrand({ brandName: modalBrand.brandName });
      }
      await fetchBrands();
      closeModal();
    } catch {
      // Optionally handle error
    } finally {
      setModalLoading(false);
    }
  };

  // Delete handlers
  // const confirmDelete = (brandId: number) => {
  //   setDeleteId(brandId);
  // };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteBrand(deleteId);
      await fetchBrands();
      setDeleteId(null);
    } catch {
      // Optionally handle error
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Content Section */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          {/* Search Bar above the table */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100 bg-blue-50">
            <div className="relative flex-1 max-w-md w-full">
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black shadow-sm"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </span>
            </div>

          </div>
          {/* Table */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading brands...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto max-h-[calc(100vh-20rem)] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-blue-100 text-blue-700 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold">ID</th>
                    <th className="p-4 text-left font-semibold">Brand Name</th>
                    <th className="p-4 text-left font-semibold">Edit</th>
                    {/* <th className="p-4 text-left font-semibold">Delete</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredBrands.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-gray-500 text-lg">
                        No brands found.
                      </td>
                    </tr>
                  ) : (
                    filteredBrands.map((brand, idx) => (
                      <tr
                        key={brand.brandId}
                        className={`border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <td className="p-4">{brand.brandId}</td>
                        <td className="p-4">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                            {brand.brandName}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            className="text-blue-600 px-3 py-1 text-sm font-medium border border-blue-100 rounded hover:bg-blue-100 w-full transition-all duration-150"
                            onClick={() => {
                              setModalBrand({ ...brand });
                              setModalOpen(true);
                            }}
                          >
                            Edit
                          </button>
                        </td>
                        {/* <td className="p-4">
                          <button
                            className="text-red-600 px-3 py-1 text-sm font-medium border border-red-100 rounded hover:bg-red-100 w-full transition-all duration-150"
                            onClick={() => setDeleteId(brand.brandId)}
                          >
                            Delete
                          </button>
                        </td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Add Brand Button */}
      <button
        onClick={() => {
          setModalBrand({ brandName: '' });
          setModalOpen(true);
        }}
        className="fixed bottom-8 right-8 bg-blue-600 text-white border border-blue-600 shadow-lg px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-all duration-200 z-50"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      >
        Add Brand
      </button>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-700">
                {modalBrand?.brandId ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {modalBrand?.brandId ? 'Update brand information' : 'Fill in the brand details'}
              </p>
            </div>
            <form onSubmit={handleModalSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Brand Name *</label>
                  <input
                    type="text"
                    name="brandName"
                    placeholder="Brand Name"
                    value={modalBrand?.brandName || ''}
                    onChange={handleModalChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                    required
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex flex-col gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-white text-black border border-gray-300 py-2 rounded hover:bg-gray-100 font-medium"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-red-50">
              <h2 className="text-xl font-semibold text-red-700">Delete Brand</h2>
            </div>
            <div className="p-6">
              <p className="text-black mb-4">Are you sure you want to delete this brand?</p>
              <div className="flex flex-col gap-3">
                <button
                  className="flex-1 bg-white text-black border border-gray-300 py-2 rounded hover:bg-gray-100 font-medium"
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 font-medium"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;