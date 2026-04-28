const WHATSAPP_NUM = "543794236239";
const ADMIN_CREDS = { user: "fixzone121", pass: "fixzon3" };

let state = {
    categories: JSON.parse(localStorage.getItem('fx_categories_v2')) || [
        { id: 1, name: "Sistemas PC" },
        { id: 2, name: "Componentes" },
        { id: 3, name: "Periféricos Pro" }
    ],
    products: JSON.parse(localStorage.getItem('fx_products_v2')) || [
        { id: 101, name: "PC Gamer Master Case Custom", price: 2850000, categoryId: 1, image: 'assets/case.png' },
        { id: 102, name: "Monitor Gaming 27' 4K Ultra-Pro", price: 550000, categoryId: 2, image: 'assets/monitor.png' },
        { id: 103, name: "Nvidia RTX 4080 Super OC", price: 1750000, categoryId: 2, image: 'assets/gpu.png' },
        { id: 104, name: "Teclado Mecánico 75% Custom Pink", price: 135000, categoryId: 3, image: 'assets/keyboard.png' }
    ],
    cart: [],
    activeCategory: 'ALL',
    logoClicks: 0,
    currentProdImage: null
};

function $(id) { return document.getElementById(id); }
function saveState() {
    localStorage.setItem('fx_categories_v2', JSON.stringify(state.categories));
    localStorage.setItem('fx_products_v2', JSON.stringify(state.products));
}

