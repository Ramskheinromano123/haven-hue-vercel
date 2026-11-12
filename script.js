/* ==============================================================
 * HAVEN & HUE  -  INTERACTIONS
 * Cart, checkout & payments, login, products, colors/photos and scroll effects.
 *
 * CONTENTS (search for the name to jump to it)
 *    1. CART
 *    2. CHECKOUT & PAYMENT
 *    3. LOGIN SYSTEM
 *    4. PRODUCTS
 *    5. PER-COLOR PRODUCT IMAGES
 *    6. YOUR REAL PHOTOS
 *    7. SCROLL REVEAL FOR PRODUCT CARDS
 *    8. PRODUCT POPUP
 *    9. KEYBOARD SHORTCUTS & STARTUP
 * ============================================================== */

/* ---------- CART (add, remove, totals, drawer) ---------- */
let cart = [];
let payMethod = 'ewallet';
// EDIT HERE: free-shipping minimum and shipping fee (in pesos)
const FREE_SHIP = 1500, SHIP_FEE = 99;

function addLine(l) {
    const found = cart.find(i => i.key === l.key);
    if (found) found.quantity += l.qty;
    else cart.push({ key: l.key, name: l.name, opt: l.opt, hex: l.hex, img: l.img || null, icon: l.icon || '', price: l.price, quantity: l.qty });
}

function totals() {
    const sub = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const ship = sub === 0 || sub >= FREE_SHIP ? 0 : SHIP_FEE;
    return { sub, ship, total: sub + ship, count: cart.reduce((s, i) => s + i.quantity, 0) };
}

function thumb(i) {
    return i.img
        ? `<div class="ci-img"><img src="${i.img}" alt="${i.name} - ${i.opt}"></div>`
        : `<div class="ci-img" style="background:${i.hex}">${i.icon}</div>`;
}

function renderCart() {
    const t = totals();
    $('cartCount').textContent = t.count;
    $('navCount').textContent = t.count;
    $('cartTotal').textContent = t.sub.toLocaleString('en-PH');
    $('cartItems').innerHTML = cart.length ? cart.map(i => `${i.name} (${i.opt}) × ${i.quantity}`).join('<br>') : 'Your cart is empty.';
    if (!$('cartDrawer').hidden) drawCart();
}

function drawCart() {
    const t = totals();
    $('drawerBody').innerHTML = cart.length ? cart.map(i => `
        <div class="ci">${thumb(i)}
            <div class="ci-info">
                <b>${i.name}</b>
                <small><i style="background:${i.hex}"></i>${i.opt} · ${peso(i.price)}</small>
                <div class="ci-row">
                    <div class="qty"><button onclick="changeQty('${i.key}',-1)">−</button><span>${i.quantity}</span><button onclick="changeQty('${i.key}',1)">+</button></div>
                    <b>${peso(i.price * i.quantity)}</b>
                </div>
                <button class="ci-rm" onclick="removeItem('${i.key}')">Remove</button>
            </div>
        </div>`).join('') : '<div class="empty">🛍️<br>Your cart is empty.<br>Pick a product and choose your color!</div>';
    $('drawerFoot').innerHTML = cart.length ? `
        <div class="sum-row"><span>Subtotal</span><span>${peso(t.sub)}</span></div>
        <div class="sum-row"><span>Shipping</span><span>${t.ship ? peso(t.ship) : '<span class="free">FREE</span>'}</span></div>
        ${t.ship ? `<div class="sum-row" style="font-size:12px">Add ${peso(FREE_SHIP - t.sub)} more for free shipping</div>` : ''}
        <div class="sum-row total"><span>Total</span><span>${peso(t.total)}</span></div>
        <button class="btn" style="width:100%;margin-top:12px" onclick="openCheckout()">Proceed to Checkout</button>` : '';
}

function openCart(e) { if (e) e.preventDefault(); $('cartBg').hidden = false; $('cartDrawer').hidden = false; drawCart(); }
function closeCart() { $('cartBg').hidden = true; $('cartDrawer').hidden = true; }
function changeQty(key, d) {
    const i = cart.find(x => x.key === key); if (!i) return;
    i.quantity = Math.max(1, Math.min(99, i.quantity + d)); renderCart(); drawCart();
}
function removeItem(key) { cart = cart.filter(x => x.key !== key); renderCart(); drawCart(); }

/* ---------- CHECKOUT & PAYMENT (demo only: no real money moves) ---------- */
function openCheckout() {
    if (!cart.length) return;
    closeCart();
    $('checkoutModal').hidden = false;
    drawCheckout();
}
function closeCheckout() { $('checkoutModal').hidden = true; }
function selectPay(m) { payMethod = m; drawPayDetail(); document.querySelectorAll('.pay').forEach(p => p.classList.toggle('on', p.dataset.m === m)); }

