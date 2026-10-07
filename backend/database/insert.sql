-- Insert the Dynamic M75B product.
INSERT INTO products (id, name, category, price, image, description)
VALUES (
  2,
  'Dynamic M75B',
  'Noise-Cancelling Wireless Headphones',
  1499000,
  'images/black-4.png',
  'The Dynamic M75B Active Noise-Cancelling Wireless Headphones deliver detailed, serious acoustics and custom-tailored sound with 40mm Beryllium drivers and Adaptive Active Noise Cancellation for the perfect combination of sound and silence.

Experience effortless all-day listening with lightweight anodized aluminum and soft lambskin leather in a distinct, refined silhouette — built for professionals who demand both performance and elegance.

Featuring TUMI''s iconic design language, the M75B is a seamless blend of engineering precision and artistic expression, designed to enhance every journey whether in the office, the cabin, or the city.'
);

-- Insert the Black and Silver variants for product 2.
INSERT INTO product_variants (id, product_id, variant_key, label, stock)
VALUES
  (201, 2, 'black', 'Black', 1),
  (202, 2, 'silver', 'Silver', 0);

-- Insert gallery images in the same order as the API response.
INSERT INTO product_images (id, variant_id, src, alt, image_order)
VALUES
  (2011, 201, 'images/black-4.png', 'Dynamic M75B Black — angle view', 1),
  (2012, 201, 'images/black-3.png', 'Dynamic M75B Black — front view', 2),
  (2013, 201, 'images/black-2.png', 'Dynamic M75B Black — side view', 3),
  (2014, 201, 'images/black-1.png', 'Dynamic M75B Black — detail view', 4),
  (2021, 202, 'images/silver-4.png', 'Dynamic M75B Silver — angle view', 1),
  (2022, 202, 'images/silver-3.png', 'Dynamic M75B Silver — front view', 2),
  (2023, 202, 'images/silver-2.png', 'Dynamic M75B Silver — side view', 3),
  (2024, 202, 'images/silver-1.png', 'Dynamic M75B Silver — detail view', 4);
