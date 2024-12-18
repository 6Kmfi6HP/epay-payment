import { useState, FormEvent } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { buildRequestParams, submitApiPayment, getClientIp, detectDevice, PaymentMethod } from './utils/payment';

function App() {
  const [formData, setFormData] = useState({
    money: '',
    name: '',
    type: 'alipay',
    paymentMethod: 'page' as PaymentMethod
  });
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setQrCode('');
    setLoading(true);
    
    try {
      if (!formData.money || !formData.name) {
        setError('Please fill in all required fields');
        return;
      }

      const amount = parseFloat(formData.money);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const baseParams = {
        pid: import.meta.env.VITE_MERCHANT_ID,
        type: formData.type,
        out_trade_no: Date.now().toString(),
        notify_url: 'https://your-domain.com/notify_url',
        return_url: 'https://your-domain.com/return_url',
        name: formData.name,
        money: formData.money
      };

      if (formData.paymentMethod === 'api') {
        // API Payment
        const clientip = await getClientIp();
        const device = detectDevice();
        
        const apiParams = {
          ...baseParams,
          clientip,
          device
        };

        const response = await submitApiPayment(apiParams);
        
        if (response.code !== 1) {
          setError(response.msg || 'Payment failed');
          return;
        }

        if (response.qrcode) {
          setQrCode(response.qrcode);
        } else if (response.payurl) {
          window.location.href = response.payurl;
        } else if (response.urlscheme) {
          window.location.href = response.urlscheme;
        }
      } else {
        // Page Redirect Payment
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${import.meta.env.VITE_API_URL}/submit.php`;

        const paramsWithSign = buildRequestParams(baseParams);

        // Create hidden inputs
        Object.entries(paramsWithSign).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value.toString();
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setError('Payment request failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

        {qrCode && (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} 
                   alt="Payment QR Code" 
                   className="mx-auto" />
            </div>
            <p className="mt-2 text-sm text-gray-500">Scan the QR code to pay</p>
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

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Payment Interface
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              >
                <option value="page">Page Redirect</option>
                <option value="api">API (QR Code)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
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