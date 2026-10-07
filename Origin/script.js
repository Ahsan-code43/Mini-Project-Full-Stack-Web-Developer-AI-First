/* ============================================================
   DYNAMIC M75B — Product Page Script
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
const PRODUCT = {
  name: 'Dynamic M75B',
  basePrice: 1499000,
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
};

const CURRENCIES = {
  IDR: { symbol: 'Rp', rate: 1, locale: 'id-ID' },
  USD: { symbol: '$', rate: 0.000063, locale: 'en-US' },
  SGD: { symbol: 'S$', rate: 0.000085, locale: 'en-SG' },
};

/* =============================================
   STATE
   ============================================= */
const state = {
  currentColor: 'black',
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
    // Format: Rp1.499.000
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
      label.textContent = currency;

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
  if (priceEl) priceEl.textContent = formatPrice(PRODUCT.basePrice);
}

/* =============================================
   GALLERY
   ============================================= */
function initGallery() {
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
    goToSlide(0);

    const variantImages = PRODUCT.variants[color]?.images ?? [];
    buildDots(variantImages.length);
    updateThumbnails(color);
  }

  /**
   * Update thumbnails for a color.
   */
  function updateThumbnails(color) {
    if (!thumbsEl) return;
    const thumbBtns = thumbsEl.querySelectorAll('.thumb');
    const images = PRODUCT.variants[color]?.images ?? [];

    thumbBtns.forEach((btn, i) => {
      const img = btn.querySelector('img');
      if (img && images[i]) {
        img.src = images[i].src;
        img.alt = images[i].alt + ' thumbnail';
      }
      btn.classList.toggle('active', i === 0);
      btn.setAttribute('aria-selected', String(i === 0));
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
  const radios    = document.querySelectorAll('input[name="color"]');
  const colorName = document.getElementById('selectedColorName');
  if (!radios.length) return;

  function applyVariant(color) {
    state.currentColor = color;
    const variant = PRODUCT.variants[color];

    // Update color name label
    if (colorName) colorName.textContent = variant.label;

    // Update stock badge
    updateStockBadge(variant.stock);

    // Update quantity limits
    updateQuantityLimits(variant.stock);

    // Update Add to Cart button
    updateCartButton(variant.stock);

    // Switch gallery images — always works regardless of stock
    gallery?.switchColor(color);

    // Update Add to Cart aria label
    const cartBtn = document.getElementById('addToCartBtn');
    if (cartBtn) {
      cartBtn.setAttribute(
        'aria-label',
        variant.stock > 0
          ? `Add Dynamic M75B ${variant.label} to cart`
          : `Dynamic M75B ${variant.label} is currently sold out`
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

  const maxQty = Math.max(0, stock);

  if (maxQty > 0) {
    const current = Math.min(parseInt(qtyInput.value) || 1, maxQty);
    qtyInput.max   = maxQty;
    qtyInput.value = current;
    state.quantity = current;
    if (qtyMinus) qtyMinus.disabled = current <= 1;
    if (qtyPlus)  qtyPlus.disabled  = current >= maxQty;
    if (stockInfo) stockInfo.textContent = `${maxQty} item tersedia`;
  } else {
    // Sold out — show 1 tapi disabled
    qtyInput.value = 1;
    qtyInput.max   = 0;
    state.quantity = 1;
    if (qtyMinus) qtyMinus.disabled = true;
    if (qtyPlus)  qtyPlus.disabled  = true;
    if (stockInfo) stockInfo.textContent = 'Stok habis';
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
  const qtyInput = document.getElementById('qtyInput');
  const qtyPlus  = document.getElementById('qtyPlus');
  const qtyMinus = document.getElementById('qtyMinus');
  if (!qtyInput) return;

  function update(newVal) {
    const variant = PRODUCT.variants[state.currentColor];
    const max = variant.stock;
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
  const cartToggle  = document.getElementById('cartToggle');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer  = document.getElementById('cartDrawer');
  const addToCartBtn = document.getElementById('addToCartBtn');
  if (!cartDrawer) return;

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
    const variant = PRODUCT.variants[state.currentColor];
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
        price: PRODUCT.basePrice,
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
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initSearch();
  initMobileNav();
  initCurrency();

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
