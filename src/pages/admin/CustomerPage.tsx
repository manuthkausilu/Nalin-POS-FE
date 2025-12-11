import React, { useEffect, useState } from 'react';
import { deleteCustomer, getAllCustomers, saveCustomer, updateCustomer } from '../../services/CustomerService';

interface Customer {
    customerId?: string;
    customerName: string;
    phone: string;
    email: string;
    address: string;
}

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    const [newCustomer, setNewCustomer] = useState<Customer>({
        customerId: '',
        customerName: '',
        phone: '',
        email: '',
        address: '',
    });

    // Fetch customers from API or local storage
    const fetchCustomers = async () => {
        const response = await getAllCustomers();
        setCustomers(response.customerDTOList);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter and sort customers
    const filteredAndSortedCustomers = customers
        .filter(customer =>
            customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm)
        )
        .sort((a, b) => {
            let aValue = a.customerName.toLowerCase();
            let bValue = b.customerName.toLowerCase();
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    const handleAddCustomer = async () => {
        if (!newCustomer.customerName || !newCustomer.email) {
            alert("Name and Email are required!");
            return;
        }

        if (editingCustomer) {
            await updateCustomer(editingCustomer.customerId || '', newCustomer);
            fetchCustomers();
        } else {
            await saveCustomer(newCustomer);
            fetchCustomers();
        }

        resetModal();
    };

    const handleEditCustomer = (customer: Customer) => {
        setNewCustomer(customer);
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDeleteCustomer = async (id: string) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            await deleteCustomer(id);
            fetchCustomers();
        }
    };

    const resetModal = () => {
        setNewCustomer({
            customerId: '', customerName: '', phone: '', address: '', email: '',
        });
        setEditingCustomer(null);
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
                                placeholder="Search customers..."
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
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field as any);
                                    setSortOrder(order as any);
                                }}
                                className="px-4 py-2 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-black"
                            >
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                            </select>
                            {/* View Toggle */}
                            <div className="bg-gray-100 rounded p-1 flex border border-gray-200">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`px-4 py-2 rounded transition-all duration-300 text-sm font-medium ${
                                        viewMode === 'table'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-black hover:bg-gray-200'
                                    }`}
                                >
                                    Table
                                </button>
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`px-4 py-2 rounded transition-all duration-300 text-sm font-medium ${
                                        viewMode === 'cards'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-black hover:bg-gray-200'
                                    }`}
                                >
                                    Cards
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    {viewMode === 'table' ? (
                        /* Table View */
                        <div className="overflow-x-auto max-h-[calc(100vh-20rem)] overflow-y-auto">
                            <table className="w-full">
                                <thead className='sticky top-0 z-10 bg-blue-50 text-black border-b border-gray-200'>
                                <tr>
                                    <th className="p-4 text-left font-semibold">Customer</th>
                                    <th className="p-4 text-left font-semibold">Contact</th>
                                    <th className="p-4 text-left font-semibold">Address</th>
                                    <th className="p-4 text-left font-semibold">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAndSortedCustomers.map((customer, index) => (
                                    <tr
                                        key={customer.customerId}
                                        className={`border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        }`}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {customer.customerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-black">{customer.customerName}</p>
                                                    <p className="text-blue-600 text-sm">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-black">{customer.phone}</td>
                                        <td className="p-4 text-black max-w-xs truncate">{customer.address}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditCustomer(customer)}
                                                    className="text-blue-600 px-3 py-1 text-sm font-medium border border-blue-100 rounded hover:bg-blue-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer.customerId || '')}
                                                    className="text-red-600 px-3 py-1 text-sm font-medium border border-red-100 rounded hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {filteredAndSortedCustomers.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">No customers found matching your search</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Cards View */
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredAndSortedCustomers.map((customer) => (
                                    <div
                                        key={customer.customerId}
                                        className="bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="bg-blue-500 p-4 text-white rounded-t">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                                                    {customer.customerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{customer.customerName}</h3>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-500">📧</span>
                                                <span className="text-black text-sm">{customer.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-500">📞</span>
                                                <span className="text-black text-sm">{customer.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-blue-500">📍</span>
                                                <span className="text-black text-sm truncate">{customer.address}</span>
                                            </div>
                                            <div className="flex gap-2 pt-3">
                                                <button
                                                    onClick={() => handleEditCustomer(customer)}
                                                    className="text-blue-600 px-3 py-1 text-sm font-medium border border-blue-100 rounded hover:bg-blue-50"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer.customerId || '')}
                                                    className="text-red-600 px-3 py-1 text-sm font-medium border border-red-100 rounded hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {filteredAndSortedCustomers.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">No customers found matching your search</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Add Customer Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-8 bg-white text-blue-700 border border-blue-600 shadow-lg px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-50 transition-all duration-200 z-50"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
                Add Customer
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-semibold text-black">
                                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {editingCustomer ? 'Update customer information' : 'Fill in the customer details'}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter customer name"
                                    value={newCustomer.customerName}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Address</label>
                                <textarea
                                    placeholder="Enter full address"
                                    value={newCustomer.address}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 text-black resize-none"
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
                            <button
                                onClick={resetModal}
                                className="flex-1 bg-white text-black border border-gray-300 py-2 rounded hover:bg-gray-100 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCustomer}
                                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                            >
                                {editingCustomer ? 'Update Customer' : 'Add Customer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;