function drawCheckout() {
    const t = totals(), u = getData('hh_session') || {};
    $('ckBody').innerHTML = `
    <div class="eyebrow" style="color:var(--gold)">Secure checkout</div>
    <h2>Checkout</h2>
    <form id="ckForm" onsubmit="placeOrder(event)"><div class="ck-grid">
        <div>
            <h4>Delivery details</h4>
            <input id="cName" placeholder="Full name" value="${u.name || ''}" required>
            <input id="cPhone" type="tel" placeholder="Mobile number (e.g. 0917 123 4567)" required>
            <textarea id="cAddr" rows="3" placeholder="Complete address (street, barangay, city, province)" required></textarea>
            <h4>Payment method</h4>
            <label class="pay" data-m="ewallet"><input type="radio" name="pm" ${payMethod === 'ewallet' ? 'checked' : ''} onchange="selectPay('ewallet')"><span class="pi">📱</span><span><b>E-Wallet</b><small>GCash, Maya, ShopeePay</small></span></label>
            <label class="pay" data-m="bank"><input type="radio" name="pm" ${payMethod === 'bank' ? 'checked' : ''} onchange="selectPay('bank')"><span class="pi">🏦</span><span><b>Bank Transfer</b><small>BDO, BPI, Metrobank, UnionBank</small></span></label>
            <label class="pay" data-m="cod"><input type="radio" name="pm" ${payMethod === 'cod' ? 'checked' : ''} onchange="selectPay('cod')"><span class="pi">💵</span><span><b>Cash on Delivery</b><small>Pay in cash when your order arrives</small></span></label>
            <div id="payDetail"></div>
        </div>
        <div class="ck-sum">
            <h4 style="margin-top:0">Order summary</h4>
            ${cart.map(i => `<div class="ci">${thumb(i)}<div class="ci-info"><b>${i.name}</b><small><i style="background:${i.hex}"></i>${i.opt} × ${i.quantity}</small></div><b style="font-size:13px">${peso(i.price * i.quantity)}</b></div>`).join('')}
            <div class="sum-row" style="margin-top:12px"><span>Subtotal</span><span>${peso(t.sub)}</span></div>
            <div class="sum-row"><span>Shipping</span><span>${t.ship ? peso(t.ship) : '<span class="free">FREE</span>'}</span></div>
            <div class="sum-row total"><span>Total</span><span>${peso(t.total)}</span></div>
            <button class="btn" type="submit" style="width:100%;margin-top:14px" id="placeBtn"></button>
            <p class="ck-note">Demo store: no real payment is processed.</p>
        </div>
    </div></form>`;
    selectPay(payMethod);
}

// EDIT HERE: your real e-wallet number and bank account details (search "0917 000 0000" and "0012 3456 7890")
function drawPayDetail() {
    const t = totals();
    const btn = $('placeBtn');
    let h = '';
    if (payMethod === 'ewallet') {
        h = `<div class="pay-detail">Choose your e-wallet, send <b>${peso(t.total)}</b> to the number below, then enter your reference number.
            <select id="walletType"><option>GCash</option><option>Maya</option><option>ShopeePay</option></select>
            <div class="acct">Haven &amp; Hue · <b>0917 000 0000</b></div>
            <input id="payNum" type="tel" placeholder="Your e-wallet number" required>
            <input id="payRef" placeholder="Reference / transaction number" required></div>`;
        btn.textContent = 'Place Order · Pay ' + peso(t.total);
    } else if (payMethod === 'bank') {
        h = `<div class="pay-detail">Transfer <b>${peso(t.total)}</b> to our account, then enter your reference number.
            <select id="bankType"><option>BDO</option><option>BPI</option><option>Metrobank</option><option>UnionBank</option><option>Landbank</option></select>
            <div class="acct">Account name: <b>Haven &amp; Hue Home Décor</b><br>Account no.: <b>0012 3456 7890</b></div>
            <input id="payRef" placeholder="Deposit slip / reference number" required></div>`;
        btn.textContent = 'Place Order · Pay ' + peso(t.total);
    } else {
        h = `<div class="pay-detail">💵 Pay <b>${peso(t.total)}</b> in cash to the courier upon delivery. Please prepare the exact amount if possible.</div>`;
        btn.textContent = 'Place Order · Cash on Delivery';
    }
    $('payDetail').innerHTML = h;
}

function placeOrder(e) {
    e.preventDefault();
    const t = totals();
    const label = payMethod === 'ewallet' ? 'E-Wallet (' + $('walletType').value + ')'
                : payMethod === 'bank' ? 'Bank Transfer (' + $('bankType').value + ')' : 'Cash on Delivery';
    const order = {
        no: 'HH-' + Date.now().toString().slice(-7),
        date: new Date().toISOString(),
        customer: { name: $('cName').value.trim(), phone: $('cPhone').value.trim(), address: $('cAddr').value.trim() },
        payment: label, ref: $('payRef') ? $('payRef').value.trim() : '',
        items: cart.map(i => ({ name: i.name, color: i.opt, qty: i.quantity, price: i.price })),
        subtotal: t.sub, shipping: t.ship, total: t.total
    };
    const orders = getData('hh_orders') || []; orders.push(order); setData('hh_orders', orders);
    cart = []; renderCart();
    const cod = payMethod === 'cod';
    $('ckBody').innerHTML = `<div class="done">
        <div class="ok">✓</div><h2>Thank you, ${order.customer.name.split(' ')[0]}!</h2>
        <p style="color:#81756c">Your order has been placed.</p>
        <div class="ordno">Order no.: <b>${order.no}</b><br>Payment: <b>${label}</b><br>
        Status: <b>${cod ? 'To be paid on delivery' : 'Awaiting payment verification'}</b><br>
        ${order.ref ? 'Reference: <b>' + order.ref + '</b><br>' : ''}Deliver to: ${order.customer.address}<br>
        Total: <b>${peso(order.total)}</b></div>
        <button class="btn" onclick="closeCheckout()">Continue Shopping</button></div>`;
}

/* ---------- LOGIN SYSTEM (demo: stored in this browser only) ---------- */
let authMode = 'login';
const mem = {};

function getData(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch (e) { return mem[key] || null; }
}
let storageBlocked = false;
function setData(key, val) {
    mem[key] = val;
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { storageBlocked = true; }
}
function removeData(key) {
    delete mem[key];
    try { localStorage.removeItem(key); } catch (e) {}
}

