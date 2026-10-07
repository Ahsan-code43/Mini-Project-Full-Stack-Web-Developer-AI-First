/* ============================================================
   PRODUCT DETAIL — Product Page Script
   Features:
   - Header scroll effect
   - Search bar toggle
   - Mobile nav toggle
   - Currency selector
   - Product gallery (thumbnails + prev/next + dots)
   - Color variant selection (with stock per variant)
   - Quantity control (clamped to stock)
   - Add to Cart
   - Cart drawer (add, remove, total, badge)
   - Specs tabs
   - Toast notification
   ============================================================ */

'use strict';

/* =============================================
   DATA
   ============================================= */
let PRODUCT = null;

const CURRENCIES = {
  IDR: { symbol: 'Rp', rate: 1, locale: 'id-ID' },
  USD: { symbol: '$', rate: 0.000063, locale: 'en-US' },
  SGD: { symbol: 'S$', rate: 0.000085, locale: 'en-SG' },
};

/* =============================================
   STATE
   ============================================= */
const state = {
  currentColor: null,
  currentImageIndex: 0,
  quantity: 1,
  currency: 'IDR',
  cart: [],        // { id, name, color, qty, price, imgSrc, imgAlt }
};

/* =============================================
   HELPERS
   ============================================= */

/**
 * Format a price value according to the active currency.
 * @param {number} priceIDR  — base price in IDR
 * @returns {string}
 */
