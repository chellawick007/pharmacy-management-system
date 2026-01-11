import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Plus, 
  X, 
  Eye, 
  Trash2,
  Search,
  Calendar,
  User,
  CreditCard,
  Package,
  UserPlus,
  List,
  Edit
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import CustomerModal from './CustomerModal';

export default function Billing() {
  const { isDark } = useTheme();
  const [bills, setBills] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showAddBill, setShowAddBill] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showAllBills, setShowAllBills] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showManageStock, setShowManageStock] = useState(false);
  const [editBill, setEditBill] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [billsData, medData, custData] = await Promise.all([
        api.getBills(),
        api.getMedicines(),
        api.getCustomers()
      ]);
      setBills(billsData);
      setMedicines(medData);
      setCustomers(custData);
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
  };

  // Calculate statistics
  const totalBills = bills.length;
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.grand_total, 0);
  const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;

  // Filter bills based on search
  const filteredBills = bills.filter(bill => 
    bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.payment_mode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.deleteBill(billId);
        alert('✅ Bill deleted successfully!');
        loadData();
      } catch (error) {
        alert('❌ Error deleting bill: ' + error.message);
      }
    }
  };

  const handleCustomerSubmit = async (customerData) => {
    try {
      await api.addCustomer(customerData);
      alert('✅ Customer added successfully!');
      setShowAddCustomer(false);
      loadData();
    } catch (error) {
      alert('❌ Error adding customer: ' + error.message);
    }
  };

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Receipt className="text-blue-500" size={32} />
            Billing Management
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage invoices and track revenue
          </p>
        </div>
        <button
          onClick={() => setShowAddBill(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          Add New Bill
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={<FileText size={24} />}
          title="Total Bills"
          value={totalBills}
          color="blue"
          isDark={isDark}
        />
        <StatsCard
          icon={<DollarSign size={24} />}
          title="Total Revenue"
          value={`₹${totalRevenue.toFixed(2)}`}
          color="green"
          isDark={isDark}
        />
        <StatsCard
          icon={<TrendingUp size={24} />}
          title="Avg Bill Value"
          value={`₹${avgBillValue.toFixed(2)}`}
          color="purple"
          isDark={isDark}
        />
      </div>

      {/* Main Content Grid - Search & Table on left, Quick Actions on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Search and Table (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl shadow-lg`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by bill number, customer, or payment mode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Bills Table */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Bills History</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Bill Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Total Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Payment Mode</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBills.length > 0 ? (
                    filteredBills.slice(0, 10).map((bill) => (
                      <tr 
                        key={bill._id}
                        className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                            {bill.bill_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span>{bill.customer_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            ₹{bill.grand_total.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bill.payment_mode === 'Cash' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : bill.payment_mode === 'Card'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {bill.payment_mode}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar size={14} />
                            {new Date(bill.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedBill(bill)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => setEditBill(bill)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Edit Bill"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteBill(bill._id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No bills found</p>
                        <p className="text-sm">Create your first bill to get started</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions (1/4 width) */}
        <div className="lg:col-span-1">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 sticky top-6`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={20} />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowAllBills(true)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 ${
                  isDark 
                    ? 'border-blue-700 bg-blue-900/20 hover:bg-blue-900/40 text-blue-300' 
                    : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700'
                } transition-all hover:scale-105`}
              >
                <List size={20} />
                <div className="text-left">
                  <p className="font-semibold text-sm">View All Bills</p>
                  <p className="text-xs opacity-75">See complete history</p>
                </div>
              </button>

              <button
                onClick={() => setShowAddCustomer(true)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 ${
                  isDark 
                    ? 'border-purple-700 bg-purple-900/20 hover:bg-purple-900/40 text-purple-300' 
                    : 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700'
                } transition-all hover:scale-105`}
              >
                <UserPlus size={20} />
                <div className="text-left">
                  <p className="font-semibold text-sm">Add Customer</p>
                  <p className="text-xs opacity-75">Register new customer</p>
                </div>
              </button>

              <button
                onClick={() => setShowManageStock(true)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 ${
                  isDark 
                    ? 'border-green-700 bg-green-900/20 hover:bg-green-900/40 text-green-300' 
                    : 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700'
                } transition-all hover:scale-105`}
              >
                <Package size={20} />
                <div className="text-left">
                  <p className="font-semibold text-sm">Manage Stock</p>
                  <p className="text-xs opacity-75">Update inventory</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddBill && (
        <AddBillModal
          isDark={isDark}
          medicines={medicines}
          customers={customers}
          onClose={() => setShowAddBill(false)}
          onSuccess={() => {
            setShowAddBill(false);
            loadData();
          }}
        />
      )}

      {/* Edit Bill Modal */}
      {editBill && (
        <EditBillModal
          isDark={isDark}
          bill={editBill}
          medicines={medicines}
          customers={customers}
          onClose={() => setEditBill(null)}
          onSuccess={() => {
            setEditBill(null);
            loadData();
          }}
        />
      )}

      {/* View Bill Modal */}
      {selectedBill && (
        <ViewBillModal
          isDark={isDark}
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}

      {/* Quick Action Modals */}
      {showAllBills && (
        <AllBillsModal
          isDark={isDark}
          bills={bills}
          onClose={() => setShowAllBills(false)}
          onViewBill={(bill) => {
            setShowAllBills(false);
            setSelectedBill(bill);
          }}
        />
      )}

      {showAddCustomer && (
        <CustomerModal
          isOpen={showAddCustomer}
          onClose={() => setShowAddCustomer(false)}
          onSubmit={handleCustomerSubmit}
          isDark={isDark}
        />
      )}

      {showManageStock && (
        <ManageStockModal
          isDark={isDark}
          medicines={medicines}
          onClose={() => {
            setShowManageStock(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, title, value, color, isDark }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-xl text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Add Bill Modal Component
function AddBillModal({ isDark, medicines, customers, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_gstin: '',
    billing_address: '',
    payment_mode: 'Cash',
    items: [],
    subtotal: 0,
    gst_percentage: 18,
    gst_amount: 0,
    grand_total: 0
  });

  const [currentItem, setCurrentItem] = useState({
    medicine_id: '',
    medicine_name: '',
    quantity: 1,
    price: 0,
    total: 0
  });

  const handleAddItem = () => {
    if (!currentItem.medicine_id || currentItem.quantity <= 0) {
      alert('Please select a medicine and enter valid quantity');
      return;
    }

    const medicine = medicines.find(m => m._id === currentItem.medicine_id);
    if (!medicine) return;

    if (currentItem.quantity > medicine.quantity) {
      alert(`Only ${medicine.quantity} units available!`);
      return;
    }

    const newItem = {
      ...currentItem,
      total: currentItem.quantity * currentItem.price
    };

    const newItems = [...formData.items, newItem];
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const gst_amount = (subtotal * formData.gst_percentage) / 100;
    const grand_total = subtotal + gst_amount;

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      gst_amount,
      grand_total
    });

    setCurrentItem({
      medicine_id: '',
      medicine_name: '',
      quantity: 1,
      price: 0,
      total: 0
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const gst_amount = (subtotal * formData.gst_percentage) / 100;
    const grand_total = subtotal + gst_amount;

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      gst_amount,
      grand_total
    });
  };

  const handleMedicineSelect = (medicineId) => {
    const medicine = medicines.find(m => m._id === medicineId);
    if (medicine) {
      setCurrentItem({
        medicine_id: medicine._id,
        medicine_name: medicine.name,
        quantity: 1,
        price: medicine.price,
        total: medicine.price
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Please add at least one item to the bill');
      return;
    }

    try {
      await api.createBill(formData);
      alert('✅ Bill created successfully!');
      onSuccess();
    } catch (error) {
      alert('❌ Error creating bill: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full p-6 my-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="text-blue-500" />
            Create New Bill
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Mode *</label>
              <select
                required
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          {/* GST Details (Optional) */}
          <div className={`${isDark ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg`}>
            <h3 className="text-sm font-semibold mb-3 text-blue-600 dark:text-blue-400">GST Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer GSTIN</label>
                <input
                  type="text"
                  value={formData.customer_gstin}
                  onChange={(e) => setFormData({ ...formData, customer_gstin: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength="15"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">15-digit GST Identification Number</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Billing Address</label>
                <textarea
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                  placeholder="Enter billing address"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Add Items Section */}
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <select
                  value={currentItem.medicine_id}
                  onChange={(e) => handleMedicineSelect(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                >
                  <option value="">Select Medicine</option>
                  {medicines.map(med => (
                    <option key={med._id} value={med._id}>
                      {med.name} - ₹{med.price} (Stock: {med.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 1;
                    setCurrentItem({
                      ...currentItem,
                      quantity: qty,
                      total: qty * currentItem.price
                    });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                  placeholder="Quantity"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className="text-lg font-semibold mb-3">Bill Items</h3>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                    <div className="flex-1">
                      <p className="font-medium">{item.medicine_name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ₹{item.price.toFixed(2)} = ₹{item.total.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bill Summary */}
          {formData.items.length > 0 && (
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg space-y-2`}>
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>GST ({formData.gst_percentage}%):</span>
                <span className="font-semibold">₹{formData.gst_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-green-600 dark:text-green-400 pt-2 border-t border-gray-300 dark:border-gray-600">
                <span>Grand Total:</span>
                <span>₹{formData.grand_total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.items.length === 0}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Bill Modal Component
function EditBillModal({ isDark, bill, medicines, customers, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: bill.customer_name || '',
    customer_phone: bill.customer_phone || '',
    customer_gstin: bill.customer_gstin || '',
    billing_address: bill.billing_address || '',
    payment_mode: bill.payment_mode || 'Cash',
    items: bill.items || [],
    subtotal: bill.subtotal || 0,
    gst_percentage: bill.gst_percentage || 18,
    gst_amount: bill.gst_amount || 0,
    grand_total: bill.grand_total || 0
  });

  const [currentItem, setCurrentItem] = useState({
    medicine_id: '',
    medicine_name: '',
    quantity: 1,
    price: 0,
    total: 0
  });

  const handleAddItem = () => {
    if (!currentItem.medicine_id || currentItem.quantity <= 0) {
      alert('Please select a medicine and enter valid quantity');
      return;
    }

    const medicine = medicines.find(m => m._id === currentItem.medicine_id);
    if (!medicine) return;

    if (currentItem.quantity > medicine.quantity) {
      alert(`Only ${medicine.quantity} units available!`);
      return;
    }

    const newItem = {
      ...currentItem,
      total: currentItem.quantity * currentItem.price
    };

    const newItems = [...formData.items, newItem];
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const gst_amount = (subtotal * formData.gst_percentage) / 100;
    const grand_total = subtotal + gst_amount;

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      gst_amount,
      grand_total
    });

    setCurrentItem({
      medicine_id: '',
      medicine_name: '',
      quantity: 1,
      price: 0,
      total: 0
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
    const gst_amount = (subtotal * formData.gst_percentage) / 100;
    const grand_total = subtotal + gst_amount;

    setFormData({
      ...formData,
      items: newItems,
      subtotal,
      gst_amount,
      grand_total
    });
  };

  const handleMedicineSelect = (medicineId) => {
    const medicine = medicines.find(m => m._id === medicineId);
    if (medicine) {
      setCurrentItem({
        medicine_id: medicine._id,
        medicine_name: medicine.name,
        quantity: 1,
        price: medicine.price,
        total: medicine.price
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Please add at least one item to the bill');
      return;
    }

    try {
      // Delete old bill and create new one (since we need to restore/update stock)
      await api.deleteBill(bill._id);
      await api.createBill(formData);
      alert('✅ Bill updated successfully!');
      onSuccess();
    } catch (error) {
      alert('❌ Error updating bill: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full p-6 my-8`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Edit className="text-green-500" />
            Edit Bill - {bill.bill_number}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Mode *</label>
              <select
                required
                value={formData.payment_mode}
                onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>

          {/* GST Details (Optional) */}
          <div className={`${isDark ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg`}>
            <h3 className="text-sm font-semibold mb-3 text-blue-600 dark:text-blue-400">GST Details (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Customer GSTIN</label>
                <input
                  type="text"
                  value={formData.customer_gstin}
                  onChange={(e) => setFormData({ ...formData, customer_gstin: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength="15"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">15-digit GST Identification Number</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Billing Address</label>
                <textarea
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                  placeholder="Enter billing address"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Add Items Section */}
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <select
                  value={currentItem.medicine_id}
                  onChange={(e) => handleMedicineSelect(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                >
                  <option value="">Select Medicine</option>
                  {medicines.map(med => (
                    <option key={med._id} value={med._id}>
                      {med.name} - ₹{med.price} (Stock: {med.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 1;
                    setCurrentItem({
                      ...currentItem,
                      quantity: qty,
                      total: qty * currentItem.price
                    });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                  placeholder="Quantity"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Items List */}
          {formData.items.length > 0 && (
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
              <h3 className="text-lg font-semibold mb-3">Bill Items</h3>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                    <div className="flex-1">
                      <p className="font-medium">{item.medicine_name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × ₹{item.price.toFixed(2)} = ₹{item.total.toFixed(2)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bill Summary */}
          {formData.items.length > 0 && (
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg space-y-2`}>
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>GST ({formData.gst_percentage}%):</span>
                <span className="font-semibold">₹{formData.gst_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-green-600 dark:text-green-400 pt-2 border-t border-gray-300 dark:border-gray-600">
                <span>Grand Total:</span>
                <span>₹{formData.grand_total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formData.items.length === 0}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Update Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View Bill Modal Component
function ViewBillModal({ isDark, bill, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Modal Overlay - Hidden in print */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:hidden">
        <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold">Bill Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          {/* Printable Invoice */}
          <div className="invoice-content">
          <div className="p-8">
            {/* Invoice Header */}
            <div className="border-b-4 border-blue-600 pb-6 mb-6 print:border-blue-600">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h1>
                  <p className="text-gray-600 dark:text-gray-400">Smart Pharmacy Management</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    123 Medical Street, Healthcare District<br/>
                    City, State - 123456<br/>
                    Phone: +91 98765 43210<br/>
                    Email: info@smartpharmacy.com
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block mb-3">
                    <p className="text-xs">Invoice No.</p>
                    <p className="font-mono font-bold text-lg">{bill.bill_number}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Date:</strong> {new Date(bill.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Time:</strong> {new Date(bill.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Bill To:</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-bold text-lg mb-1">{bill.customer_name}</p>
                  {bill.customer_phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {bill.customer_phone}</p>
                  )}
                  {bill.billing_address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{bill.billing_address}</p>
                  )}
                  {bill.customer_gstin && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <strong>GSTIN:</strong> {bill.customer_gstin}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Payment Details:</h3>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm mb-2">
                    <strong>Payment Mode:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                      bill.payment_mode === 'Cash' 
                        ? 'bg-green-100 text-green-800'
                        : bill.payment_mode === 'Card'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {bill.payment_mode}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong> <span className="text-green-600">PAID</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">#</th>
                    <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Item Description</th>
                    <th className="border border-blue-700 px-4 py-3 text-center text-sm font-semibold">Qty</th>
                    <th className="border border-blue-700 px-4 py-3 text-right text-sm font-semibold">Unit Price</th>
                    <th className="border border-blue-700 px-4 py-3 text-right text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items?.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm">{index + 1}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3">
                        <p className="font-medium">{item.medicine_name}</p>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-right font-semibold">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-semibold">₹{bill.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">GST ({bill.gst_percentage}%):</span>
                    <span className="font-semibold">₹{bill.gst_amount.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Grand Total:</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">₹{bill.grand_total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Amount in Words:</strong> {numberToWords(bill.grand_total)} Rupees Only
              </p>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Goods once sold cannot be returned</li>
                    <li>• Prescription required for scheduled drugs</li>
                    <li>• Check expiry date before use</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="border-t-2 border-gray-800 dark:border-gray-300 pt-2 mt-12 inline-block">
                    <p className="text-sm font-semibold">Authorized Signature</p>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Thank you for your business! | For queries: support@smartpharmacy.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            Print Bill
          </button>
        </div>
      </div>
    </div>

    {/* Hidden Print Version */}
    <div className="hidden print:block print-invoice">
      <div className="p-8 bg-white text-black">
        {/* Invoice Header */}
        <div className="border-b-4 border-blue-600 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h1>
              <p className="text-gray-600">Smart Pharmacy Management</p>
              <p className="text-sm text-gray-500 mt-1">
                123 Medical Street, Healthcare District<br/>
                City, State - 123456<br/>
                Phone: +91 98765 43210<br/>
                Email: info@smartpharmacy.com
              </p>
            </div>
            <div className="text-right">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block mb-3">
                <p className="text-xs">Invoice No.</p>
                <p className="font-mono font-bold text-lg">{bill.bill_number}</p>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {new Date(bill.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Time:</strong> {new Date(bill.created_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="font-bold text-lg mb-1">{bill.customer_name}</p>
              {bill.customer_phone && (
                <p className="text-sm text-gray-600">Phone: {bill.customer_phone}</p>
              )}
              {bill.billing_address && (
                <p className="text-sm text-gray-600 mt-2">{bill.billing_address}</p>
              )}
              {bill.customer_gstin && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>GSTIN:</strong> {bill.customer_gstin}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Payment Details:</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm mb-2">
                <strong>Payment Mode:</strong> 
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                  bill.payment_mode === 'Cash' 
                    ? 'bg-green-100 text-green-800'
                    : bill.payment_mode === 'Card'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {bill.payment_mode}
                </span>
              </p>
              <p className="text-sm">
                <strong>Status:</strong> <span className="text-green-600 font-semibold">PAID</span>
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">#</th>
                <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Item Description</th>
                <th className="border border-blue-700 px-4 py-3 text-center text-sm font-semibold">Qty</th>
                <th className="border border-blue-700 px-4 py-3 text-right text-sm font-semibold">Unit Price</th>
                <th className="border border-blue-700 px-4 py-3 text-right text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items?.map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="border border-gray-300 px-4 py-3 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <p className="font-medium">{item.medicine_name}</p>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-semibold">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₹{bill.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST ({bill.gst_percentage}%):</span>
                <span className="font-semibold">₹{bill.gst_amount.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Grand Total:</span>
                  <span className="text-2xl font-bold text-green-600">₹{bill.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm">
            <strong>Amount in Words:</strong> {numberToWords(bill.grand_total)} Rupees Only
          </p>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Goods once sold cannot be returned</li>
                <li>• Prescription required for scheduled drugs</li>
                <li>• Check expiry date before use</li>
              </ul>
            </div>
            <div className="text-right">
              <div className="border-t-2 border-gray-800 pt-2 mt-12 inline-block">
                <p className="text-sm font-semibold">Authorized Signature</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-500">
              Thank you for your business! | For queries: support@smartpharmacy.com
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body * {
            visibility: hidden;
          }
          .print-invoice,
          .print-invoice * {
            visibility: visible;
          }
          .print-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  </>
  );
}

// Helper function to convert number to words (Indian system)
function numberToWords(num) {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertTwoDigit = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  };
  
  const convertThreeDigit = (n) => {
    if (n < 100) return convertTwoDigit(n);
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertTwoDigit(n % 100) : '');
  };
  
  num = Math.floor(num);
  
  if (num < 1000) return convertThreeDigit(num);
  if (num < 100000) {
    const thousands = Math.floor(num / 1000);
    const remainder = num % 1000;
    return convertTwoDigit(thousands) + ' Thousand' + (remainder ? ' ' + convertThreeDigit(remainder) : '');
  }
  if (num < 10000000) {
    const lakhs = Math.floor(num / 100000);
    const remainder = num % 100000;
    return convertTwoDigit(lakhs) + ' Lakh' + (remainder ? ' ' + convertThreeDigit(Math.floor(remainder / 1000)) + ' Thousand' + (remainder % 1000 ? ' ' + convertThreeDigit(remainder % 1000) : '') : '');
  }
  
  return 'Amount Too Large';
}

// All Bills Modal Component
function AllBillsModal({ isDark, bills, onClose, onViewBill }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredBills = bills.filter(bill => 
    bill.bill_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.payment_mode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <List className="text-blue-500" />
            All Bills
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Bills List */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-3">
            {filteredBills.map((bill) => (
              <div 
                key={bill._id}
                className={`${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'} p-4 rounded-lg cursor-pointer transition-all border-2 border-transparent hover:border-blue-500`}
                onClick={() => onViewBill(bill)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">{bill.bill_number}</p>
                    <p className="text-sm mt-1">{bill.customer_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(bill.created_at).toLocaleDateString()} • {bill.payment_mode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{bill.grand_total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {bill.items?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {filteredBills.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No bills found</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Manage Stock Modal Component
function ManageStockModal({ isDark, medicines, onClose }) {
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedicines = medicines.filter(med =>
    med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStock = async () => {
    if (!selectedMedicine || !quantity) {
      alert('Please select a medicine and enter quantity');
      return;
    }

    const medicine = medicines.find(m => m._id === selectedMedicine);
    if (!medicine) return;

    const updatedMedicine = {
      ...medicine,
      quantity: medicine.quantity + parseInt(quantity)
    };

    try {
      await api.updateMedicine(medicine._id, updatedMedicine);
      alert('✅ Stock updated successfully!');
      setSelectedMedicine('');
      setQuantity('');
      onClose();
    } catch (error) {
      alert('❌ Error updating stock: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-green-500" />
            Manage Stock
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Add Stock Section */}
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <h3 className="text-lg font-semibold mb-4">Add Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <select
                  value={selectedMedicine}
                  onChange={(e) => setSelectedMedicine(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                >
                  <option value="">Select Medicine</option>
                  {medicines.map(med => (
                    <option key={med._id} value={med._id}>
                      {med.name} - Current: {med.quantity}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
            </div>
            <button
              onClick={handleUpdateStock}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Update Stock
            </button>
          </div>

          {/* Current Stock Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Inventory</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredMedicines.map((med) => (
                <div 
                  key={med._id}
                  className={`flex justify-between items-center p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}
                >
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{med.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${med.quantity < med.reorder_level ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {med.quantity} units
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ₹{med.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

