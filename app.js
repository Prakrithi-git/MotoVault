const bikes = [
  {
    id: 1,
    name: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    price: 193000,
    description: "Classic styling for comfortable rides.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"
  },
  {
    id: 2,
    name: "KTM Duke 390",
    brand: "KTM",
    price: 310000,
    description: "A sporty motorcycle for exciting rides.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800"
  },
  {
    id: 3,
    name: "Yamaha R15",
    brand: "Yamaha",
    price: 185000,
    description: "A stylish sports bike.",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800"
  },
  {
    id: 4,
    name: "Kawasaki Ninja",
    brand: "Kawasaki",
    price: 380000,
    description: "A powerful sports motorcycle.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800"
  },
  {
    id: 5,
    name: "BMW G 310 R",
    brand: "BMW",
    price: 290000,
    description: "A premium roadster for city rides.",
    image: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=800"
  },
  {
    id: 6,
    name: "Honda CB350",
    brand: "Honda",
    price: 215000,
    description: "A comfortable bike for everyday journeys.",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800"
  }
];

let currentUser = null;
let cart = [];
let wishlist = [];
let orders = [];

const money = amount =>
  "₹" + Number(amount).toLocaleString("en-IN");



function userKey(type) {
  return `motovault_${type}_${currentUser.email}`;
}

function loadUserData() {
  cart = JSON.parse(localStorage.getItem(userKey("cart")) || "[]");
  wishlist = JSON.parse(localStorage.getItem(userKey("wishlist")) || "[]");
  orders = JSON.parse(localStorage.getItem(userKey("orders")) || "[]");
  updateCartCount();
}

function saveUserData() {
  if (!currentUser) return;

  localStorage.setItem(userKey("cart"), JSON.stringify(cart));
  localStorage.setItem(userKey("wishlist"), JSON.stringify(wishlist));
  localStorage.setItem(userKey("orders"), JSON.stringify(orders));
  updateCartCount();
}

function showMessage(message, elementId = "authMessage") {
  document.getElementById(elementId).textContent = message;
}

function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.getElementById("loginTab").classList.add("active");
  document.getElementById("registerTab").classList.remove("active");
  showMessage("");
}

function showRegister() {
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerTab").classList.add("active");
  document.getElementById("loginTab").classList.remove("active");
  showMessage("");
}
document.getElementById("registerForm").addEventListener("submit", async event => {
  event.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(result.message);
      return;
    }
    event.target.reset();
    showLogin();
    document.getElementById("loginEmail").value = email;
    showMessage("Account created! Please log in.");

  } catch (error) {
    console.error("Registration error:", error);
    showMessage("Could not connect to the server.");
  }
});
document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(result.message);
      return;
    }

    currentUser = result.user;

    sessionStorage.setItem(
      "motovaultCurrentUser",
      JSON.stringify(currentUser)
    );

    loadUserData();
    showDashboard();

  } catch (error) {
    console.error("Login error:", error);
    showMessage("Could not connect to the server.");
  }
});
function showDashboard() {
  document.getElementById("authSection").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("navLinks").classList.remove("hidden");
  hideOtherSections();
  renderBikes();
}

function hideOtherSections() {
  document.getElementById("cartSection").classList.add("hidden");
  document.getElementById("wishlistSection").classList.add("hidden");
  document.getElementById("ordersSection").classList.add("hidden");
}

function showHome() {
  if (!currentUser) return;
  hideOtherSections();
  document.getElementById("dashboard").classList.remove("hidden");
  renderBikes();
}

function scrollToBikes() {
  document.getElementById("bikeSection").scrollIntoView({
    behavior: "smooth"
  });
}

