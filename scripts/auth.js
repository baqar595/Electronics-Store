

let currentUserId = null;


document.addEventListener('DOMContentLoaded', () => {
  initializeUserState();
});

function initializeUserState() {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  if (userId && username) {
    currentUserId = userId;
    updateLoggedInUI();
    loadUserCartFromBackend(); // This now loads both cart and favorites
  } else {
    // No user logged in, use local storage data
    cart = Storage.load('cart', []);
    favorites = Storage.load('favorites', []);
    updateCartUI();
  }
}

// LOGIN FORM HANDLER
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        alert("Please fill in all fields");
        return;
      }

      await loginUser(email, password);
    });
  }
});

// SIGNUP FORM HANDLER
document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('signupUsername').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value.trim();

      if (!username || !email || !password) {
        alert("Please fill in all fields");
        return;
      }

      await signupUser(username, email, password);
    });
  }
});

// UNIFIED LOGIN FUNCTION
async function loginUser(email, password) {
  try {
    // Try the new backend first (port 3000)
    const response = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      currentUserId = data.id;
      
      // Store user data
      localStorage.setItem('userId', data.id);
      localStorage.setItem('username', data.username);
      
      alert(`Login successful! Welcome ${data.username}`);
      updateLoggedInUI();
      
      // Close login modal if it exists
      const loginModal = document.getElementById('loginModal');
      if (loginModal && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(loginModal);
        if (modal) modal.hide();
      }
      
      // Load user's cart and favorites from backend
      await loadUserCartFromBackend();
      
      return true;
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Login failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback to old backend (port 1233)
    try {
      const fallbackResponse = await fetch('http://localhost:1233/users');
      const users = await fallbackResponse.json();
      
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        currentUserId = user.id;
        localStorage.setItem('userId', user.id);
        localStorage.setItem('username', user.username);
        
        alert(`Login successful! Welcome ${user.username}`);
        updateLoggedInUI();
        
        // Close modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal && window.bootstrap) {
          const modal = bootstrap.Modal.getInstance(loginModal);
          if (modal) modal.hide();
        }
        
        return true;
      } else {
        alert("Invalid credentials");
        return false;
      }
    } catch (fallbackError) {
      console.error('Fallback login error:', fallbackError);
      alert("Connection error. Please try again.");
      return false;
    }
  }
}

// SIGNUP FUNCTION
async function signupUser(username, email, password) {
  const newUser = {
    username,
    email,
    password,
    cart: [],
    favorites: []
  };

  try {
    // Try new backend first
    const response = await fetch('http://localhost:3000/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    if (response.ok) {
      alert("Signup successful! You can now log in.");
      
      // Close signup modal
      const signupModal = document.getElementById('signupModal');
      if (signupModal && window.bootstrap) {
        const modal = bootstrap.Modal.getInstance(signupModal);
        if (modal) modal.hide();
      }
      
      return true;
    } else {
      const errorData = await response.json();
      alert(errorData.error || 'Signup failed');
      return false;
    }
  } catch (error) {
    console.error('Signup error:', error);
    
    // Fallback to old backend
    try {
      const fallbackResponse = await fetch('http://localhost:1233/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (fallbackResponse.ok) {
        alert("Signup successful! You can now log in.");
        
        const signupModal = document.getElementById('signupModal');
        if (signupModal && window.bootstrap) {
          const modal = bootstrap.Modal.getInstance(signupModal);
          if (modal) modal.hide();
        }
        
        return true;
      } else {
        alert("Failed to create user");
        return false;
      }
    } catch (fallbackError) {
      console.error('Fallback signup error:', fallbackError);
      alert("Connection error. Please try again.");
      return false;
    }
  }
}

// UPDATE UI FOR LOGGED IN USER
function updateLoggedInUI() {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const accCartFav = document.querySelector('.acc-cart-fav');
  
  if (userId && username && accCartFav) {
    accCartFav.innerHTML = `
      <div class="d-flex align-items-center">
        <span class="me-3">Welcome, ${username}!</span>
        <button class="btn btn-danger btn-sm" id="logoutBtn">Logout</button>
      </div>`;
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }
  }
}

// LOGOUT FUNCTION
function logout() {
  // Sync current data to backend before logout (optional)
  if (currentUserId) {
    syncCartToBackend();
    syncFavoritesToBackend();
  }
  
  // Clear local storage
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  
  // Reset current user
  currentUserId = null;
  
  // Clear cart and favorites to guest state
  cart = [];
  favorites = [];
  Storage.save('cart', cart);
  Storage.save('favorites', favorites);
  
  // Update UI
  updateCartUI();
  
  // Reload page to reset everything
  setTimeout(() => {
    location.reload();
  }, 100);
}

// LOAD USER'S CART AND FAVORITES FROM BACKEND
async function loadUserCartFromBackend() {
  if (!currentUserId) return;

  try {
    // Load cart
    const cartResponse = await fetch(`http://localhost:3000/users/${currentUserId}/cart`);
    if (cartResponse.ok) {
      const cartData = await cartResponse.json();
      cart = cartData.items || [];
      Storage.save('cart', cart);
      updateCartUI();
      console.log('Loaded user cart:', cart);
    }

    // Load favorites
    const favResponse = await fetch(`http://localhost:3000/users/${currentUserId}/favorites`);
    if (favResponse.ok) {
      const favData = await favResponse.json();
      favorites = favData.favorites || [];
      Storage.save('favorites', favorites);
      console.log('Loaded user favorites:', favorites);
    }
  } catch (error) {
    console.error('Failed to load user data from backend:', error);
    // Use local data as fallback
    cart = Storage.load('cart', []);
    favorites = Storage.load('favorites', []);
  }
}

