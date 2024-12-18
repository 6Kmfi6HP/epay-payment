import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for your frontend origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Vite dev server ports
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Proxy endpoint for payment API
app.post('/api/payment', async (req, res) => {
  try {
    // Convert JSON body to URLSearchParams
    const formData = new URLSearchParams();
    
    // Add all parameters from the request body
    Object.entries(req.body).forEach(([key, value]) => {
      // Don't encode notify_url and return_url as they're already encoded
      if (key === 'notify_url' || key === 'return_url') {
        formData.append(key, decodeURIComponent(value));
      } else {
        formData.append(key, value);
      }
    });

    console.log('Sending payment request with params:', Object.fromEntries(formData));

    const response = await axios({
      method: 'POST',
      url: `${process.env.VITE_API_URL}/mapi.php`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      },
      data: formData.toString()
    });

    console.log('Payment API response:', response.data);

    if (typeof response.data === 'string' && response.data.includes('Fatal error')) {
      throw new Error(response.data);
    }

    res.json(response.data);
  } catch (error) {
    console.error('Payment API error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
