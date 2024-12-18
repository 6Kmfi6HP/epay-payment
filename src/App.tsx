import React, { useState, FormEvent } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';

function App() {
  const [formData, setFormData] = useState({
    money: '',
    name: '',
    type: 'alipay'
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.money || !formData.name) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.money);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Create form and submit
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://pay.747099.xyz/submit.php';

    const params = {
      pid: '1001', // Replace with your merchant ID
      type: formData.type,
      out_trade_no: Date.now().toString(),
      notify_url: 'https://your-domain.com/notify_url', // Replace with your notify URL
      return_url: 'https://your-domain.com/return_url', // Replace with your return URL
      name: formData.name,
      money: formData.money,
      sign_type: 'MD5'
      // Note: Sign parameter should be calculated on the server side for security
    };

    // Create hidden inputs
    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value.toString();
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <CreditCard className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Payment</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter payment details below
          </p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="money" className="block text-sm font-medium text-gray-700">
                Amount (¥)
              </label>
              <input
                id="money"
                name="money"
                type="number"
                step="0.01"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.money}
                onChange={(e) => setFormData({ ...formData, money: e.target.value })}
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Payment Description
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter payment description"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                id="type"
                name="type"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="alipay">Alipay</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Proceed to Payment
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Secure payment processing</p>
        </div>
      </div>
    </div>
  );
}

export default App;