function renderBikes() {
  const grid = document.getElementById("bikeGrid");
  const search = document.getElementById("searchInput").value.toLowerCase();

  const filtered = bikes.filter(bike =>
    bike.name.toLowerCase().includes(search) ||
    bike.brand.toLowerCase().includes(search)
  );

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty">No bikes found.</p>';
    return;
  }

  filtered.forEach(bike => {
    const saved = wishlist.includes(bike.id);

    const card = document.createElement("article");
    card.className = "bike-card";

    card.innerHTML = `
      <img src="${bike.image}" alt="${bike.name}"
           onerror="this.src='https://placehold.co/600x400?text=Bike'">
      <div class="bike-info">
        <h3>${bike.name}</h3>
        <p>${bike.description}</p>
        <p class="price">${money(bike.price)}</p>
        <div class="card-actions">
          <button onclick="addToCart(${bike.id})">Add to Cart</button>
          <button class="buy-btn" onclick="orderNow(${bike.id})">Order Now</button>
          <button onclick="toggleWishlist(${bike.id})">
            ${saved ? "♥ Saved" : "♡ Wishlist"}
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveUserData();
  alert("Bike added to your cart!");
}

function orderNow(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveUserData();
  showCart();
  showMessage("Bike added. Review your cart and place your demo order.", "cartMessage");
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(item => item !== id);
  } else {
    wishlist.push(id);
  }

  saveUserData();
  renderBikes();
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
}

function showCart() {
  hideOtherSections();
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("cartSection").classList.remove("hidden");
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");
  const checkout = document.getElementById("checkoutBtn");

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty">Your cart is empty.</p>';
    totalElement.textContent = "";
    checkout.classList.add("hidden");
    updateCartCount();
    return;
  }

  checkout.classList.remove("hidden");

  cart.forEach(item => {
    const bike = bikes.find(b => b.id === item.id);
    if (!bike) return;

    total += bike.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <div>
        <strong>${bike.name}</strong>
        <p>${money(bike.price)} × ${item.quantity}</p>
      </div>
      <div>
        <button onclick="changeQuantity(${bike.id}, -1)">−</button>
        <button onclick="changeQuantity(${bike.id}, 1)">+</button>
        <button onclick="removeFromCart(${bike.id})">Remove</button>
      </div>
    `;
    container.appendChild(row);
  });

  totalElement.textContent = "Total: " + money(total);
  updateCartCount();
}

function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveUserData();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveUserData();
  renderCart();
}

function placeOrder() {
  if (cart.length === 0) return;

  const order = {
    orderNumber: "MV" + Date.now(),
    date: new Date().toLocaleString(),
    items: cart.map(item => ({ ...item })),
    total: cart.reduce((sum, item) => {
      const bike = bikes.find(b => b.id === item.id);
      return sum + (bike ? bike.price * item.quantity : 0);
    }, 0)
  };

  orders.unshift(order);
  cart = [];
  saveUserData();
  renderCart();

  showMessage("Demo order placed successfully! No payment was collected.", "cartMessage");
}

function showWishlist() {
  hideOtherSections();
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("wishlistSection").classList.remove("hidden");

  const container = document.getElementById("wishlistItems");
  container.innerHTML = "";

  const savedBikes = bikes.filter(bike => wishlist.includes(bike.id));

  if (savedBikes.length === 0) {
    container.innerHTML = '<p class="empty">Your wishlist is empty.</p>';
    return;
  }

  savedBikes.forEach(bike => {
    const card = document.createElement("article");
    card.className = "bike-card";
    card.innerHTML = `
      <img src="${bike.image}" alt="${bike.name}">
      <div class="bike-info">
        <h3>${bike.name}</h3>
        <p class="price">${money(bike.price)}</p>
        <div class="card-actions">
          <button class="buy-btn" onclick="addToCart(${bike.id})">Add to Cart</button>
          <button onclick="toggleWishlist(${bike.id}); showWishlist()">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function showOrders() {
  hideOtherSections();
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("ordersSection").classList.remove("hidden");

  const container = document.getElementById("orderItems");
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = '<p class="empty">You have no orders yet.</p>';
    return;
  }

  orders.forEach(order => {
    const row = document.createElement("div");
    row.className = "order-row";
    row.innerHTML = `
      <div>
        <strong>Order ${order.orderNumber}</strong>
        <p>${order.date}</p>
      </div>
      <strong>${money(order.total)}</strong>
    `;
    container.appendChild(row);
  });
}

function logout() {
  currentUser = null;
  cart = [];
  wishlist = [];
  orders = [];
  sessionStorage.removeItem("motovaultCurrentUser");

  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("navLinks").classList.add("hidden");
  document.getElementById("authSection").classList.remove("hidden");

  hideOtherSections();
  document.getElementById("loginForm").reset();
  showLogin();
  showMessage("You have logged out.");
}

// Restore the login for this browser tab if the page is refreshed.
const savedUser = sessionStorage.getItem("motovaultCurrentUser");

if (savedUser) {
  try {
    currentUser = JSON.parse(savedUser);
    loadUserData();
    showDashboard();
  } catch (error) {
    sessionStorage.removeItem("motovaultCurrentUser");
    currentUser = null;
  }
}