function formatPrice(priceIDR) {
  const { symbol, rate, locale } = CURRENCIES[state.currency];
  const converted = priceIDR * rate;

  if (state.currency === 'IDR') {
    // Format using the active IDR locale.
    return `${symbol}${converted.toLocaleString('id-ID')}`;
  }

  return `${symbol}${converted.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Show a toast message.
 * @param {string} message
 * @param {'success'|'error'} type
 * @param {number} duration — ms
 */
let toastTimer = null;
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.className = `toast is-${type}`;
  toast.textContent = message;

  toastTimer = setTimeout(() => {
    toast.className = 'toast';
    toast.textContent = '';
  }, duration);
}

async function fetchProduct() {
  PRODUCT = null;

  try {
    const response = await fetch('http://localhost:3000/api/products/2');
    if (!response.ok) {
      throw new Error(`Product request failed with status ${response.status}`);
    }

    const product = await response.json();
    const variants = product && product.variants;
    const variantEntries = variants && Object.entries(variants);

    if (
      !product ||
      typeof product.name !== 'string' ||
      !product.name.trim() ||
      typeof product.category !== 'string' ||
      !product.category.trim() ||
      typeof product.description !== 'string' ||
      !Number.isFinite(product.price) ||
      product.price < 0 ||
      typeof product.image !== 'string' ||
      !product.image.trim() ||
      !variantEntries?.length
    ) {
      throw new Error('Product response is missing required product data.');
    }

    variantEntries.forEach(([color, variant]) => {
      if (
        !color ||
        !variant ||
        typeof variant.label !== 'string' ||
        !Number.isInteger(variant.stock) ||
        variant.stock < 0 ||
        !Array.isArray(variant.images) ||
        variant.images.length === 0
      ) {
        throw new Error(`Product variant "${color}" is invalid.`);
      }

      variant.images.forEach((image, index) => {
        if (
          !image ||
          typeof image.src !== 'string' ||
          !image.src.trim() ||
          typeof image.alt !== 'string'
        ) {
          throw new Error(
            `Product variant "${color}" image ${index + 1} is invalid.`
          );
        }
      });
    });

    PRODUCT = product;
    return PRODUCT;
  } catch (error) {
    console.error('Unable to load product:', error);
    showToast('Unable to load product. Please try again later.', 'error');
    return null;
  }
}

function renderProductInfo() {
  const productCategory = document.getElementById('productCategory');
  const productName = document.getElementById('productName');
  const descriptionHeading = document.getElementById('productDescriptionHeading');
  const breadcrumb = document.getElementById('productBreadcrumb');
  const description = document.getElementById('productDescription');
  if (
    !PRODUCT ||
    !productCategory ||
    !productName ||
    !descriptionHeading ||
    !breadcrumb ||
    !description
  ) {
    console.error('Unable to render product info: required DOM elements are missing.');
    showToast('Unable to display product details.', 'error');
    return false;
  }

  productCategory.textContent = PRODUCT.category;
  productName.textContent = PRODUCT.name;
  descriptionHeading.textContent = `About the ${PRODUCT.name}`;
  breadcrumb.textContent = PRODUCT.name;
  document.title = `${PRODUCT.name} — ${PRODUCT.category}`;

  description.replaceChildren();
  PRODUCT.description.split(/\n\s*\n/).forEach((paragraphText) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = paragraphText;
    description.appendChild(paragraph);
  });
  return true;
}

function renderProductVariants() {
  const swatches = document.querySelector('.variant-swatches');
  const selectedColorName = document.getElementById('selectedColorName');
  if (!PRODUCT || !swatches || !selectedColorName) {
    console.error('Unable to render product variants: required DOM elements are missing.');
    showToast('Unable to display product variants.', 'error');
    return false;
  }

  const variants = Object.entries(PRODUCT.variants);
  if (!Object.prototype.hasOwnProperty.call(PRODUCT.variants, state.currentColor)) {
    state.currentColor = variants[0][0];
  }

  swatches.replaceChildren();
  variants.forEach(([color, variant]) => {
    const isSoldOut = variant.stock === 0;
    const label = document.createElement('label');
    label.className = `swatch-label${isSoldOut ? ' swatch-label--soldout' : ''}`;
    label.title = `${variant.label}${isSoldOut ? ' — Sold Out' : ''}`;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'color';
    input.value = color;
    input.checked = color === state.currentColor;
    input.setAttribute(
      'aria-label',
      `${variant.label}${isSoldOut ? ' — Sold Out' : ''}`
    );

    const swatch = document.createElement('span');
    swatch.className = `swatch swatch--${color}`;
    swatch.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'swatch-name';
    name.textContent = variant.label;

    label.append(input, swatch, name);

    if (isSoldOut) {
      const soldOut = document.createElement('span');
      soldOut.className = 'swatch-soldout';
      soldOut.textContent = 'Sold Out';
      label.appendChild(soldOut);
    }

    swatches.appendChild(label);
  });
  return true;
}

function renderProductGallery() {
  const thumbs = document.querySelector('.gallery-thumbs');
  const track = document.getElementById('galleryTrack');
  if (!PRODUCT || !thumbs || !track) {
    console.error('Unable to render product gallery: required DOM elements are missing.');
    showToast('Unable to display product images.', 'error');
    return false;
  }

  thumbs.replaceChildren();
  track.replaceChildren();

  Object.entries(PRODUCT.variants).forEach(([color, variant]) => {
    variant.images.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.className = 'gallery-slide';
      slide.dataset.color = color;
      slide.dataset.index = index;
      slide.classList.toggle('hidden', color !== state.currentColor);

      const slideImage = document.createElement('img');
      slideImage.src = image.src;
      slideImage.alt = image.alt;
      slideImage.className = 'gallery-img';
      slide.appendChild(slideImage);
      track.appendChild(slide);
    });
  });

  const initialImages = PRODUCT.variants[state.currentColor].images;
  initialImages.forEach((image, index) => {
    const thumb = document.createElement('button');
    thumb.className = `thumb${index === 0 ? ' active' : ''}`;
    thumb.type = 'button';
    thumb.setAttribute('role', 'tab');
    thumb.setAttribute('aria-selected', String(index === 0));
    thumb.setAttribute('aria-label', `View image ${index + 1}`);
    thumb.dataset.index = index;

    const thumbImage = document.createElement('img');
    thumbImage.src = image.src;
    thumbImage.alt = `${image.alt} thumbnail`;
    thumbImage.loading = 'lazy';
    thumb.appendChild(thumbImage);
    thumbs.appendChild(thumb);
  });
  return true;
}

/* =============================================
   HEADER — scroll effect
   ============================================= */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* =============================================
   SEARCH BAR
   ============================================= */
function initSearch() {
  const toggle  = document.getElementById('searchToggle');
  const close   = document.getElementById('searchClose');
  const bar     = document.getElementById('searchBar');
  const input   = document.getElementById('searchInput');
  if (!toggle || !bar) return;

  function openSearch() {
    bar.classList.add('is-open');
    bar.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    input?.focus();
  }

  function closeSearch() {
    bar.classList.remove('is-open');
    bar.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    bar.classList.contains('is-open') ? closeSearch() : openSearch();
  });

  close?.addEventListener('click', closeSearch);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });
}

/* =============================================
   MOBILE NAV
   ============================================= */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('mobileNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));
  });
}

/* =============================================
   CURRENCY SELECTOR
   ============================================= */
function initCurrency() {
  const btn      = document.getElementById('currencyBtn');
  const dropdown = document.getElementById('currencyDropdown');
  const label    = document.getElementById('currencyLabel');
  if (!btn || !dropdown) return;

  function openDropdown() {
    dropdown.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    dropdown.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.contains('is-open') ? closeDropdown() : openDropdown();
  });

  dropdown.querySelectorAll('li').forEach((li) => {
    li.addEventListener('click', () => {
      const currency = li.dataset.currency;
      if (!currency || !CURRENCIES[currency]) return;

      state.currency = currency;
      if (label) label.textContent = currency;

      // Update aria-selected
      dropdown.querySelectorAll('li').forEach((el) => {
        el.setAttribute('aria-selected', String(el.dataset.currency === currency));
      });

      closeDropdown();
      refreshPriceDisplay();
      refreshCartTotal();
    });
  });

  document.addEventListener('click', closeDropdown);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });
}

function refreshPriceDisplay() {
  const priceEl = document.getElementById('productPrice');
  if (priceEl && PRODUCT) priceEl.textContent = formatPrice(PRODUCT.price);
}

/* =============================================
   GALLERY
   ============================================= */
function initGallery() {
  if (!PRODUCT || !PRODUCT.variants[state.currentColor]) return;

  const track   = document.getElementById('galleryTrack');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dotsEl  = document.getElementById('galleryDots');
  const thumbsEl = document.querySelector('.gallery-thumbs');
  if (!track) return;

  // Build dots
  function buildDots(count) {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Image ${i + 1}`);
      dot.setAttribute('aria-selected', String(i === 0));
      dot.dataset.index = i;
      dot.addEventListener('click', () => goToSlide(i));
      dotsEl.appendChild(dot);
    }
  }

  /**
   * Get slides for the current color.
   */
  function getCurrentSlides() {
    return Array.from(
      track.querySelectorAll(`.gallery-slide[data-color="${state.currentColor}"]`)
    );
  }

  /**
   * Activate a slide by index within the current color set.
   */
  function goToSlide(index) {
    const slides = getCurrentSlides();
    if (!slides.length) return;

    const clampedIndex = Math.max(0, Math.min(index, slides.length - 1));
    state.currentImageIndex = clampedIndex;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === clampedIndex);
    });

    // Sync thumbnails
    const thumbs = thumbsEl ? thumbsEl.querySelectorAll('.thumb') : [];
    thumbs.forEach((t, i) => {
      const isActive = i === clampedIndex;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
    });

    // Sync dots
    const dots = dotsEl ? dotsEl.querySelectorAll('.gallery-dot') : [];
    dots.forEach((d, i) => {
      const isActive = i === clampedIndex;
      d.classList.toggle('active', isActive);
      d.setAttribute('aria-selected', String(isActive));
    });

    // Update track aria-live label
    const activeSlide = slides[clampedIndex];
    const img = activeSlide?.querySelector('img');
    if (track && img) {
      track.setAttribute('aria-label', img.alt);
    }
  }

  /**
   * Switch to a new color variant — show only that color's slides.
   */
  function switchColor(color) {
    const allSlides = track.querySelectorAll('.gallery-slide');
    allSlides.forEach((slide) => {
      const isThisColor = slide.dataset.color === color;
      slide.classList.toggle('hidden', !isThisColor);
      slide.classList.remove('active');
    });

    state.currentImageIndex = 0;
    const variantImages = PRODUCT.variants[color]?.images ?? [];
    buildDots(variantImages.length);
    updateThumbnails(color);
    goToSlide(0);
  }

  /**
   * Update thumbnails for a color.
   */
  function updateThumbnails(color) {
    if (!thumbsEl) return;
    const images = PRODUCT.variants[color]?.images ?? [];

    thumbsEl.replaceChildren();
    images.forEach((image, index) => {
      const thumb = document.createElement('button');
      thumb.className = `thumb${index === 0 ? ' active' : ''}`;
      thumb.type = 'button';
      thumb.setAttribute('role', 'tab');
      thumb.setAttribute('aria-selected', String(index === 0));
      thumb.setAttribute('aria-label', `View image ${index + 1}`);
      thumb.dataset.index = index;

      const img = document.createElement('img');
      img.src = image.src;
      img.alt = `${image.alt} thumbnail`;
      img.loading = 'lazy';
      thumb.appendChild(img);
      thumbsEl.appendChild(thumb);
    });
  }

  // Prev / Next
  prevBtn?.addEventListener('click', () => {
    const slides = getCurrentSlides();
    const newIndex = (state.currentImageIndex - 1 + slides.length) % slides.length;
    goToSlide(newIndex);
  });

  nextBtn?.addEventListener('click', () => {
    const slides = getCurrentSlides();
    const newIndex = (state.currentImageIndex + 1) % slides.length;
    goToSlide(newIndex);
  });

  // Keyboard navigation on gallery
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevBtn?.click();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextBtn?.click();
    }
  });

  // Thumbnail clicks
  thumbsEl?.addEventListener('click', (e) => {
    const thumb = e.target.closest('.thumb');
    if (!thumb) return;
    goToSlide(Number(thumb.dataset.index));
  });

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? nextBtn?.click() : prevBtn?.click();
    }
  }, { passive: true });

  // Init
  buildDots(PRODUCT.variants[state.currentColor].images.length);
  goToSlide(0);

  // Expose switchColor for variant selection
  return { switchColor };
}

