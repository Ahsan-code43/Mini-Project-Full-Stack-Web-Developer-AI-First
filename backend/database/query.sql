-- Stores the main product details.
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(150) NOT NULL,
  price INT NOT NULL,
  image VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
);

-- Stores each product color variant and its stock.
CREATE TABLE product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  variant_key VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Stores gallery images for each variant.
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  variant_id INT NOT NULL,
  src VARCHAR(255) NOT NULL,
  alt VARCHAR(255) NOT NULL,
  image_order INT NOT NULL,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- Shows product details together with each variant and its images.
SELECT
  products.id,
  products.name,
  products.category,
  products.price,
  products.image,
  products.description,
  product_variants.variant_key,
  product_variants.label AS variant_label,
  product_variants.stock,
  product_images.src AS image_src,
  product_images.alt AS image_alt,
  product_images.image_order
FROM products
LEFT JOIN product_variants
  ON product_variants.product_id = products.id
LEFT JOIN product_images
  ON product_images.variant_id = product_variants.id;
