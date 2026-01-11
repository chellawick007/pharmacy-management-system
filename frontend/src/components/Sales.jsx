import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api';

export default function Sales() {
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    medicine_id: '',
    medicine_name: '',
    quantity: '',
    price: '',
    available_stock: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [medData, salesData] = await Promise.all([
      api.getMedicines(),
      api.getSales(),
    ]);
    setMedicines(medData);
    setSales(salesData);
  };

  const handleMedicineSelect = (e) => {
    const selectedMed = medicines.find((m) => m._id === e.target.value);
    if (selectedMed) {
      setFormData({
        medicine_id: selectedMed._id,
        medicine_name: selectedMed.name,
        quantity: '',
        price: selectedMed.price,
        available_stock: selectedMed.quantity,
      });
    }
  };

  const handleQuantityChange = (e) => {
    const qty = e.target.value;

    setFormData({ ...formData, quantity: qty });

    if (qty && parseInt(qty) > formData.available_stock) {
      setErrorMessage(`Only ${formData.available_stock} units available in stock!`);
      setShowError(true);
    } else {
      setShowError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestedQty = parseInt(formData.quantity);

    if (requestedQty > formData.available_stock) {
      setErrorMessage(
        `Cannot sell ${requestedQty} units!\nOnly ${formData.available_stock} units available in stock.`
      );
      setShowError(true);
      return;
    }

    const saleData = {
      medicine_id: formData.medicine_id,
      medicine_name: formData.medicine_name,
      quantity: requestedQty,
      price: parseFloat(formData.price),
      total: requestedQty * parseFloat(formData.price),
    };

    try {
      await api.addSale(saleData);

      setFormData({
        medicine_id: '',
        medicine_name: '',
        quantity: '',
        price: '',
        available_stock: 0,
      });

      setShowError(false);
      loadData();
      alert('✅ Sale recorded successfully!');
    } catch (error) {
      setErrorMessage(error.message || 'Error recording sale');
      setShowError(true);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ShoppingCart /> Sales Management
      </h1>

      {/* Error Alert Modal */}
      {showError && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white w-96 p-6 rounded shadow-lg relative">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="text-red-500" />
              <h2 className="text-lg font-semibold">Insufficient Stock</h2>
            </div>

            <p className="mb-4 text-gray-700 whitespace-pre-line">{errorMessage}</p>

            <button
              onClick={() => setShowError(false)}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              OK, I Understand
            </button>

            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowError(false)}
            >
              <X />
            </button>
          </div>
        </div>
      )}

      {/* Sale Form */}
      <div className="mt-8 bg-white p-5 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Record New Sale</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium">Select Medicine</label>
          <select
            className="w-full border p-2 rounded mb-4"
            value={formData.medicine_id}
            onChange={handleMedicineSelect}
          >
            <option>-- Select Medicine --</option>
            {medicines.map((med) => (
              <option key={med._id} value={med._id}>
                {med.name} (Available: {med.quantity} units)
              </option>
            ))}
          </select>

          {formData.medicine_id && (
            <>
              <label className="block font-medium">Quantity to Sell</label>
              <p className="text-gray-500 mb-1">
                Available: {formData.available_stock} units
              </p>

              <input
                type="number"
                className="w-full border p-2 rounded mb-4"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleQuantityChange}
                required
              />

              <label className="block font-medium">Price per Unit</label>
              <input
                type="number"
                step="0.01"
                className="w-full border p-2 rounded mb-4"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />

              {formData.quantity && formData.price && (
                <p className="font-semibold mb-4">
                  Total Amount:{' '}
                  <span className="text-green-600">
                    ₹{(formData.quantity * formData.price).toFixed(2)}
                  </span>
                </p>
              )}

              <button
                type="submit"
                className={`w-full py-2 rounded-lg text-white ${
                  showError
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {showError
                  ? '❌ Cannot Proceed - Insufficient Stock'
                  : '✅ Record Sale'}
              </button>
            </>
          )}
        </form>
      </div>

      {/* Sales History */}
      <div className="mt-8 bg-white p-5 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Recent Sales</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Medicine</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((sale) => (
              <tr key={sale._id} className="text-center border">
                <td className="p-2 border">{sale.medicine_name}</td>
                <td className="p-2 border">{sale.quantity}</td>
                <td className="p-2 border">₹{sale.price}</td>
                <td className="p-2 border">₹{sale.total.toFixed(2)}</td>
                <td className="p-2 border">{sale.sale_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}