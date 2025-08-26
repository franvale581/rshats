// main.js
console.log("main.js cargado correctamente");

function iniciarApp() {
  // ----------- REFERENCIAS DOM -----------
  const menuToggle = document.getElementById('menuToggle');
  const barsMenu = document.getElementById('navMenu');
  const cartIcon = document.querySelector('.cart-icon');
  const cartMenu = document.querySelector('.cart');
  const overlay = document.getElementById('overlay');
  const navbarLinks = document.querySelectorAll('.navbar-link');
  const productsCart = document.querySelector('.cart-container');
  const total = document.querySelector('.total');
  const buyBtn = document.querySelector('.btn-buy');
  const deleteBtn = document.querySelector('.btn-delete');
  const cartBubble = document.querySelector('.cart-bubble');
  const closeCartBtn = document.querySelector('.cart-close-btn');
  const closeMenuBtn = document.querySelector('.menu-close-btn');
  const productsContainer = document.querySelector(".products-container");
  const completeSection = document.querySelector('.complete-buy-section');
  const addModal = document.querySelector('.add-modal');

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // ----------- MENÚ Y CARRITO -----------

  const toggleMenu = () => {
    if (barsMenu) barsMenu.classList.toggle("open");
    if (cartMenu && cartMenu.classList.contains("open-cart")) {
      cartMenu.classList.remove("open-cart");
      if (overlay) overlay.classList.remove("show-overlay");
      return;
    }
    if (overlay) overlay.classList.toggle("show-overlay");
  };

  const toggleCart = () => {
    if (cartMenu) cartMenu.classList.toggle("open-cart");
    if (barsMenu && barsMenu.classList.contains("open")) {
      barsMenu.classList.remove("open");
      if (overlay) overlay.classList.remove("show-overlay");
      return;
    }
    if (overlay) overlay.classList.toggle("show-overlay");
  };

  const closeOnClick = (e) => {
    if (!e.target.classList.contains("navbar-link")) return;
    if (barsMenu) barsMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("show-overlay");
  };

  const closeOnOverlayClick = () => {
    if (barsMenu) barsMenu.classList.remove("open");
    if (cartMenu) cartMenu.classList.remove("open-cart");
    if (overlay) overlay.classList.remove("show-overlay");
  };

  // ----------- RENDERIZADO DE PRODUCTOS -----------

  const renderProducts = () => {
    if (!productsContainer || typeof gorras === "undefined") return;
    productsContainer.innerHTML = gorras.map(({ id, name, brand, price, img }) => {
      // si es un .mp4 -> video, si no -> imagen
      const mediaElement = img.endsWith(".mp4")
        ? `<video src="${img}" autoplay loop muted playsinline class="product-media"></video>`
        : `<img src="${img}" alt="product" class="product-media">`;

      return `
      <div class="product">
        ${mediaElement}
        <div class="product-text-container">
          <h3 class="product-name">${name}</h3>
          <h2 class="created-by-product">${brand}</h2>
          <p class="product-price">$${price.toFixed(2)}</p>
        </div>
        <div class="btn-product-container">
          <button class="btn-add" data-id="${id}">Add</button>
          <button class="btn-info" data-id="${id}">INFO</button>
        </div>
      </div>
    `;
    }).join("");
  };

  // ----------- CARRITO -----------

  const saveCart = () => localStorage.setItem("cart", JSON.stringify(cart));

const renderCart = () => {
  if (!productsCart) return;
  if (!cart.length) {
    productsCart.innerHTML = `<p class="empty-msg">There are no products in the cart.</p>`;
    return;
  }
  productsCart.innerHTML = cart.map(({ id, name, price, cartimg, quantity }) => `
    <div class="cart-item">
      <img src="${cartimg}" alt="producto" />
      <div class="item-info">
        <h3 class="item-title">${name}</h3>
        <p class="item-bid">Price</p>
        <span class="item-price">$ ${price}</span>
      </div>
      <div class="item-handler">
        <span class="quantity-handler down" data-id="${id}">-</span>
        <span class="item-quantity">${quantity}</span>
        <span class="quantity-handler up" data-id="${id}">+</span>
      </div>
    </div>
  `).join("");
};


  const getCartTotal = () => cart.reduce((acc, cur) => cur.price * cur.quantity + acc, 0);

  const showCartTotal = () => { if (total) total.innerHTML = `$ ${getCartTotal().toFixed(2)}`; };

  const updateCartBubble = () => {
    if (!cartBubble) return;
    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartBubble.textContent = totalQuantity > 0 ? totalQuantity : "0";
  };

  const updateCartState = () => {
    saveCart();
    renderCart();
    showCartTotal();
    updateCartBubble();
  };

  // ----------- MODAL DE PRODUCTO AÑADIDO -----------

  const showAddModal = () => {
    if (!addModal) return;
    addModal.classList.add("active-modal");
    setTimeout(() => {
      addModal.classList.remove("active-modal");
    }, 2000);
  };

  // ----------- MANEJO DE PRODUCTOS -----------

  const handleProductClick = (e) => {
    if (!gorras) return;
    if (e.target.classList.contains("btn-info")) {
      const id = Number(e.target.dataset.id);
      localStorage.setItem("selectedProductId", id);
      window.location.href = "info.html";
    }
    if (e.target.classList.contains("btn-add")) {
      const id = Number(e.target.dataset.id);
      const product = gorras.find(p => p.id === id);
      if (product) addProduct(product);
    }
  };

  const addProduct = (product) => {
    const existing = cart.find(p => p.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    updateCartState();
    showAddModal();
  };

  const handleQuantity = (e) => {
    const id = e.target.dataset.id;
    const product = cart.find(p => p.id.toString() === id);
    if (!product) return;

    if (e.target.classList.contains("down")) {
      if (product.quantity === 1) {
        if (confirm("¿Eliminar producto del carrito?")) cart = cart.filter(p => p.id !== product.id);
      } else product.quantity--;
    } else if (e.target.classList.contains("up")) product.quantity++;
    updateCartState();
  };

  // ----------- COMPRA -> WHATSAPP -----------

  if (buyBtn) buyBtn.addEventListener("click", () => {
    if (!cart.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    const resumen = cart.map(p => `${p.quantity}x ${p.name} - $${(p.quantity * p.price).toFixed(2)}`).join('\n');

    const mensaje = `
*Hola, quiero realizar el siguiente pedido*
*Productos:*
${resumen}

Total: $${getCartTotal().toFixed(2)}
    `;

    const numeroNegocio = "5493562564401"; // <-- reemplazá con tu número

    const url = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");

    localStorage.removeItem("cart");
    cart = [];
    updateCartState();

    if (completeSection) {
      completeSection.innerHTML = `
        <div class="complete-buy-message">
          <h2>Tu pedido fue enviado a WhatsApp ✅</h2>
          <p>Completa la compra conversando con nuestro equipo.</p>
          <button id="backToShop">Volver a la tienda</button>
        </div>
      `;
      const backBtn = document.getElementById('backToShop');
      if (backBtn) backBtn.addEventListener('click', () => {
        window.location.href = "shop-now.html";
      });
    }
  });

  // ----------- EVENTOS -----------

  if (deleteBtn) deleteBtn.addEventListener("click", () => { cart = []; updateCartState(); });

  if (closeCartBtn) closeCartBtn.addEventListener("click", () => {
    if (cartMenu) cartMenu.classList.remove("open-cart");
    if (overlay) overlay.classList.remove("show-overlay");
  });

  if (closeMenuBtn) closeMenuBtn.addEventListener("click", () => {
    if (barsMenu) barsMenu.classList.remove("open");
    if (overlay) overlay.classList.remove("show-overlay");
  });

  if (menuToggle) menuToggle.addEventListener("click", toggleMenu);
  if (cartIcon) cartIcon.addEventListener("click", toggleCart);
  if (navbarLinks) navbarLinks.forEach(link => link.addEventListener("click", closeOnClick));
  if (overlay) overlay.addEventListener("click", closeOnOverlayClick);
  if (productsContainer) productsContainer.addEventListener("click", handleProductClick);
  if (productsCart) productsCart.addEventListener("click", handleQuantity);

  // ----------- RENDER INICIAL -----------

  renderProducts();
  updateCartState();
}

// Inicializar app al cargar DOM
document.addEventListener("DOMContentLoaded", () => {
  iniciarApp();
});