function $(id) { return document.getElementById(id); }

function openAuth(e) {
    if (e) e.preventDefault();
    $('authModal').hidden = false;
    setMode(authMode);
}
function closeAuth() { $('authModal').hidden = true; $('authError').textContent = ''; }

function setMode(mode) {
    authMode = mode;
    const signup = mode === 'signup';
    $('fName').hidden = !signup;
    $('fName').required = signup;
    $('tabLogin').classList.toggle('active', !signup);
    $('tabSignup').classList.toggle('active', signup);
    $('authSubmit').textContent = signup ? 'Create Account' : 'Login';
    $('authSub').textContent = signup
        ? 'Join Haven & Hue to unlock our collection.'
        : 'Welcome back! Log in to browse our collection.';
    $('authError').textContent = '';
}

function submitAuth(e) {
    e.preventDefault();
    const email = $('fEmail').value.trim().toLowerCase();
    const pass = $('fPass').value;
    const users = getData('hh_users') || [];

    if (authMode === 'signup') {
        const name = $('fName').value.trim();
        if (pass.length < 6) { $('authError').textContent = 'Password must be at least 6 characters.'; return; }
        if (users.some(u => u.email === email)) { $('authError').textContent = 'An account with this email already exists.'; return; }
        users.push({ name: name, email: email, pass: pass });
        setData('hh_users', users);
        setData('hh_session', { name: name, email: email });
    } else {
        const user = users.find(u => u.email === email && u.pass === pass);
        if (!user) { $('authError').textContent = 'Incorrect email or password.'; return; }
        setData('hh_session', { name: user.name, email: user.email });
    }

    $('authForm').reset();
    if (authMode === 'signup' && storageBlocked) alert('Your browser is blocking saved data, so this new account will be forgotten when you refresh. Use the demo account (demo@havenhue.com / demo1234) or open the page through a local server.');
    closeAuth();
    updateAuthUI();
    showToast('Welcome, ' + getData('hh_session').name.split(' ')[0] + '!');
    location.hash = '#shop';
}

function navAuthClick(e) {
    e.preventDefault();
    if (getData('hh_session')) {
        removeData('hh_session');
        cart = [];
        closeCart();
        renderCart();
        updateAuthUI();
        showToast('You have been logged out.');
    } else {
        openAuth();
    }
}

function updateAuthUI() {
    const user = getData('hh_session');
    const on = !!user;
    $('productsGrid').hidden = !on;
    $('catBar').hidden = !on;
    $('cartPanel').hidden = !on;
    $('navCart').hidden = !on;
    $('heroLogin').hidden = on;
    $('navUser').hidden = !on;
    $('navAuth').textContent = on ? 'Logout' : 'Login';
    if (on) {
        $('navUser').textContent = 'Hi, ' + user.name.split(' ')[0];
        $('shopSub').textContent = 'Welcome back, ' + user.name.split(' ')[0] + '! Here are our best sellers.';
    } else {
        $('shopSub').textContent = 'Beautiful finds to make your space uniquely yours.';
    }
}

function showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => t.classList.remove('show'), 2200);
}

// Demo login: demo@havenhue.com / demo1234  (remove this when you have a real backend)
function ensureDemoAccount() {
    const users = getData('hh_users') || [];
    if (!users.some(u => u.email === 'demo@havenhue.com')) {
        users.push({ name: 'Demo Shopper', email: 'demo@havenhue.com', pass: 'demo1234' });
        setData('hh_users', users);
    }
}

