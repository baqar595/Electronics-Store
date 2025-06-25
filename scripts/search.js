

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');


searchBtn.addEventListener('click', () => {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = products.filter(p => p.name.toLowerCase().includes(query));
  renderSearchResults(filtered);
});


function renderSearchResults(productList) {
  const container = document.getElementById('searchResults');

  if (productList.length === 0) {
    container.innerHTML = '<p>No products found.</p>';
    return;
  }

  container.innerHTML = productList.map(p => `
    <div class="product-card mb-3 p-3 border rounded shadow-sm">
      <h5>${p.name}</h5>
      <img src="${p.image}" alt="${p.name}" style="max-width:150px; height:auto;">
      <p><strong>Rs.${p.discountedPrice}</strong></p>
      <button onclick="AddToCartById(${p.id})" class="btn btn-success btn-sm me-2">Add to Cart</button>
      <button class="favorite-btn btn btn-outline-danger btn-sm" data-id="${p.id}">Favorite</button>
    </div>
  `).join('');
}

function AddToCartById(id) {
  const p = products.find(prod => prod.id == id);
  if (!p) return;

  const existing = cart.find(item => item.id == id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.discountedPrice,
      image: p.image || '',
      quantity: 1
    });
  }
  Storage.save("cart", cart);
  updateCartUI();

}
function AddToFavoritesById(id) {
  const p = products.find(prod => prod.id == id);
  if (!p) return;

  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }
Storage.save("favorites", favorites);
updateFavoritesUI(); 

}

const mobileSearchOverlay = document.getElementById('mobileSearchOverlay');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSearchResults = document.getElementById('mobileSearchResults');

// Check if we're on mobile (you can adjust this breakpoint as needed)
function isMobile() {
  return window.innerWidth <= 768;
}

// Open mobile search overlay
function openMobileSearch() {
  if (mobileSearchOverlay) {
    mobileSearchOverlay.style.display = 'flex';
    setTimeout(() => {
      mobileSearchOverlay.classList.add('active');
      if (mobileSearchInput) {
        mobileSearchInput.focus();
      }
    }, 10);
  }
}

// Close mobile search overlay
function closeMobileSearch() {
  if (mobileSearchOverlay) {
    mobileSearchOverlay.classList.remove('active');
    setTimeout(() => {
      mobileSearchOverlay.style.display = 'none';
      if (mobileSearchInput) {
        mobileSearchInput.value = '';
        mobileSearchResults.innerHTML = `
          <div class="no-results">
            <i class="bi bi-search"></i>
            <p>Start typing to search for products...</p>
          </div>
        `;
      }
    }, 300);
  }
}

// Handle search functionality for both desktop and mobile
function performSearch(query = null) {
  let searchQuery;
  
  if (query) {
    searchQuery = query.toLowerCase().trim();
  } else {
    // Check if search is from desktop or mobile
    if (mobileSearchInput && mobileSearchOverlay.classList.contains('active')) {
      searchQuery = mobileSearchInput.value.toLowerCase().trim();
    } else {
      searchQuery = searchInput.value.toLowerCase().trim();
    }
  }
  
  if (searchQuery === '') {
    return;
  }
  
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery));
  
  // If mobile search is active, render in mobile overlay
  if (mobileSearchOverlay && mobileSearchOverlay.classList.contains('active')) {
    renderMobileSearchResults(filtered);
  } else {
    // Desktop search - render in modal
    renderSearchResults(filtered);
  }
}

// Render search results in mobile overlay
function renderMobileSearchResults(productList) {
  if (!mobileSearchResults) return;
  
  if (productList.length === 0) {
    mobileSearchResults.innerHTML = `
      <div class="no-results">
        <i class="bi bi-search"></i>
        <p>No products found.</p>
      </div>
    `;
    return;
  }
  
  mobileSearchResults.innerHTML = productList.map(p => `
    <div class="mobile-search-result-item" onclick="selectProduct(${p.id})">
      <img src="${p.image}" alt="${p.name}" class="result-image">
      <div class="result-info">
        <h6>${p.name}</h6>
        <p class="result-price">Rs.${p.discountedPrice}</p>
      </div>
      <div class="result-actions">
        <button onclick="event.stopPropagation(); AddToCartById(${p.id})" class="btn btn-sm btn-success">
          <i class="bi bi-cart-plus"></i>
        </button>
        <button onclick="event.stopPropagation(); AddToFavoritesById(${p.id})" class="btn btn-sm btn-outline-danger">
          <i class="bi bi-heart"></i>
        </button>
      </div>
    </div>
  `).join('');
}

// Search for specific term (used by suggestion chips)
function searchFor(term) {
  if (mobileSearchInput) {
    mobileSearchInput.value = term;
    performSearch(term);
  }
}

// Event listeners
searchBtn.addEventListener('click', (e) => {
  e.preventDefault();
  performSearch();
});

// Handle Enter key in desktop search input
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    performSearch();
  }
});

// Handle Enter key in mobile search input
if (mobileSearchInput) {
  mobileSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });
  
  // Real-time search as user types in mobile
  mobileSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query.length > 2) {
      performSearch(query);
    } else if (query.length === 0) {
      mobileSearchResults.innerHTML = `
        <div class="no-results">
          <i class="bi bi-search"></i>
          <p>Start typing to search for products...</p>
        </div>
      `;
    }
  });
}

// Close mobile search when clicking outside
if (mobileSearchOverlay) {
  mobileSearchOverlay.addEventListener('click', (e) => {
    if (e.target === mobileSearchOverlay) {
      closeMobileSearch();
    }
  });
}

// Handle ESC key to close mobile search
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileSearchOverlay && mobileSearchOverlay.classList.contains('active')) {
    closeMobileSearch();
  }
});

function renderSearchResults(productList) {
  const container = document.getElementById('searchResults');

  if (productList.length === 0) {
    container.innerHTML = '<p class="text-center text-muted mt-3">No products found.</p>';
    return;
  }

  container.innerHTML = productList.map(p => `
    <div class="product-card mb-3 p-3 border rounded shadow-sm">
      <h5>${p.name}</h5>
      <img src="${p.image}" alt="${p.name}" style="max-width:150px; height:auto;">
      <p><strong>Rs.${p.discountedPrice}</strong></p>
      <button onclick="AddToCartById(${p.id})" class="btn btn-success btn-sm me-2">Add to Cart</button>
      <button class="favorite-btn btn btn-outline-danger btn-sm" data-id="${p.id}" onclick="AddToFavoritesById(${p.id})">Favorite</button>
    </div>
  `).join('');
}

function AddToCartById(id) {
  const p = products.find(prod => prod.id == id);
  if (!p) return;

  const existing = cart.find(item => item.id == id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: p.id,
      name: p.name,
      price: p.discountedPrice,
      image: p.image || '',
      quantity: 1
    });
  }
  Storage.save("cart", cart);
  updateCartUI();
}

function AddToFavoritesById(id) {
  const p = products.find(prod => prod.id == id);
  if (!p) return;

  if (!favorites.includes(id)) {
    favorites.push(id);
    Storage.save("favorites", favorites);
    updateFavoritesUI();
  }
}

// Updated OpenSearch function to work with mobile overlay
function OpenSearch() {
  openMobileSearch();
}


function selectProduct(productId) {
  
  closeMobileSearch();
  
  
  console.log('Selected product:', productId);
}