// TIENDA
function renderStore() {
    const grid = $('product-grid');
    const tabs = $('category-tabs');
    const empty = $('empty-store');
    
    tabs.innerHTML = `<button onclick="filterBy('ALL')" class="${state.activeCategory === 'ALL' ? 'text-pink-500' : 'text-gray-600'} text-[10px] font-bold tracking-widest uppercase px-6 py-3 border-b-2 ${state.activeCategory === 'ALL' ? 'border-pink-500' : 'border-transparent'} transition-all hover:text-pink-500">Todo el Ecosistema</button>`;
    state.categories.forEach(cat => {
        tabs.innerHTML += `<button onclick="filterBy(${cat.id})" class="${state.activeCategory == cat.id ? 'text-pink-500' : 'text-gray-600'} text-[10px] font-bold tracking-widest uppercase px-6 py-3 border-b-2 ${state.activeCategory == cat.id ? 'border-pink-500' : 'border-transparent'} transition-all hover:text-pink-500">${cat.name}</button>`;
    });

    const filtered = state.activeCategory === 'ALL' ? state.products : state.products.filter(p => p.categoryId == state.activeCategory);

    grid.innerHTML = '';
    if (filtered.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    filtered.forEach(p => {
        grid.innerHTML += `
            <div class="glass-card p-10 rounded-[2.5rem] group hover:scale-[1.03]">
                <div class="h-44 bg-white/5 rounded-[2rem] mb-8 flex items-center justify-center relative overflow-hidden">
                    ${p.image 
                        ? `<img src="${p.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="${p.name}">`
                        : `<i class="fa-solid fa-microchip text-5xl text-white/5 group-hover:text-pink-500/20 transition-all"></i>`
                    }
                </div>
                <div class="space-y-4">
                    <span class="text-[9px] font-bold tracking-[0.3em] uppercase text-pink-500/60">${state.categories.find(c => c.id == p.categoryId)?.name || 'General'}</span>
                    <h3 class="text-xl font-bold truncate">${p.name}</h3>
                    <div class="flex justify-between items-center pt-6">
                        <span class="text-[22px] font-bold tracking-tight text-white">$${p.price.toLocaleString()}</span>
                        <button onclick="addToCart(${p.id})" class="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:bg-pink-500 hover:text-black transition-all">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function filterBy(cid) { state.activeCategory = cid; renderStore(); }

function addToCart(pid) {
    const product = state.products.find(p => p.id == pid);
    const inCart = state.cart.find(it => it.id == pid);
    if (inCart) { inCart.qty++; } else { state.cart.push({ ...product, qty: 1 }); }
    updateCartUI();
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-10 left-10 glass-card px-8 py-4 border-pink-500/40 z-[1000] text-xs font-bold tracking-widest text-pink-500 animate-bounce';
    notification.innerText = '+ Ítem Añadido';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
}

function updateCartUI() {
    const container = $('cart-items-container');
    const totalEl = $('cart-total');
    const badge = $('cart-badge');
    container.innerHTML = '';
    let total = 0, count = 0;
    state.cart.forEach((item, idx) => {
        total += item.price * item.qty;
        count += item.qty;
        container.innerHTML += `
            <div class="flex gap-8 group">
                <div class="w-24 h-24 bg-white/5 rounded-3xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    ${item.image 
                        ? `<img src="${item.image}" class="w-full h-full object-cover">`
                        : `<i class="fa-solid fa-cube text-white/10 text-3xl"></i>`
                    }
                </div>
                <div class="flex-1 space-y-2">
                    <div class="flex justify-between">
                        <h4 class="font-bold text-sm tracking-tight">${item.name}</h4>
                        <button onclick="removeFromCart(${idx})" class="text-gray-700 hover:text-red-500 transition-colors"><i class="fa-solid fa-trash-can text-sm"></i></button>
                    </div>
                    <p class="text-pink-500 font-bold text-sm">$${item.price.toLocaleString()}</p>
                    <div class="flex items-center gap-4 pt-4">
                        <button onclick="updateQty(${idx}, -1)" class="w-8 h-8 glass-card rounded-lg hover:border-pink-500/50 flex items-center justify-center text-xs">-</button>
                        <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
                        <button onclick="updateQty(${idx}, 1)" class="w-8 h-8 glass-card rounded-lg hover:border-pink-500/50 flex items-center justify-center text-xs">+</button>
                    </div>
                </div>
            </div>
        `;
    });
    totalEl.innerText = `$${total.toLocaleString()}`;
    badge.innerText = count;
    badge.classList.toggle('hidden', count === 0);
}

function updateQty(idx, delta) { state.cart[idx].qty += delta; if (state.cart[idx].qty < 1) state.cart.splice(idx, 1); updateCartUI(); }
function removeFromCart(idx) { state.cart.splice(idx, 1); updateCartUI(); }
function toggleCart() { $('cart-sidebar').classList.toggle('translate-x-full'); }

function checkoutCart() {
    if (state.cart.length === 0) return alert("Seleccione productos primero");
    let msg = "Hola buenas dueños de FixZone estoy interesado en :\n";
    let total = 0;
    state.cart.forEach(it => {
        msg += `• ${it.name} [x${it.qty}] — $${(it.price * it.qty).toLocaleString()}\n`;
        total += it.price * it.qty;
    });
    msg += `\n*TOTAL ESTIMADO: $${total.toLocaleString()}*`;
    const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

// CITA
function openCitaModal(defaultDesc = "") { $('cita-modal').classList.remove('hidden'); $('cita-desc').value = defaultDesc; }
function closeCitaModal() { $('cita-modal').classList.add('hidden'); }
function handleCitaSubmit(e) {
    e.preventDefault();
    const dev = $('cita-device').value, desc = $('cita-desc').value;
    const msg = `👔 *CONSULTA PROFESIONAL — FIXZONE*\n\n*Activo:* ${dev}\n*Descripción:* ${desc}`;
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
    closeCitaModal();
}

// ADMIN
function handleLogoClick(force = null) {
    if (force === 5) { $('admin-login-modal').classList.remove('hidden'); return; }
    state.logoClicks++;
    if (state.logoClicks >= 5) { state.logoClicks = 0; $('admin-login-modal').classList.remove('hidden'); }
    clearTimeout(window.logoTimeout);
    window.logoTimeout = setTimeout(() => { state.logoClicks = 0; }, 2000);
}
function handleAdminLogin(e) { e.preventDefault(); if ($('admin-user').value === ADMIN_CREDS.user && $('admin-pass').value === ADMIN_CREDS.pass) { $('admin-login-modal').classList.add('hidden'); $('admin-dashboard').classList.remove('hidden'); renderAdmin(); } else { alert("Error de Autenticación"); } }
function logoutAdmin() { $('admin-dashboard').classList.add('hidden'); }
function closeAdminModals() { $('admin-login-modal').classList.add('hidden'); }

function renderAdmin() {
    const catList = $('admin-category-list'), prodList = $('admin-product-list'), prodCatSelect = $('prod-cat');
    catList.innerHTML = ''; prodCatSelect.innerHTML = '';
    state.categories.forEach(cat => {
        catList.innerHTML += `
            <div class="glass-card p-5 rounded-2xl flex justify-between items-center border-white/5">
                <span class="text-xs font-bold text-gray-400 tracking-widest uppercase">${cat.name}</span>
                <div class="flex gap-4">
                    <button onclick="openCategoryForm(${cat.id})" class="text-[9px] text-pink-500 font-bold uppercase hover:tracking-widest transition-all">Editar</button>
                    <button onclick="deleteCategory(${cat.id})" class="text-[9px] text-red-700 font-bold uppercase hover:tracking-widest transition-all">Baja</button>
                </div>
            </div>
        `;
        prodCatSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
    });
    prodList.innerHTML = '';
    state.products.forEach(p => {
        const cn = state.categories.find(c => c.id == p.categoryId)?.name || '---';
        prodList.innerHTML += `
            <tr class="hover:bg-white/[0.01] transition-all">
                <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-white/5 rounded-lg overflow-hidden border border-white/5">
                            ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-image text-white/10 text-xs flex items-center justify-center h-full"></i>`}
                        </div>
                        <span class="text-sm font-bold text-gray-300">${p.name}</span>
                    </div>
                </td>
                <td class="px-8 py-6 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">${cn}</td>
                <td class="px-8 py-6 font-bold text-pink-500">$${p.price.toLocaleString()}</td>
                <td class="px-8 py-6">
                    <div class="flex gap-6">
                        <button onclick="openProductForm(${p.id})" class="text-gray-600 hover:text-pink-500 transition-colors"><i class="fa-solid fa-pen-nib"></i></button>
                        <button onclick="deleteProduct(${p.id})" class="text-gray-600 hover:text-red-500 transition-colors"><i class="fa-solid fa-ban"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    renderStore();
}

// CATEGORY CRUD
function openCategoryForm(id = null) {
    $('category-form-modal').classList.remove('hidden');
    if (id) {
        const c = state.categories.find(x => x.id == id);
        $('edit-cat-id').value = id; $('cat-name').value = c.name; $('cat-form-title').innerText = "Editar Nodo";
    } else {
        $('edit-cat-id').value = ''; $('cat-name').value = ''; $('cat-form-title').innerText = "Nuevo Nodo";
    }
}
function closeCategoryForm() { $('category-form-modal').classList.add('hidden'); }
function saveCategory() {
    const n = $('cat-name').value, id = $('edit-cat-id').value;
    if (!n) return;
    if (id) { state.categories.find(x => x.id == id).name = n; } else { state.categories.push({ id: Date.now(), name: n }); }
    saveState(); renderAdmin(); closeCategoryForm();
}
function deleteCategory(id) { if (confirm("¿Confirmar baja de categoría?")) { state.categories = state.categories.filter(c => c.id != id); saveState(); renderAdmin(); } }

// PRODUCT CRUD
function openProductForm(id = null) {
    $('product-form-modal').classList.remove('hidden');
    if (id) {
        const p = state.products.find(x => x.id == id);
        $('edit-prod-id').value = id; $('prod-name').value = p.name; $('prod-price').value = p.price; $('prod-cat').value = p.categoryId;
        state.currentProdImage = p.image;
        if (p.image) $('admin-prod-preview').innerHTML = `<img src="${p.image}" class="w-full h-full object-cover">`;
    } else {
        $('edit-prod-id').value = ''; $('prod-name').value = ''; $('prod-price').value = '';
        state.currentProdImage = null;
        $('admin-prod-preview').innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-2xl text-white/10"></i>`;
    }
}
function closeProductForm() { $('product-form-modal').classList.add('hidden'); }
function saveProduct() {
    const n = $('prod-name').value, pr = parseFloat($('prod-price').value), ci = parseInt($('prod-cat').value), id = $('edit-prod-id').value;
    if (!n || !pr) return;
    if (id) { 
        const p = state.products.find(x => x.id == id); 
        p.name = n; p.price = pr; p.categoryId = ci; p.image = state.currentProdImage;
    } else { 
        state.products.push({ id: Date.now(), name: n, price: pr, categoryId: ci, image: state.currentProdImage }); 
    }
    saveState(); renderAdmin(); closeProductForm();
}
function deleteProduct(id) { if (confirm("¿Eliminar registro de inventario?")) { state.products = state.products.filter(p => p.id != id); saveState(); renderAdmin(); } }

function toggleMobileMenu() { $('mobile-menu').classList.toggle('hidden'); }

window.onload = () => { 
    renderStore(); 
    updateCartUI(); 

    // Loader logic
    setTimeout(() => {
        const loader = $('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 2000);

    // File handling
    $('prod-img-input').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                state.currentProdImage = event.target.result;
                $('admin-prod-preview').innerHTML = `<img src="${state.currentProdImage}" class="w-full h-full object-cover">`;
            };
            reader.readAsDataURL(file);
        }
    });
}
