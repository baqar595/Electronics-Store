let products = [], cart = [], favorites = [];

// Utility: Load/Save from localStorage with error handling
const Storage = {
  save(key, value) { 
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  load(key, fallback) { 
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return fallback;
    }
  }
};

// Initialize state from localStorage
cart = Storage.load("cart", []);
favorites = Storage.load("favorites", []);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Load products first (you need to implement this)
  loadProducts();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize UI
  updateCartUI();
  
  console.log('Cart and favorites system initialized');
});

// Load products from your API/data source
async function loadProducts() {
  try {
    // Replace this with your actual products loading logic
    // For example, if you have a products API:
    // const response = await fetch('/api/products');
    // products = await response.json();
    
    // OR if you have products in a separate file:
    // products = await import('./products.js');
    
    // For now, using placeholder - REPLACE THIS WITH YOUR ACTUAL PRODUCTS
    products = [
      { id: 1, name: "Sample Product 1", price: 1000, image: "placeholder.jpg" },
      { id: 2, name: "Sample Product 2", price: 2000, image: "placeholder.jpg" }
    ];
    
    console.log('Products loaded:', products.length);
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Cart toggle button
  const cartToggle = document.querySelector('.cart-toggle');
  if (cartToggle) {
    cartToggle.addEventListener('click', OpenCart);
  }
  
  // Cart close button
  const exitButton = document.querySelector('.TheExitButton');
  if (exitButton) {
    exitButton.addEventListener('click', () => {
      document.querySelector('.shopping-cart')?.classList.remove('open');
    });
  }
  
  // Favorites button
  const favoritesBtn = document.getElementById('openFavoritesBtn');
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', renderFavorites);
  }
  
  // Event delegation for dynamic buttons
  document.addEventListener('click', handleDynamicClicks);
}

// Handle clicks on dynamically created buttons
function handleDynamicClicks(e) {
  const favBtn = e.target.closest('.favorite-btn');
  const removeFavBtn = e.target.closest('.remove-favorite-btn');
  const removeCartBtn = e.target.closest('.remove-cart-btn');
  const addToCartBtn = e.target.closest('.add-to-cart-btn');

  if (favBtn && favBtn.dataset.id) {
    handleFavorite(favBtn.dataset.id);
  }
  if (removeFavBtn && removeFavBtn.dataset.index !== undefined) {
    removeFavorite(parseInt(removeFavBtn.dataset.index));
  }
  if (removeCartBtn && removeCartBtn.dataset.index !== undefined) {
    removeFromCart(parseInt(removeCartBtn.dataset.index));
  }
  if (addToCartBtn && addToCartBtn.dataset.id) {
    AddToCart(addToCartBtn.dataset.id);
  }
}

// Favorite Functions
function handleFavorite(id) {
  const productId = String(id);
  
  if (!favorites.includes(productId)) {
    favorites.push(productId);
    Storage.save("favorites", favorites);
    console.log('Added to favorites:', productId);
    
    // Show feedback
    showToast('Added to favorites!');
  } else {
    console.log('Already in favorites:', productId);
    showToast('Already in favorites!');
  }
  
  renderFavorites();
}

function removeFavorite(index) {
  if (index >= 0 && index < favorites.length) {
    const removed = favorites.splice(index, 1)[0];
    Storage.save("favorites", favorites);
    console.log('Removed from favorites:', removed);
    renderFavorites();
    showToast('Removed from favorites!');
  }
}