// LOAD USER'S FAVORITES FROM BACKEND
async function loadUserFavoritesFromBackend() {
  if (!currentUserId) return;

  try {
    const response = await fetch(`http://localhost:3000/users/${currentUserId}/favorites`);
    if (response.ok) {
      const favData = await response.json();
      favorites = favData.favorites || [];
      Storage.save('favorites', favorites);
      console.log('Loaded user favorites:', favorites);
    }
  } catch (error) {
    console.error('Failed to load favorites from backend:', error);
    favorites = Storage.load('favorites', []);
  }
}

// SYNC CART TO BACKEND
async function syncCartToBackend() {
  if (!currentUserId) return;

  try {
    const response = await fetch(`http://localhost:3000/users/${currentUserId}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });
    
    if (!response.ok) {
      console.error('Failed to sync cart to backend');
    }
  } catch (error) {
    console.error('Cart sync error:', error);
  }
}

// SYNC FAVORITES TO BACKEND
async function syncFavoritesToBackend() {
  if (!currentUserId) return;

  try {
    const response = await fetch(`http://localhost:3000/users/${currentUserId}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites })
    });
    
    if (!response.ok) {
      console.error('Failed to sync favorites to backend');
    }
  } catch (error) {
    console.error('Favorites sync error:', error);
  }
}

// OVERRIDE CART FUNCTIONS TO INCLUDE SYNC
const originalAddToCart = window.AddToCart;
window.AddToCart = async (id) => {
  // Call original function
  if (originalAddToCart) {
    await originalAddToCart(id);
  } else {
    // Fallback implementation
    const productId = String(id);
    const existing = cart.find(item => String(item.id) === productId);
    
    if (existing) {
      existing.quantity++;
    } else {
      const p = products.find(product => String(product.id) === productId);
      if (p) {
        cart.push({ 
          id: productId, 
          name: p.name, 
          price: p.discountedPrice || p.price || 9800, 
          image: p.image || '',
          quantity: 1 
        });
      }
    }
    Storage.save("cart", cart);
    updateCartUI();
    
    const cartElement = document.querySelector('.shopping-cart');
    if (cartElement) {
      cartElement.classList.add('open');
    }
  }
  
  // Sync to backend
  await syncCartToBackend();
};

// OVERRIDE REMOVE FROM CART TO INCLUDE SYNC
const originalRemoveFromCart = window.removeFromCart;
// OVERRIDE REMOVE FROM CART TO INCLUDE SYNC

window.removeFromCart = async (index) => {
  // Call original function
  if (originalRemoveFromCart) {
    originalRemoveFromCart(index);
  } else {
    // Fallback implementation
    cart.splice(index, 1);
    Storage.save("cart", cart);
    updateCartUI();
  }
  
  // Sync to backend
  await syncCartToBackend();
};

// OVERRIDE REMOVE FAVORITE TO INCLUDE SYNC  
const originalRemoveFavorite = window.removeFavorite;
window.removeFavorite = async (index) => {
  // Call original function
  if (originalRemoveFavorite) {
    originalRemoveFavorite(index);
  } else {
    // Fallback implementation
    favorites.splice(index, 1);
    Storage.save("favorites", favorites);
    renderFavorites();
  }
  
  // Sync to backend
  await syncFavoritesToBackend();
};

// OVERRIDE FAVORITE FUNCTION TO INCLUDE SYNC
const originalHandleFavorite = window.handleFavorite;
window.handleFavorite = async (id) => {
  // Call original function
  if (originalHandleFavorite) {
    originalHandleFavorite(id);
  } else {
    // Fallback implementation
    const productId = String(id);
    const product = products.find(p => String(p.id) === productId);
    
    if (product && !favorites.includes(productId)) {
      favorites.push(productId);
      Storage.save("favorites", favorites);
    }
  }
  
  // Sync to backend
  await syncFavoritesToBackend();
};

// MANUAL SYNC FUNCTIONS (can be called from UI)
async function syncAllUserData() {
  if (!currentUserId) {
    console.log('No user logged in - cannot sync');
    return;
  }
  
  console.log('Syncing all user data...');
  await Promise.all([
    syncCartToBackend(),
    syncFavoritesToBackend()
  ]);
  console.log('Sync complete');
}

// MANUAL LOAD FUNCTIONS (can be called from UI)
async function loadAllUserData() {
  if (!currentUserId) {
    console.log('No user logged in - cannot load user data');
    return;
  }
  
  console.log('Loading all user data...');
  await loadUserCartFromBackend();
  console.log('Load complete');
}

// SWITCH USER (useful for testing or if you want user switching)
async function switchUser(newUserId) {
  // Save current user's data
  if (currentUserId) {
    await syncAllUserData();
  }
  
  // Switch to new user
  currentUserId = newUserId;
  localStorage.setItem('userId', newUserId);
  
  // Load new user's data
  await loadAllUserData();
  
  console.log(`Switched to user ${newUserId}`);
}