/* ---------- PRODUCTS ---------- */
// EDIT HERE: product names, prices, photos, colors and add-ons
const PRODUCTS = [
 { name:'Minimalist Ceramic Vase', price:450, img:'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=700&q=80', desc:'A simple, elegant accent for shelves and tables.',
   colors:[['White','#f3efe8']],
   extras:[{n:'Dried Pampas Stems',i:'🌾',p:180,c:[['Natural','#d9c3a0'],['White','#f1ece4']]},{n:'Small Bud Vase',i:'🏺',p:220,c:[['White','#f3efe8'],['Sand','#d8c4a8'],['Terracotta','#b8694a']]}] },
 { name:'Cozy Scented Candle', price:280, img:'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80', desc:'Add a soft glow and relaxing atmosphere.',
   colors:[['Vanilla Cream','#f3e6c8']],
   extras:[{n:'Brass Candle Holder',i:'🕯️',p:250,c:[['Gold','#c9a24b'],['Matte Black','#333333']]},{n:'Matchbox Set',i:'🔥',p:90,c:[['Natural','#d9c3a0'],['Black','#333333']]}] },
 { name:'Wooden Decor Tray', price:520, img:'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80', desc:'A warm natural touch for your coffee table.',
   colors:[['Oak','#c79a67']],
   extras:[{n:'Coaster Set (4 pcs)',i:'🪵',p:160,c:[['Oak','#c79a67'],['Walnut','#6b4a33']]},{n:'Decor Ball Set',i:'⚪',p:140,c:[['Cream','#efe6d8'],['Grey','#9a9a9a']]}] },
 { name:'Textured Throw Cushion', price:390, img:'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=700&q=80', desc:'Bring comfort and texture to your favorite seat.',
   colors:[['Cream','#efe6d8']],
   extras:[{n:'Extra Cushion Cover',i:'🛋️',p:190,c:[['Cream','#efe6d8'],['Mocha','#8b6a52'],['Olive','#7d8460'],['Blush','#d8b4a6']]},{n:'Knit Throw Blanket',i:'🧶',p:480,c:[['Oatmeal','#d9cdb9'],['Grey','#9a9a9a'],['Rust','#a65e3f']]}] },
 { name:'Warm Glow Table Lamp', price:890, img:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80', desc:'Gentle lighting for a calm and cozy room.',
   colors:[['Brass','#c9a24b']],
   extras:[{n:'Warm Glow Bulb',i:'💡',p:120,c:[['Warm White','#fbe7b5']]},{n:'Linen Lampshade',i:'🏮',p:260,c:[['Ivory','#f1ead9'],['Beige','#d6c4a8'],['Grey','#9a9a9a']]}] },
 { name:'Framed Art Print', price:650, img:'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=700&q=80', desc:'Give empty walls a little more personality.',
   colors:[['Black Frame','#2b2b2b']],
   extras:[{n:'Matching Second Print',i:'🖼️',p:450,c:[['Black Frame','#2b2b2b'],['Oak Frame','#c79a67'],['White Frame','#f3efe8']]},{n:'Wall Hook Kit',i:'🔨',p:70,c:[['Silver','#bfbfbf'],['Gold','#c9a24b']]}] },
 { name:'Handcrafted Ceramic Bowl', price:350, img:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=700&q=80', desc:'A lovely decorative piece for any tabletop.',
   colors:[['Cream','#efe6d8']],
   extras:[{n:'Wooden Bowl Stand',i:'🪵',p:210,c:[['Oak','#c79a67'],['Walnut','#6b4a33']]},{n:'Dried Flower Filler',i:'🌸',p:150,c:[['Natural','#d9c3a0'],['Blush','#d8b4a6']]}] },
 { name:'Natural Greenery Accent', price:320, img:'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=700&q=80', desc:'Freshen up your space with a touch of green.',
   colors:[['Fresh Green','#7e9a6d']],
   extras:[{n:'Woven Planter Pot',i:'🪴',p:260,c:[['Natural','#d9c3a0'],['Black','#333333']]},{n:'Pebble Topper Set',i:'🪨',p:80,c:[['White','#f3efe8'],['Grey','#9a9a9a']]}] }
];

/* ---------- PER-COLOR PRODUCT IMAGES ----------
   To use your own photo for a color, add a 3rd value to that color:
   colors:[['White','#f3efe8','white-vase.jpg'], ['Sand','#d8c4a8','sand-vase.jpg']]
   Colors without a photo get a generated product picture in that color (backdrop never changes). */
/* ---------- CATEGORIES (each product has exactly ONE) ----------
   EDIT HERE: change a product's category in the list below (same order as PRODUCTS). */
const CATS = ['Tabletop', 'Candles & Lighting', 'Cozy Textiles', 'Wall Art', 'Greenery'];
['Tabletop', 'Candles & Lighting', 'Tabletop', 'Cozy Textiles', 'Candles & Lighting', 'Wall Art', 'Tabletop', 'Greenery']
    .forEach((c, i) => PRODUCTS[i].cat = c);
let activeCat = 'All';
function drawFilters() {
    $('catBar').innerHTML = ['All'].concat(CATS).map(c => {
        const n = c === 'All' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === c).length;
        return `<button type="button" class="fbtn ${c === activeCat ? 'on' : ''}" data-cat="${c}" onclick="setCat(this.dataset.cat)">${c}<small>${n}</small></button>`;
    }).join('');
}
function setCat(c) { activeCat = c; drawFilters(); renderProducts(); }

const KINDS = ['vase', 'candle', 'tray', 'cushion', 'lamp', 'frame', 'bowl', 'plant'];
PRODUCTS.forEach((p, i) => p.kind = KINDS[i]);

/* ---------- YOUR REAL PHOTOS ----------
   Paste a photo link (or a file path like 'images/vase-white.jpg') between the quotes
   for each product + color. Leave '' to use the default photo / generated picture. */
const PHOTOS = {
    // Minimalist Ceramic Vase
    'Minimalist Ceramic Vase|White': '',
    // Cozy Scented Candle
    'Cozy Scented Candle|Vanilla Cream': '',
    // Wooden Decor Tray
    'Wooden Decor Tray|Oak': '',
    // Textured Throw Cushion
    'Textured Throw Cushion|Cream': '',
    // Warm Glow Table Lamp
    'Warm Glow Table Lamp|Brass': '',
    // Framed Art Print
    'Framed Art Print|Black Frame': '',
    // Handcrafted Ceramic Bowl
    'Handcrafted Ceramic Bowl|Cream': '',
    // Natural Greenery Accent
    'Natural Greenery Accent|Fresh Green': '',
};

/* Or drop your real photos in an "images" folder next to this file, named
   product-name-color.jpg (also .png / .webp), e.g. images/minimalist-ceramic-vase-terracotta.jpg
   See IMAGES-NEEDED.txt for the full list. They are picked up automatically. */
const FOUND = {};
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function probeImages() {
    PRODUCTS.forEach(p => p.colors.forEach(c => {
        ['jpg', 'png', 'webp'].forEach(ext => {
            const path = `images/${slug(p.name)}-${slug(c[0])}.${ext}`, im = new Image(), key = p.name + '|' + c[0];
            im.onload = () => {
                if (FOUND[key]) return;
                FOUND[key] = path;
                clearTimeout(probeImages.t);
                probeImages.t = setTimeout(renderProducts, 60);
            };
            im.src = path;
        });
    }));
}