function renderFavorites() {
  const list = document.getElementById('favoritesList');
  if (!list) {
    console.error('Favorites list element not found');
    return;
  }
  
  if (favorites.length === 0) {
    list.innerHTML = '<p class="text-center">No favorites yet!</p>';
  } else {
    list.innerHTML = favorites.map((id, i) => {
      const p = products.find(prod => String(prod.id) === String(id));
      
      if (!p) {
        console.warn('Favorite product not found:', id);
        return `<div class="alert alert-warning">Product ${id} not found</div>`;
      }
      
      return `
        <div class="favorite-item mb-3 p-3 border rounded">
          <div class="row">
            <div class="col-3">
              <img src="${p.image || 'placeholder.jpg'}" 
                   class="img-fluid rounded" 
                   alt="${p.name}"
                   style="max-height: 80px; object-fit: cover;">
            </div>
            <div class="col-6">
              <h6 class="mb-1">${p.name}</h6>
              <p class="mb-1 text-muted">Rs.${(p.discountedPrice || p.price || 0).toLocaleString()}</p>
            </div>
            <div class="col-3 text-end">
              <button class="btn btn-sm btn-outline-primary add-to-cart-btn mb-1" 
                      data-id="${p.id}">
                Add to Cart
              </button>
              <button class="btn btn-sm btn-danger remove-favorite-btn" 
                      data-index="${i}">
                Remove
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Show the modal
  const modal = document.getElementById('favoritesModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

// Cart Functions
function OpenCart() {
  const cart = document.querySelector('.shopping-cart');
  if (cart) {
    cart.classList.toggle('open');
  }
}

function AddToCart(id) {
  const productId = String(id);
  
  // Check if products are loaded
  if (products.length === 0) {
    console.error('Products not loaded yet');
    showToast('Please wait, products are loading...');
    return;
  }
  
  // Find existing item in cart
  const existing = cart.find(item => String(item.id) === productId);
  
  if (existing) {
    existing.quantity++;
    console.log('Increased quantity for:', existing.name);
  } else {
    // Find product in products array
    const p = products.find(product => String(product.id) === productId);
    
    if (!p) {
      console.error('Product not found:', productId);
      showToast('Product not found!');
      return;
    }
    
    cart.push({ 
      id: productId,
      name: p.name, 
      price: p.discountedPrice || p.price || 0, 
      image: p.image || 'placeholder.jpg',
      quantity: 1 
    });
    
    console.log('Added to cart:', p.name);
  }
  
  Storage.save("cart", cart);
  updateCartUI();
  
  // Open cart and show feedback
  const cartElement = document.querySelector('.shopping-cart');
  if (cartElement) {
    cartElement.classList.add('open');
  }
  
  showToast('Added to cart!');
}

function removeFromCart(index) {
  if (index >= 0 && index < cart.length) {
    const removed = cart.splice(index, 1)[0];
    Storage.save("cart", cart);
    updateCartUI();
    console.log('Removed from cart:', removed.name);
    showToast('Removed from cart!');
  }
}

function updateCartUI() {
  const cartItemsEl = document.querySelector('.cart-items');
  const cartTotalEl = document.querySelector('.cart-total');
  
  if (!cartItemsEl) {
    console.warn('Cart items element not found');
    return;
  }
  
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
  } else {
    cartItemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item mb-2 p-2 border-bottom">
        <div class="row align-items-center">
          <div class="col-3">
            <img src="${item.image}" 
                 alt="${item.name}" 
                 class="img-fluid rounded"
                 style="max-height: 50px; object-fit: cover;">
          </div>
          <div class="col-6">
            <h6 class="mb-1">${item.name}</h6>
            <small class="text-muted">
              ${item.quantity} × Rs.${item.price.toLocaleString()} = 
              Rs.${(item.price * item.quantity).toLocaleString()}
            </small>
          </div>
          <div class="col-3 text-end">
            <button class="btn btn-sm btn-danger remove-cart-btn" 
                    data-index="${i}">
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Update total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotalEl) {
    cartTotalEl.textContent = `Total: Rs.${total.toLocaleString()}`;
  }
  
  // Update cart count badge
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (badge) {
    badge.textContent = itemCount;
    badge.style.display = itemCount > 0 ? 'inline' : 'none';
  }
}

// Utility Functions
function showToast(message, type = 'success') {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => toast.style.opacity = '1', 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

function closeFavorites() { 
  const modal = document.getElementById('favoritesModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function ToggleFavorites() {
  const modal = document.getElementById('favoritesModal');
  if (!modal) return;
  
  if (modal.style.display === 'block') {
    modal.style.display = 'none';
  } else {
    renderFavorites();
  }
}


// Add to setupEventListeners function




// Export functions for use by other scripts
window.AddToCart = AddToCart;
window.handleFavorite = handleFavorite;
window.removeFavorite = removeFavorite;
window.removeFromCart = removeFromCart;
window.OpenCart = OpenCart;
window.closeFavorites = closeFavorites;
window.ToggleFavorites = ToggleFavorites;


