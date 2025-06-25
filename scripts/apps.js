let cart = [];
let products = []; 
let favorites = [];

document.addEventListener('click', function(e) {
  if (e.target.closest('.favorite-btn')) {
    const button = e.target.closest('.favorite-btn');
    const itemId = button.getAttribute('data-id');

    if (!favorites.includes(itemId)) {
      favorites.push(itemId);
      console.log(`Item ${itemId} added to favorites.`);
    } else {
      console.log(`Item ${itemId} is already in favorites.`);
    }

    console.log("Current favorites:", favorites);
  }
});

// open favorites modal
document.getElementById('openFavoritesBtn').addEventListener('click', () => {
  renderFavorites();
});

function renderFavorites() {
  const listEl = document.getElementById('favoritesList');
  listEl.innerHTML = '';

  if (favorites.length === 0) {
    listEl.innerHTML = '<p>No favorites yet!</p>';
  } else {
    favorites.forEach((id, index) => {
      const product = products[id];
      if (product) {
        listEl.innerHTML += `
          <div class="favorite-item mb-2 p-2 border rounded" data-index="${index}">
            <strong>${product.name}</strong><br>
            <img src="${product.image}" style="width:100px;height:auto;" alt="${product.name}">
            <br>
            <button class="btn btn-sm btn-danger remove-favorite-btn" data-index="${index}">Remove</button>
          </div>
        `;
      }
    });
  }

  document.getElementById('favoritesModal').style.display = 'block';

  // Attach delete listeners
  document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const removeIndex = parseInt(btn.getAttribute('data-index'));
      favorites.splice(removeIndex, 1);
      renderFavorites(); 
    });
  });
}

// close favorites modal
function closeFavorites() {
  document.getElementById('favoritesModal').style.display = 'none';
}