/* =============================================
   VARIANT SELECTION
   ============================================= */
function initVariants(gallery) {
  if (!PRODUCT) return;

  const radios    = document.querySelectorAll('input[name="color"]');
  const colorName = document.getElementById('selectedColorName');
  if (!radios.length) return;

  function applyVariant(color) {
    const variant = PRODUCT.variants[color];
    if (!variant) {
      console.error(`Unable to apply unknown product variant "${color}".`);
      return;
    }

    state.currentColor = color;
    const stock = variant.stock;

    // Update color name label
    if (colorName) colorName.textContent = variant.label;

    // Update stock badge
    updateStockBadge(stock);

    // Update quantity limits
    updateQuantityLimits(stock);

    // Update Add to Cart button
    updateCartButton(stock);

    // Switch gallery images — always works regardless of stock
    gallery?.switchColor(color);

    // Update Add to Cart aria label
    const cartBtn = document.getElementById('addToCartBtn');
    if (cartBtn) {
      cartBtn.setAttribute(
        'aria-label',
        stock > 0
          ? `Add ${PRODUCT.name} ${variant.label} to cart`
          : `${PRODUCT.name} ${variant.label} is currently sold out`
      );
    }
  }

  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) applyVariant(radio.value);
    });
  });

  // Init with default
  applyVariant(state.currentColor);
}

