'use strict';

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 2,
    name: 'Dynamic M75B',
    category: 'Noise-Cancelling Wireless Headphones',
    price: 1499000,
    image: 'images/black-4.png',
    variants: {
      black: {
        label: 'Black',
        stock: 1,
        images: [
          { src: 'images/black-4.png', alt: 'Dynamic M75B Black — angle view' },
          { src: 'images/black-3.png', alt: 'Dynamic M75B Black — front view' },
          { src: 'images/black-2.png', alt: 'Dynamic M75B Black — side view' },
          { src: 'images/black-1.png', alt: 'Dynamic M75B Black — detail view' },
        ],
      },
      silver: {
        label: 'Silver',
        stock: 0,
        images: [
          { src: 'images/silver-4.png', alt: 'Dynamic M75B Silver — angle view' },
          { src: 'images/silver-3.png', alt: 'Dynamic M75B Silver — front view' },
          { src: 'images/silver-2.png', alt: 'Dynamic M75B Silver — side view' },
          { src: 'images/silver-1.png', alt: 'Dynamic M75B Silver — detail view' },
        ],
      },
    },
    description: [
      'The Dynamic M75B Active Noise-Cancelling Wireless Headphones deliver detailed, serious acoustics and custom-tailored sound with 40mm Beryllium drivers and Adaptive Active Noise Cancellation for the perfect combination of sound and silence.',
      'Experience effortless all-day listening with lightweight anodized aluminum and soft lambskin leather in a distinct, refined silhouette — built for professionals who demand both performance and elegance.',
      "Featuring TUMI's iconic design language, the M75B is a seamless blend of engineering precision and artistic expression, designed to enhance every journey whether in the office, the cabin, or the city.",
    ].join('\n\n'),
  },
];

app.get('/', (req, res) => {
  res.json({ message: 'Dynamic Product REST API is running' });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => String(item.id) === req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product tidak ditemukan' });
  }

  return res.status(200).json(product);
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
