// Updated RenderProducts.js - Separated Brand and Product Carousels

Promise.all([
  fetch('Database/db.json').then(r => r.json()),
  fetch('Database/db2.json').then(r => r.json())
]).then(([db, db2]) => {
  products = db2;

  // Featured Carousel (same as before)
  document.querySelector(".carousel-inner").innerHTML = db.featured.slice(0, 3).map((el, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      <img class="d-block w-100" src="${el.image}">
      <div class="carousel-caption d-none d-md-block">
        <h5>${el.title}</h5><p>${el.subtitle}</p><p>${el.description}</p>
        ${el.button ? `<a class="btn btn-light" href="#">${el.button}</a>` : ''}
      </div></div>`).join('');

  // Promo Cards (same as before)
  [db.featured[3], db.featured[4]].forEach((item, i) => {
    document.querySelector([ '.Product-item1', '.Product-item2' ][i]).innerHTML = `
      <div class="promo-card d-flex align-items-center text-white p-4 rounded mb-3"
           style="background: linear-gradient(to right, #7a003d, #1e004e); height: 180px;">
        <div class="flex-grow-1">
          <h5>${item.title}</h5><h6>${item.subtitle}</h6><p class="text-white-50">${item.description}</p>
        </div><div class="ms-4"><img src="${item.image}" style="height:140px;" class="img-fluid"></div></div>`;
  });

  // Categories (same as before)
  document.querySelector(".category-carousel").innerHTML = db.categories.map(c => `
    <div class="item text-center">
      <img src="${c.image}" class="img-fluid mb-2" style="height: 100px;">
      <p>${c.name}</p><small>${c.items}</small></div>`).join('');
  
  // Initialize category carousel
  $('.category-carousel').owlCarousel({ 
    loop: true, 
    margin: 70, 
    nav: true, 
    dots: false, 
    responsive: {
      0: {items: 2},
      600: {items: 3},
      1000: {items: 4}, 
      1300: {items: 7},
      1920: {items: 10}
    } 
  });

  // Unified Product Rendering Function
  const renderProductList = (selector, width = "280px", height = "200px") => {
    const element = document.querySelector(selector);
    if (!element) return; // Safety check
    
    // Debug: Check if db2 exists and log its structure
    console.log('db2 (products):', db2);
    
    if (!db2 || !Array.isArray(db2)) {
      console.error('db2 is not available or not an array');
      return;
    }
    
    element.innerHTML = db2.map((p, i) => {
      // Debug: Log each product object to see its properties
      console.log(`Product ${i}:`, p);
      
      // Handle missing properties with fallbacks
      const discount = p.discount || 0;
      const image = p.image || p.img || p.photo || '';
      const name = p.name || p.title || p.productName || 'Unknown Product';
      const description = p.description || p.desc || 'No description available';
      const rating = p.rating || 0;
      const reviews = p.reviews || p.reviewCount || 0;
      const originalPrice = p.originalPrice || p.price || 0;
      const discountedPrice = p.discountedPrice || p.salePrice || originalPrice;
      const id = p.id || i;
      
      return `
        <div class="product-card">
          <span class="badge">-${discount}%</span>
          <div class="position-relative">
            <img src="${image}" alt="${name}" 
                 style="height:${height}; width:100%; object-fit:cover;"
                 onerror="this.src='placeholder-image.jpg'">
            <div class="action-buttons">
              <button class="favorite-btn" data-id="${id}">
                <i class="bi bi-heart"></i>
              </button>
            </div>
          </div>
          
          <h6>${name}</h6>
          <p class="text-muted small">${description}</p>
          
          <div class="text-warning mb-2">
            ${'★'.repeat(rating)}${'☆'.repeat(5-rating)} 
            <small>(${reviews} review${reviews !== 1 ? 's' : ''})</small>
          </div>
          
          <div class="price-section">
            <span class="text-decoration-line-through text-muted">
              Rs.${originalPrice.toLocaleString()}
            </span>
            <br>
            <strong>Rs.${discountedPrice.toLocaleString()}</strong>
          </div>
          
          <button class="btn-add-cart" onclick="AddToCart(${id})">
            Add to cart
          </button>
        </div>
      `;
    }).join('');
  };

  // Brand Rendering Function (separate from products)
  const renderBrandList = (selector) => {
    const element = document.querySelector(selector);
    if (!element) return; // Safety check
    
    if (!db.Logos || !Array.isArray(db.Logos)) {
      console.error('db.Logos is not available or not an array');
      return;
    }
    
    element.innerHTML = db.Logos.map((logo, index) => {
      // Since your JSON only has 'image' property, we'll extract brand name from filename
      const imageSrc = logo.image || '';
      const fileName = imageSrc.split('/').pop().split('.')[0]; // Extract filename without extension
      const brandName = fileName.replace('Brand', 'Brand '); // Convert "Brand01" to "Brand 01"
      
      return `
        <div class="brand-item text-center">
          <img src="${imageSrc}" alt="${brandName}" 
               style="max-height: 80px; max-width: 150px; object-fit: contain; padding: 20px;"
               onerror="this.style.display='none'">
        </div>
      `;
    }).join('');
  };

  // Render products for product carousels only
  renderProductList('.FreatureProd-carousel');
  renderProductList('.PopularProd-carousel');
  renderProductList('.RecomendedProd-carousel');

  // Render brands for brand carousel only
  renderBrandList('.BrandProd-carousel');

  // Initialize all carousels with proper settings
  // Destroy existing carousels first to prevent conflicts
  $('.FreatureProd-carousel').trigger('destroy.owl.carousel');
  $('.PopularProd-carousel').trigger('destroy.owl.carousel');
  $('.RecomendedProd-carousel').trigger('destroy.owl.carousel');
  $('.BrandProd-carousel').trigger('destroy.owl.carousel');

  // Small delay to ensure DOM is ready
  setTimeout(() => {
    // Featured Products Carousel
    $('.FreatureProd-carousel').owlCarousel({
      loop: false,
      margin: 20,
      nav: true,
      dots: false,
      autoplay: false,
      responsive: {
        0: { items: 1 },
        600: { items: 2 },
        1000: { items: 3 },
        1200: { items: 4 }
      }
    });

    // Popular Products Carousel
    $('.PopularProd-carousel').owlCarousel({
      loop: false,
      margin: 20,
      nav: true,
      dots: false,
      autoplay: false,
      responsive: {
        0: { items: 1 },
        600: { items: 2 },
        1000: { items: 3 },
        1200: { items: 4 }
      }
    });

    // Recommended Products Carousel
    $('.RecomendedProd-carousel').owlCarousel({
      loop: false,
      margin: 20,
      nav: true,
      dots: false,
      autoplay: false,
      responsive: {
        0: { items: 1 },
        600: { items: 2 },
        1000: { items: 3 },
        1200: { items: 4 }
      }
    });

    // Brand Carousel (separate settings optimized for logos)
    $('.BrandProd-carousel').owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      dots: false,
      autoplay: true,
      autoplayTimeout: 3000,
      autoplayHoverPause: true,
      responsive: {
        0: { items: 2 },
        600: { items: 4 },
        1000: { items: 6 },
        1200: { items: 8 }
      }
    });
  }, 100);
});