function updateStockBadge(stock) {
  const badge    = document.getElementById('stockBadge');
  const stockTxt = document.getElementById('stockText');
  if (!badge || !stockTxt) return;

  if (stock > 0) {
    badge.className = 'product-stock';
    stockTxt.textContent = 'In Stock';
  } else {
    badge.className = 'product-stock is-soldout';
    stockTxt.textContent = 'Sold Out';
  }
}

function updateQuantityLimits(stock) {
  const qtyInput  = document.getElementById('qtyInput');
  const qtyPlus   = document.getElementById('qtyPlus');
  const qtyMinus  = document.getElementById('qtyMinus');
  const stockInfo = document.getElementById('stockInfo');

  if (!qtyInput) return;

  const maxQty = stock;

  if (maxQty > 0) {
    qtyInput.disabled = false;
    const current = Math.min(parseInt(qtyInput.value) || 1, maxQty);
    qtyInput.max   = maxQty;
    qtyInput.value = current;
    state.quantity = current;
    if (qtyMinus) qtyMinus.disabled = current <= 1;
    if (qtyPlus)  qtyPlus.disabled  = current >= maxQty;
    if (stockInfo) stockInfo.textContent = `${maxQty} item tersedia`;
  } else if (maxQty === 0) {
    // Sold out — show 1 tapi disabled
    qtyInput.value = 1;
    qtyInput.max   = 0;
    qtyInput.disabled = true;
    state.quantity = 1;
    if (qtyMinus) qtyMinus.disabled = true;
    if (qtyPlus)  qtyPlus.disabled  = true;
    if (stockInfo) stockInfo.textContent = 'Stok habis';
  } else {
    throw new Error('Product variant stock must not be negative.');
  }
}