function colorImg(p, k) {
    const c = p.colors[k];
    if (PHOTOS[p.name + '|' + c[0]]) return PHOTOS[p.name + '|' + c[0]];
    if (c[2]) return c[2];
    if (FOUND[p.name + '|' + c[0]]) return FOUND[p.name + '|' + c[0]];
    if (k === 0) return p.img;
    return svgArt(p.kind, c[1]);
}

function svgArt(kind, c) {
    const S = (t, a) => `<${t} ${a} fill="${c}"/><${t} ${a} fill="url(#s)"/>`;
    let g = '';
    if (kind === 'vase') g = S('path', 'd="M175 110h50c0 35-8 45 22 80 28 33 30 75 12 112-9 22-28 34-59 34s-50-12-59-34c-18-37-16-79 12-112 30-35 22-45 22-80z"');
    if (kind === 'candle') g = S('rect', 'x="140" y="180" width="120" height="130" rx="16"') + '<ellipse cx="200" cy="182" rx="60" ry="9" fill="#fff" opacity=".35"/><path d="M200 150v30" stroke="#4a4038" stroke-width="3"/><path d="M200 112c15 20 15 36 0 42-15-6-15-22 0-42z" fill="#f6b53f"/>';
    if (kind === 'tray') g = S('rect', 'x="55" y="245" width="290" height="48" rx="14"') + '<rect x="78" y="253" width="244" height="20" rx="8" fill="#000" opacity=".18"/>';
    if (kind === 'cushion') g = S('path', 'd="M105 130q95-28 190 0 22 70 0 140-95 28-190 0-22-70 0-140z"') + '<circle cx="200" cy="200" r="7" fill="#000" opacity=".25"/><path d="M200 200L125 150M200 200l75-50M200 200l-75 50M200 200l75 50" stroke="#000" stroke-opacity=".12" stroke-width="3"/>';
    if (kind === 'lamp') g = S('rect', 'x="190" y="200" width="20" height="95"') + S('ellipse', 'cx="200" cy="302" rx="58" ry="15"') + '<path d="M138 205l32-100h60l32 100z" fill="#f1ead9"/><path d="M138 205l32-100h60l32 100z" fill="url(#s)"/>';
    if (kind === 'frame') g = S('rect', 'x="92" y="75" width="216" height="255" rx="4"') + '<rect x="114" y="97" width="172" height="211" fill="#f7f2ea"/><circle cx="200" cy="185" r="42" fill="#c98f6b" opacity=".9"/><path d="M114 265q43-50 86-10t86-10v63H114z" fill="#8a9a7b"/>';
    if (kind === 'bowl') g = S('path', 'd="M85 190h230c0 75-48 120-115 120S85 265 85 190z"') + '<ellipse cx="200" cy="190" rx="115" ry="16" fill="#000" opacity=".22"/>';
    if (kind === 'plant') g = '<path d="M150 250h100l-12 72h-76z" fill="#d8c4a8"/>' + [-55, -28, 0, 28, 55].map(a => S('ellipse', `cx="200" cy="170" rx="20" ry="78" transform="rotate(${a} 200 250)"`)).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe6da"/><stop offset="1" stop-color="#d6c7b6"/></linearGradient></defs><rect width="400" height="400" fill="url(#b)"/><ellipse cx="200" cy="328" rx="115" ry="12" fill="#000" opacity=".13"/>${g}</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ---------- SCROLL REVEAL FOR PRODUCT CARDS ---------- */
const REV = new Set();
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); REV.add(+e.target.dataset.i); io.unobserve(e.target); }
}), { threshold: .12 }) : null;
function observeCards() {
    document.querySelectorAll('.product.reveal:not(.in)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
}

let cur = null;
const peso = n => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });

function renderProducts() {
    $('productsGrid').innerHTML = PRODUCTS.map((p, i) => activeCat !== 'All' && p.cat !== activeCat ? '' : `
    <article class="product reveal ${REV.has(i) ? 'in' : ''}" data-i="${i}" style="transition-delay:${(i % 4) * 80}ms" onclick="openProduct(${i})">
        <div class="pimg"><img src="${colorImg(p, 0)}" alt="${p.name}"><span class="badge">${p.cat}</span></div>
        <div class="product-info">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            ${p.colors.length > 1 ? `<div class="dots" onmouseleave="swapCard(this,${i},0)">${p.colors.map((c, k) => `<i style="background:${c[1]}" title="${c[0]}" onmouseenter="swapCard(this,${i},${k})"></i>`).join('')}</div>` : ''}
            <div class="price-row"><span class="price">${peso(p.price)}</span><button class="add">Choose Options</button></div>
        </div>
    </article>`).join('');
    observeCards();
}

function swapCard(el, i, k) { el.closest('.product').querySelector('.pimg img').src = colorImg(PRODUCTS[i], k); }

/* ---------- PRODUCT POPUP (color, quantity, add-ons, add to cart) ---------- */
function openProduct(i) {
    const p = PRODUCTS[i];
    cur = { p: p, color: 0, qty: 1, ex: p.extras.map(() => ({ on: false, color: 0 })) };
    $('productModal').hidden = false;
    drawProduct();
}
function closeProduct() { $('productModal').hidden = true; }
function setColor(k) { cur.color = k; drawProduct(); }
function setQty(d) { cur.qty = Math.max(1, Math.min(20, cur.qty + d)); drawProduct(); }
function toggleExtra(j) { cur.ex[j].on = !cur.ex[j].on; drawProduct(); }
function setExtraColor(j, v) { cur.ex[j].color = +v; drawProduct(); }

