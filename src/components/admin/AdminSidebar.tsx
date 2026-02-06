import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    MdDashboard,
    MdPeople,
    MdPointOfSale,
    MdInventory,
    MdCategory,
    MdLocalOffer,
    MdReceipt,
    MdSettings,
    MdLogout,
    MdBusiness,
    MdBarChart
} from 'react-icons/md';

const AdminSidebar = () => {
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/admin', icon: <MdDashboard size={20} />, label: 'Dashboard', end: true },
        { path: '/admin/pos', icon: <MdPointOfSale size={20} />, label: 'POS' },
        { path: '/admin/users', icon: <MdPeople size={20} />, label: 'Users' },
        { path: '/admin/inventory', icon: <MdInventory size={20} />, label: 'Inventory' },
        { path: '/admin/products', icon: <MdLocalOffer size={20} />, label: 'Products' },
        { path: '/admin/categories', icon: <MdCategory size={20} />, label: 'Categories' },
        { path: '/admin/brands', icon: <MdBusiness size={20} />, label: 'Brands' },
        { path: '/admin/sales', icon: <MdReceipt size={20} />, label: 'Sales' },
        { path: '/admin/sales-reports', icon: <MdReceipt size={20} />, label: 'Sales Reports' },
        { path: '/admin/product-reports', icon: <MdBarChart size={20} />, label: 'Product Reports' },
        { path: '/admin/settings', icon: <MdSettings size={20} />, label: 'Settings' },
    ];

    return (
        <div className="h-screen w-54 bg-white text-black fixed left-0 top-0 overflow-y-auto shadow-lg">
            {/* Admin Profile Section */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {user?.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-medium text-black">{user?.userName}</h3>
                        <p className="text-sm text-blue-600">Administrator</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="mt-4">
                <ul className="space-y-1">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-black w-full px-4 py-3 hover:bg-gray-100 rounded-md"
                >
                    <MdLogout size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