function OpenCart() {
  document.querySelector('.shopping-cart').classList.add('open');

}
window.AddToCart = function(productIndex) {
  const product = products[productIndex];
  
  const existing = cart.find(item => item.id === productIndex);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: productIndex, name: product.name, price: product.discountedPrice, quantity: 1 });
  }

  updateCartUI();
  document.querySelector('.shopping-cart').classList.add('open');
};

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const cartItemsEl = document.querySelector('.cart-items');
  cartItemsEl.innerHTML = '';

  let total = 0;

  cart.forEach((item, i) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item d-flex justify-content-between align-items-center mb-2';
    itemEl.innerHTML = `
      <div>
        <strong>${item.name}</strong> x${item.quantity} - Rs.${subtotal.toLocaleString()}
      </div>
      <button class="btn btn-sm btn-danger" onclick="removeFromCart(${i})">Remove</button>
    `;
    cartItemsEl.appendChild(itemEl);
  });

  document.querySelector('.cart-total').textContent = `Total: Rs.${total.toLocaleString()}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const exitBtn = document.querySelector('.TheExitButton');
  exitBtn.addEventListener('click', () => {
    document.querySelector('.shopping-cart').classList.remove('open');
  });
});



fetch('Database/Db.json')
  .then(response => response.json())
  .then(data => {
    
    const carouselInner = document.querySelector(".carousel-inner");
    data.featured.slice(0,3).forEach((element, index) => {
      carouselInner.innerHTML += `
        <div class="carousel-item ${'active'}">
          <img style="height:auto" class="d-block w-100" src="${element.image}" alt="Slide ${index + 1}">
          <div class="carousel-caption d-none d-md-block">
            <h5>${element.title}</h5>
            <p>${element.subtitle}</p>
            <p>${element.description}</p>
            ${element.button ? `<a class="btn btn-light" href="#">${element.button}</a>` : ''}
          </div>
        </div>
      `;
    });
  });


  


  fetch('Database/Db.json')
  .then(response => response.json())
  .then(data => {
      products = data;
    const container1 = document.querySelector(".Product-item1");
    const container2 = document.querySelector(".Product-item2");

    // Mobile Nexus
    const item1 = data.featured[3];
    container1.innerHTML = `
      <div class="promo-card d-flex align-items-center text-white p-4 rounded mb-3" style="background: linear-gradient(to right, #7a003d, #1e004e); height: 180px;">
        <div class="flex-grow-1">
          <h5 class="fw-bold mb-1">${item1.title}</h5>
          <h6 class="fw-bold">${item1.subtitle}</h6>
          <p class="mb-0 text-white-50">${item1.description}</p>
        </div>
        <div class="ms-4">
          <img src="${item1.image}" alt="${item1.title}" style="height: 140px;" class="img-fluid">
        </div>
      </div>
    `;

    // iPad Mini
    const item2 = data.featured[4];
    container2.innerHTML = `
      <div class="promo-card d-flex align-items-center text-white p-4 rounded" style="background: linear-gradient(to right, #7a003d, #1e004e); height: 180px;">
        <div class="flex-grow-1">
          <h5 class="fw-bold mb-1">${item2.title}</h5>
          <h6 class="fw-bold">${item2.subtitle}</h6>
          <p class="mb-0 text-white-50">${item2.description}</p>
        </div>
        <div class="ms-4">
          <img src="${item2.image}" alt="${item2.title}" style="height: 140px;" class="img-fluid">
        </div>
      </div>
    `;
  });


  fetch('Database/Db.json')
  .then(response => response.json())
  .then(data => {
      products = data;
    const carouselInner = document.querySelector(".category-carousel");
    data.categories.forEach((element) => {
      carouselInner.innerHTML += `
        <div class="item text-center">
          <img src="${element.image}" alt="${element.name}" class="img-fluid mb-2" style="height: 100px;">
          <p class="text-muted mb-0">${element.name}</p>
          <small class="text-secondary">${element.items}</small>
        </div>
      `;
    });

  
    $('.category-carousel').owlCarousel({
      loop: true,
      margin: 70,
      nav: true,
      dots: false,
      responsive: {
        0: { items: 2 },
        600: { items: 4 },
        1000: { items: 10 }
       
      }
    });
  });

  
  fetch('Database/db2.json')
  .then(response => response.json())
  .then(data => {
      products = data;
    const carouselInner = document.querySelector(".FreatureProd-carousel");

    data.forEach((product, index) => {
      carouselInner.innerHTML += `<div class="product-card item text-center position-relative p-3 border rounded shadow-sm"style="min-width:210px;" >
  <span class="badge bg-danger position-absolute top-0 start-0 m-2">-2%</span>

  <div class="position-relative">
    <img src="${product.image}" alt="${product.name}" class="img-fluid mb-2 CarouselImage" style= " background-size: cover; height: 350px; width: 550px;">
    <div class="action-buttons position-absolute top-0 end-0 m-2 d-flex flex-column gap-1">
      <button class="btn btn-light p-1 favorite-btn" data-id="${index}">
        <i class="bi bi-heart"></i>
      </button>
      <button class="btn btn-light p-1 quickview-btn" data-id="${index}">
        <i class="bi bi-eye"></i>
      </button>
      <button class="btn btn-light p-1 compare-btn" data-id="${index}">
        <i class="bi bi-arrow-left-right"></i>
      </button>
    </div>
  </div>

  <h6 class="mt-2">${product.name}</h6>
  <p class="text-muted small">${product.description}</p>
  <div class="text-warning mb-1">★★★★★ <small class="text-muted">(1 review)</small></div>

  <div>
    <span class="text-decoration-line-through text-muted">Rs.10,000.00</span>
    <strong class="ms-2">Rs.9,800.00</strong>
  </div>

  <button class="btn mt-3 w-100 add-to-cart-btn"style="border:1px solid green;" data-id="${index}" onclick="AddToCart(${index})">Add to cart</button>