function drawProduct() {
    const { p, color, qty, ex } = cur;
    let total = p.price * qty;
    p.extras.forEach((e, j) => { if (ex[j].on) total += e.p; });
    $('pmBody').innerHTML = `
    <div class="pm-img">
        <div class="tint"><img src="${color === 0 && !p.colors[0][2] && !FOUND[p.name + '|' + p.colors[0][0]] && !PHOTOS[p.name + '|' + p.colors[0][0]] ? p.img.replace('w=700', 'w=1000') : colorImg(p, color)}" alt="${p.name} in ${p.colors[color][0]}"></div>
        ${p.colors.length > 1 ? `<div class="thumbs">${p.colors.map((c, k) => `<button class="${k === color ? 'on' : ''}" title="${c[0]}" onclick="setColor(${k})"><img src="${colorImg(p, k)}" alt="${c[0]}"></button>`).join('')}</div>` : ''}
    </div>
    <div class="pm-info">
        <div class="eyebrow">${p.cat}</div>
        <h2>${p.name}</h2>
        <p class="pm-desc">${p.desc}</p>
        <div class="pm-price">${peso(p.price)}</div>
        <div class="pm-label">Color: <b>${p.colors[color][0]}</b></div>
        ${p.colors.length > 1 ? `<div class="swatches">${p.colors.map((c, k) => `<button class="sw ${k === color ? 'on' : ''}" style="background:${c[1]}" title="${c[0]}" onclick="setColor(${k})"></button>`).join('')}</div>` : ''}
        <div class="pm-label">Quantity</div>
        <div class="qty"><button onclick="setQty(-1)">−</button><span>${qty}</span><button onclick="setQty(1)">+</button></div>
        <div class="pm-label">Complete your set <small>(optional add-ons)</small></div>
        ${p.extras.map((e, j) => `
        <div class="extra ${ex[j].on ? 'on' : ''}">
            <label><input type="checkbox" ${ex[j].on ? 'checked' : ''} onchange="toggleExtra(${j})"><span class="ename">${e.i} ${e.n}</span><span class="eprice">+${peso(e.p)}</span></label>
            ${ex[j].on ? `<div class="ecolor">Color: ${e.c.length > 1
                ? `<select onchange="setExtraColor(${j}, this.value)">${e.c.map((c, k) => `<option value="${k}" ${k === ex[j].color ? 'selected' : ''}>${c[0]}</option>`).join('')}</select>`
                : `<b>${e.c[0][0]}</b>`}</div>` : ''}
        </div>`).join('')}
        <button class="btn pm-add" onclick="addConfigured()">Add to Cart · ${peso(total)}</button>
    </div>`;
}

function addConfigured() {
    const { p, color, qty, ex } = cur;
    const c = p.colors[color];
    addLine({ key: p.name + '|' + c[0], name: p.name, opt: c[0], hex: c[1], img: colorImg(p, color), price: p.price, qty: qty });
    p.extras.forEach((e, j) => {
        if (!ex[j].on) return;
        const ec = e.c[ex[j].color];
        addLine({ key: e.n + '|' + ec[0], name: e.n, opt: ec[0], hex: ec[1], icon: e.i, price: e.p, qty: 1 });
    });
    renderCart();
    closeProduct();
    showToast(p.name + ' (' + c[0] + ') added to cart');
}

/* ---------- KEYBOARD SHORTCUTS & STARTUP ---------- */
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAuth(); closeProduct(); closeCart(); closeCheckout(); } });

/* ---------- scroll effects: sticky nav, back-to-top ring, count-up ---------- */
function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    document.querySelector('nav').classList.toggle('scrolled', y > 60);
    $('toTop').classList.toggle('show', y > 400);
    $('toTopRing').style.strokeDashoffset = 125.66 * (1 - (max > 0 ? y / max : 0));
}
addEventListener('scroll', onScroll, { passive: true });

function countUp(el) {
    const end = +el.dataset.count, dec = +el.dataset.dec || 0, suf = el.dataset.suffix || '', t0 = performance.now();
    (function tick(now) {
        const k = Math.min(1, (now - t0) / 1600), v = end * (1 - Math.pow(1 - k, 3));
        el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
        if (k < 1) requestAnimationFrame(tick);
    })(t0);
}
const statsIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.querySelectorAll('[data-count]').forEach(countUp); statsIO.unobserve(e.target); }
}), { threshold: .4 }) : null;
const statsEl = document.querySelector('.stats');
if (statsIO) statsIO.observe(statsEl); else statsEl.querySelectorAll('[data-count]').forEach(el => el.textContent = el.dataset.count + (el.dataset.suffix || ''));
document.querySelectorAll('.reveal:not(.product)').forEach(el => io ? io.observe(el) : el.classList.add('in'));
onScroll();

function endIntro() { const el = $('intro'); if (!el || el.classList.contains('out')) return; el.classList.add('out'); setTimeout(() => el.remove(), 900); }
try { if (sessionStorage.getItem('hh_intro')) $('intro').remove(); else { sessionStorage.setItem('hh_intro', '1'); setTimeout(endIntro, 2800); } } catch (e) { setTimeout(endIntro, 2800); }

drawFilters();
renderProducts();
probeImages();
ensureDemoAccount();
updateAuthUI();

/* ==============================================================
 * SOUND  -  warm "feels like home" ambience and sound effects
 * Built live with the browser's Web Audio, so there are no audio files to upload.
 *   ambience : slowly breathing room tone with very soft, occasional fire pops
 *   welcome  : doorbell "ding-dong" + soft chord when the site first opens
 *   tap      : soft wooden knock on buttons and links
 *   add      : two-note glass chime when something goes in the cart
 *   success  : cozy rising chime + chord when an order is placed
 * EDIT HERE: change SOUND_VOLUME (0 = silent, 1 = loud) or the notes in S below.
 * ============================================================== */