function updateCartButton(stock) {
  const btn = document.getElementById('addToCartBtn');
  if (!btn) return;

  if (stock > 0) {
    btn.textContent = 'Add to Cart';
    btn.disabled = false;
    btn.classList.remove('is-soldout');
  } else {
    btn.textContent = 'Sold Out';
    btn.disabled = true;
    btn.classList.add('is-soldout');
  }
}

/* =============================================
   QUANTITY CONTROL
   ============================================= */
function initQuantity() {
  if (!PRODUCT || !PRODUCT.variants[state.currentColor]) return;

  const qtyInput = document.getElementById('qtyInput');
  const qtyPlus  = document.getElementById('qtyPlus');
  const qtyMinus = document.getElementById('qtyMinus');
  if (!qtyInput) return;

  function update(newVal) {
    const max = PRODUCT.variants[state.currentColor].stock;
    if (max === 0) return;

    const clamped = Math.max(1, Math.min(newVal, max));

    state.quantity = clamped;
    qtyInput.value = clamped;

    if (qtyMinus) qtyMinus.disabled = clamped <= 1;
    if (qtyPlus)  qtyPlus.disabled  = clamped >= max;
  }

  qtyPlus?.addEventListener('click', () => update(state.quantity + 1));
  qtyMinus?.addEventListener('click', () => update(state.quantity - 1));

  qtyInput.addEventListener('change', () => {
    const val = parseInt(qtyInput.value);
    update(isNaN(val) ? 1 : val);
  });
}

/* =============================================
   CART
   ============================================= */
function initCart() {
  if (!PRODUCT || !PRODUCT.variants[state.currentColor]) return;

  const cartToggle  = document.getElementById('cartToggle');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartItems   = document.getElementById('cartItems');
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (!cartDrawer || !cartOverlay || !cartItems || !addToCartBtn) {
    console.error('Unable to initialize cart: required DOM elements are missing.');
    showToast('Unable to initialize the cart.', 'error');
    return;
  }

  // Open/close
  function openCart() {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartOverlay.setAttribute('aria-hidden', 'false');
    cartToggle?.setAttribute('aria-expanded', 'true');
    cartClose?.focus();
  }

  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartOverlay.setAttribute('aria-hidden', 'true');
    cartToggle?.setAttribute('aria-expanded', 'false');
    cartToggle?.focus();
  }

  cartToggle?.addEventListener('click', () => {
    cartDrawer.classList.contains('is-open') ? closeCart() : openCart();
  });

  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer.classList.contains('is-open')) {
      closeCart();
    }
  });

  // Add to Cart
  addToCartBtn?.addEventListener('click', () => {
    const variant = PRODUCT?.variants?.[state.currentColor];
    if (!variant || !variant.images[0]) {
      console.error('Unable to add product to cart: selected variant data is missing.');
      showToast('Unable to add this product to cart.', 'error');
      return;
    }

    if (variant.stock <= 0) return;

    const qty = state.quantity;
    const existingIdx = state.cart.findIndex(
      (item) => item.color === state.currentColor
    );

    if (existingIdx > -1) {
      // Increase qty — capped to stock
      const newQty = Math.min(state.cart[existingIdx].qty + qty, variant.stock);
      state.cart[existingIdx].qty = newQty;
    } else {
      state.cart.push({
        id: `${state.currentColor}-${Date.now()}`,
        name: PRODUCT.name,
        color: state.currentColor,
        colorLabel: variant.label,
        qty,
        price: PRODUCT.price,
        imgSrc: variant.images[0].src,
        imgAlt: variant.images[0].alt,
      });
    }

    renderCart();
    updateCartBadge();
    showToast(
      `${PRODUCT.name} (${variant.label}) added to cart!`,
      'success'
    );
    openCart();
  });
}