</div>

      `;
    });

    $('.FreatureProd-carousel').owlCarousel({
      loop: true,
      margin: 20,
      nav: false,
      dots: false,
      responsive: {
        0: { items: 1 },
        600: { items: 1 },
        1000: { items: 4 }
      }
    });

  
    // document.querySelectorAll('.favorite-btn').forEach(btn => {
    //   btn.addEventListener('click', e => {
    //     alert("Added to favorites: " + e.currentTarget.dataset.id);
    //   });
    // });

    // document.querySelectorAll('.quickview-btn').forEach(btn => {
    //   btn.addEventListener('click', e => {
    //     alert("Quick view: " + e.currentTarget.dataset.id);
    //   });
    // });

    // document.querySelectorAll('.compare-btn').forEach(btn => {
    //   btn.addEventListener('click', e => {
    //     alert("Added to compare: " + e.currentTarget.dataset.id);
    //   });
    // });

    // document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    //   btn.addEventListener('click', e => {
    //     alert("Added to cart: " + e.currentTarget.dataset.id);
    //   });
    // });
  });


  fetch('Database/db2.json')
  .then(response => response.json())
  .then(data => {
      products = data;
    const carouselInner = document.querySelector(".PopularProd-carousel");

    data.forEach((product, index) => {
      carouselInner.innerHTML += `
        <div class="product-card item text-center position-relative p-3 border rounded shadow-sm">
          <span class="badge bg-danger position-absolute top-0 start-0 m-2">-2%</span>

          <div class="position-relative">
            <img src="${product.image}" alt="${product.name}" class="img-fluid mb-2"  style="height: 300px;  width: 425px; object-fit: cover;">
            <div class="action-buttons position-absolute top-0 end-0 m-2 d-flex flex-column gap-1">
              <button class="btn btn-light p-1 favorite-btn" data-id="${index}">
                <i class="bi bi-heart"></i>
              </button>
              <button class="btn btn-light p-1 quickview-btn" data-id="${index}">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-light p-1 compare-btn" data-id="${index}">
                <i class="bi bi-arrow-left-right"></i>
              </button>
            </div>
          </div>

          <h6 class="mt-2">${product.name}</h6>
          <p class="text-muted small">${product.description}</p>
          <div class="text-warning mb-1">★★★★★ <small class="text-muted">(1 review)</small></div>

          <div>
            <span class="text-decoration-line-through text-muted">Rs.10,000.00</span>
            <strong class="ms-2">Rs.9,800.00</strong>
          </div>

          <button class="btn mt-3 w-100 add-to-cart-btn"style="border:1px solid green; " data-id="${index}"  onclick="AddToCart(${index})" >Add to cart</button>
        </div>
      `;

      

    });

    
    $('.PopularProd-carousel').owlCarousel({
      loop: true,
      margin: 25,
      nav: true,
      dots: false,
      responsive: {
        0: { items: 1 },
        600: { items: 3 },
        1000: { items: 6 }
      }
    });
  });

  fetch('Database/db2.json')
  .then(response => response.json())
  .then(data => {
      products = data;
    const carouselInner = document.querySelector(".RecomendedProd-carousel");

    data.forEach((product, index) => {
      carouselInner.innerHTML += `
        <div class="product-card item text-center position-relative p-3 border rounded shadow-sm">
          <span class="badge bg-danger position-absolute top-0 start-0 m-2">-2%</span>

          <div class="position-relative">
            <img src="${product.image}" alt="${product.name}" class="img-fluid mb-2" style="height: 300px; width: 425px; object-fit: cover;">
            <div class="action-buttons position-absolute top-0 end-0 m-2 d-flex flex-column gap-1">
              <button class="btn btn-light p-1 favorite-btn" data-id="${index}">
                <i class="bi bi-heart"></i>
              </button>
              <button class="btn btn-light p-1 quickview-btn" data-id="${index}">
                <i class="bi bi-eye"></i>
              </button>
              <button class="btn btn-light p-1 compare-btn" data-id="${index}">
                <i class="bi bi-arrow-left-right"></i>
              </button>
            </div>
          </div>

          <h6 class="mt-2">${product.name}</h6>
          <p class="text-muted small">${product.description}</p>
          <div class="text-warning mb-1">★★★★★ <small class="text-muted">(1 review)</small></div>

          <div>
            <span class="text-decoration-line-through text-muted">Rs.10,000.00</span>
            <strong class="ms-2">Rs.9,800.00</strong>
          </div>

          <button class="btn mt-3 w-100 add-to-cart-btn"style="border:1px solid green;" data-id="${index}"  onclick="AddToCart(${index})" >Add to cart</button>
        </div>
      `;


    });

    
    $('.RecomendedProd-carousel').owlCarousel({
      loop: true,
      margin: 25,
      nav: true,
      dots: false,
      responsive: {
        0: { items: 1 },
        600: { items: 3 },
        1000: { items: 6 }
      }
    });
  });

   fetch('Database/Db.json')
  .then(response => response.json())
  .then(data => {
    const carouselInner = document.querySelector(".RecomendedProd-carousel");

    data.Logos.forEach((product, index) => {
      carouselInner.innerHTML += `
      
            <img style="padding:60px; gap:30px;" src="${product.image}" alt="${product.name}">
      `;


    });

    
    $('.BrandProd-carousel').owlCarousel({
      loop: true,
      margin: 10,
      nav: true,
      dots: false,
      responsive: {
        0: { items: 1 },
        600: { items: 4 },
        1000: { items: 6 }
      }
    });
  });