const SOUND_VOLUME = 0.42;

const SFX = (() => {
    let ctx, master, noise, ambienceNoise, ambienceSource, ambienceGain, ambienceLfo, ambienceLfoGain, crackleTimer, on = true;
    try { on = localStorage.getItem('hh_sound') !== 'off'; } catch (e) {}

    function init() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = SOUND_VOLUME;
        const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 3200;   // rounds off harsh highs
        const comp = ctx.createDynamicsCompressor();
        master.connect(warm); warm.connect(comp); comp.connect(ctx.destination);
        // a little "room" echo so everything sounds like it is inside a home
        const len = Math.floor(ctx.sampleRate * 1.8), buf = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
        const room = ctx.createConvolver(); room.buffer = buf;
        const wet = ctx.createGain(); wet.gain.value = 0.3;
        master.connect(room); room.connect(wet); wet.connect(warm);
        // short noise burst used for the wooden knock
        const nl = Math.floor(ctx.sampleRate * 0.1);
        noise = ctx.createBuffer(1, nl, ctx.sampleRate);
        const nd = noise.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
        const al = Math.floor(ctx.sampleRate * 5);
        ambienceNoise = ctx.createBuffer(1, al, ctx.sampleRate);
        const ad = ambienceNoise.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < al; i++) {
            brown = (brown + .02 * (Math.random() * 2 - 1)) / 1.02;
            ad[i] = brown * 3.5;
        }
        return ctx;
    }

    function scheduleCrackle() {
        if (!on || !ambienceSource) return;
        crackleTimer = setTimeout(() => {
            crackleTimer = null;
            if (!on || !ambienceSource || ctx.state !== 'running') return;
            const t = ctx.currentTime, source = ctx.createBufferSource();
            const filter = ctx.createBiquadFilter(), gain = ctx.createGain();
            source.buffer = noise; source.playbackRate.value = .7 + Math.random() * .8;
            filter.type = 'bandpass'; filter.frequency.value = 1200 + Math.random() * 1000; filter.Q.value = .8;
            gain.gain.setValueAtTime(.0001, t);
            gain.gain.exponentialRampToValueAtTime(.018, t + .012);
            gain.gain.exponentialRampToValueAtTime(.0001, t + .09);
            source.connect(filter); filter.connect(gain); gain.connect(master);
            source.start(t); source.stop(t + .1);
            scheduleCrackle();
        }, 4000 + Math.random() * 6000);
    }

    function startAmbience() {
        if (!on || !ctx || ctx.state !== 'running' || ambienceSource) return;
        const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
        const lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
        source.buffer = ambienceNoise; source.loop = true;
        filter.type = 'lowpass'; filter.frequency.value = 360;
        gain.gain.setValueAtTime(.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.13, ctx.currentTime + 4);
        lfo.type = 'sine'; lfo.frequency.value = .05; lfoGain.gain.value = .012;
        lfo.connect(lfoGain); lfoGain.connect(gain.gain);
        source.connect(filter); filter.connect(gain); gain.connect(master);
        source.start(); lfo.start(ctx.currentTime + 4);
        ambienceSource = source; ambienceGain = gain; ambienceLfo = lfo; ambienceLfoGain = lfoGain;
        scheduleCrackle();
    }

    function stopAmbience() {
        if (crackleTimer) { clearTimeout(crackleTimer); crackleTimer = null; }
        if (!ambienceSource) return;
        const source = ambienceSource, gain = ambienceGain, lfo = ambienceLfo, lfoGain = ambienceLfoGain, now = ctx.currentTime;
        ambienceSource = null; ambienceGain = null; ambienceLfo = null; ambienceLfoGain = null;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setTargetAtTime(.0001, now, .12);
        lfoGain.gain.setTargetAtTime(.0001, now, .12);
        source.stop(now + .5);
        lfo.stop(now + .5);
    }

    function unlock() {
        try {
            if (!init()) return;
            if (ctx.state === 'running') { startAmbience(); return; }
            ctx.resume().then(startAmbience).catch(e => console.warn('Could not enable sound effects:', e));
        } catch (e) { console.warn('Could not enable sound effects:', e); }
    }

    // soft bell: a pure tone plus two gentle overtones that fade away
    function bell(f, at, vol, dur) {
        const t = ctx.currentTime + at;
        [[1, 1], [2, .28], [3.01, .09]].forEach(([m, g]) => {
            const o = ctx.createOscillator(), a = ctx.createGain();
            o.type = 'sine'; o.frequency.value = f * m;
            a.gain.setValueAtTime(0.0001, t);
            a.gain.exponentialRampToValueAtTime(vol * g, t + .01);
            a.gain.exponentialRampToValueAtTime(0.0001, t + dur / Math.sqrt(m));
            o.connect(a); a.connect(master); o.start(t); o.stop(t + dur + .1);
        });
    }

    // warm chord that swells in slowly
    function pad(freqs, at, dur, vol) {
        const t = ctx.currentTime + at, lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 800; lp.connect(master);
        freqs.forEach((f, i) => {
            const o = ctx.createOscillator(), a = ctx.createGain();
            o.type = 'triangle'; o.frequency.value = f; o.detune.value = (i - 1) * 6;
            a.gain.setValueAtTime(0.0001, t);
            a.gain.exponentialRampToValueAtTime(vol, t + dur * .35);
            a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(a); a.connect(lp); o.start(t); o.stop(t + dur + .1);
        });
    }

    // soft wooden knock
    function tap(at, f, vol) {
        const t = ctx.currentTime + at;
        const o = ctx.createOscillator(), a = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(f * 1.7, t); o.frequency.exponentialRampToValueAtTime(f, t + .06);
        a.gain.setValueAtTime(vol, t); a.gain.exponentialRampToValueAtTime(0.0001, t + .16);
        o.connect(a); a.connect(master); o.start(t); o.stop(t + .2);
        const n = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
        n.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 1.2;
        ng.gain.setValueAtTime(vol * .6, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + .04);
        n.connect(bp); bp.connect(ng); ng.connect(master); n.start(t); n.stop(t + .1);
    }

    // EDIT HERE: the sounds (frequencies are notes: 523.25 = C5, 659.25 = E5, 783.99 = G5, 1046.5 = C6)
    const S = {
        tap:     () => tap(0, 200, .16),
        pick:    () => tap(0, 330, .10),
        open:    () => { tap(0, 170, .16); bell(880, .04, .05, .6); },
        door:    () => { bell(659.25, 0, .22, 1.8); bell(523.25, .5, .22, 2.6); },
        welcome: () => { S.door(); pad([261.63, 329.63, 392], .5, 3.4, .06); bell(1046.5, 1.4, .07, 2); },
        add:     () => { tap(0, 220, .12); bell(783.99, .02, .16, 1.2); bell(1046.5, .11, .13, 1.4); },
        remove:  () => { tap(0, 140, .16); bell(392, .05, .07, .7); },
        bye:     () => { bell(523.25, 0, .15, 1.2); bell(392, .28, .13, 1.8); },
        success: () => {
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(f, i * .12, .17, 1.8));
            pad([261.63, 329.63, 392, 493.88], .3, 3.2, .06);
        }
    };

    return {
        play(name) {
            if (!on || !S[name]) return;
            try {
                if (!init()) {
                    console.warn('Sound effects are unavailable because Web Audio is not supported.');
                    return;
                }
                if (ctx.state === 'running') { startAmbience(); S[name](); return; }
                ctx.resume().then(() => {
                    if (on && ctx.state === 'running') { startAmbience(); S[name](); }
                }).catch(e => console.warn('Could not start sound effects:', e));
            } catch (e) { console.warn('Could not play sound effect:', e); }
        },
        unlock,
        running() { return !!ctx && ctx.state === 'running'; },
        isOn() { return on; },
        set(v) {
            on = v;
            try { localStorage.setItem('hh_sound', v ? 'on' : 'off'); } catch (e) {}
            if (v) unlock(); else stopAmbience();
        }
    };
})();