function renderCart() {
  const cartEmpty  = document.getElementById('cartEmpty');
  const cartItems  = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  if (!cartItems) return;

  const isEmpty = state.cart.length === 0;

  if (cartEmpty)  cartEmpty.classList.toggle('is-hidden', !isEmpty);
  if (cartFooter) cartFooter.style.display = isEmpty ? 'none' : '';

  if (isEmpty) {
    cartItems.innerHTML = '';
    refreshCartTotal();
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
    <li class="cart-item" data-id="${item.id}">
      <img
        src="${item.imgSrc}"
        alt="${item.imgAlt}"
        class="cart-item__img"
        loading="lazy"
      />
      <div class="cart-item__details">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__variant">${item.colorLabel} · Qty ${item.qty}</p>
        <button class="cart-item__remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">
          Remove
        </button>
      </div>
      <span class="cart-item__price">${formatPrice(item.price * item.qty)}</span>
    </li>
  `
    )
    .join('');

  // Remove button handlers
  cartItems.querySelectorAll('.cart-item__remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      state.cart = state.cart.filter((item) => item.id !== id);
      renderCart();
      updateCartBadge();
      showToast('Item removed from cart.', 'error');
    });
  });

  refreshCartTotal();
}

function refreshCartTotal() {
  const totalEl = document.getElementById('cartTotal');
  if (!totalEl) return;

  const totalIDR = state.cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  totalEl.textContent = formatPrice(totalIDR);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = String(totalQty);

  badge.classList.remove('bump');
  // Trigger reflow for animation restart
  void badge.offsetWidth;
  badge.classList.add('bump');
}

/* =============================================
   SPECS TABS
   ============================================= */
function initSpecsTabs() {
  const tabs   = document.querySelectorAll('.specs-tab');
  const panels = document.querySelectorAll('.specs-panel');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('aria-controls');

      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      panels.forEach((p) => {
        p.hidden = true;
        p.classList.remove('active');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const panel = document.getElementById(target);
      if (panel) {
        panel.hidden = false;
        panel.classList.add('active');
      }
    });

    // Keyboard arrow navigation
    tab.addEventListener('keydown', (e) => {
      const tabList = Array.from(tabs);
      const idx = tabList.indexOf(tab);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        tabList[(idx + 1) % tabList.length].focus();
        tabList[(idx + 1) % tabList.length].click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tabList[(idx - 1 + tabList.length) % tabList.length].focus();
        tabList[(idx - 1 + tabList.length) % tabList.length].click();
      }
    });
  });
}

/* =============================================
   IMAGE ERROR FALLBACK
   ============================================= */
function initImageFallbacks() {
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', function () {
      // Replace broken images with a neutral placeholder
      this.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Inter,sans-serif" font-size="14" fill="%23aaa" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
      this.alt = 'Image not available';
    });
  });
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', async () => {
  initHeaderScroll();
  initSearch();
  initMobileNav();
  initCurrency();

  const product = await fetchProduct();
  if (!product) return;

  if (
    !renderProductInfo() ||
    !renderProductVariants() ||
    !renderProductGallery()
  ) {
    return;
  }

  const gallery = initGallery();
  initVariants(gallery);
  initQuantity();
  initCart();
  initSpecsTabs();
  initImageFallbacks();

  // Init price display
  refreshPriceDisplay();

  // Init cart footer hidden by default
  const cartFooter = document.getElementById('cartFooter');
  if (cartFooter) cartFooter.style.display = 'none';
});