/* ---------- sound on / off button ---------- */
function syncSoundBtn() {
    const b = $('soundBtn'), on = SFX.isOn();
    b.classList.toggle('off', !on);
    b.setAttribute('aria-pressed', on);
    b.setAttribute('aria-label', on ? 'Ambient sound and effects on. Click to mute' : 'Ambient sound and effects off. Click to turn on');
    b.title = on ? 'Ambient sound and effects on / off' : 'Ambient sound and effects off / on';
}
$('soundBtn').addEventListener('click', () => {
    const v = !SFX.isOn();
    SFX.set(v); syncSoundBtn();
    if (v) SFX.play('add');
    showToast(v ? 'Sound on 🔔' : 'Sound off');
});
syncSoundBtn();

/* ---------- welcome chime: plays once per visit with the intro ----------
   Browsers block sound until the visitor clicks or presses a key, so if sound is
   not allowed yet, the welcome plays on the very first click, tap or key press. */
const introShown = !!$('intro');
let welcomed = false, skipNextTap = false;
function welcome() { if (!introShown || welcomed) return false; welcomed = true; SFX.play('welcome'); return true; }
function firstGesture() {
    removeEventListener('pointerdown', firstGesture, true);
    removeEventListener('keydown', firstGesture, true);
    SFX.unlock();
    if (welcome()) { skipNextTap = true; setTimeout(() => skipNextTap = false, 500); }
}
addEventListener('pointerdown', firstGesture, true);
addEventListener('keydown', firstGesture, true);
if (introShown) setTimeout(() => { SFX.unlock(); if (SFX.running()) welcome(); }, 350);

/* ---------- connect the sounds to what the shopper does ---------- */
const _toast = showToast;
showToast = function (msg) {
    _toast(msg);
    if (/^Welcome/.test(msg)) SFX.play('door');
    else if (/logged out/.test(msg)) SFX.play('bye');
    else if (/added to cart|subscribing/.test(msg)) SFX.play('add');
};
const _removeItem = removeItem;
removeItem = function (key) { _removeItem(key); SFX.play('remove'); };
const _placeOrder = placeOrder;
placeOrder = function (e) { _placeOrder(e); SFX.play('success'); };

document.addEventListener('click', e => {
    if (skipNextTap) { skipNextTap = false; return; }
    const t = e.target;
    if (t.closest('#soundBtn, .pm-add, #placeBtn, #authSubmit, .news button, .ci-rm, .intro')) return;
    if (t.closest('.product')) SFX.play('open');
    else if (t.closest('.fbtn, .sw, .thumbs button, .tabs button, .qty button, .extra input, .pay input')) SFX.play('pick');
    else if (t.closest('.cart-panel, #navCart, .btn, nav a, .close, .to-top, .drawer-bg')) SFX.play('tap');
});