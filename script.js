let CONFIG, PRODUCTS, SIZES, CUSTOM;


const $ = s => document.querySelector(s), app = $("#app");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pkr = n => "Rs. " + Math.round(n).toLocaleString("en-PK");
const unit = (p, m) => Math.round(p.price * m / 50) * 50;
const get = id => PRODUCTS.find(p => p.id === id);
let cart = []; try { cart = JSON.parse(localStorage.getItem("jcb-cart") || "[]"); } catch (e) {}
const save = () => { try { localStorage.setItem("jcb-cart", JSON.stringify(cart)); } catch (e) {} $("#count").textContent = cart.reduce((n, i) => n + i.q, 0); };
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 2200); }
const img = p => `<div class="im"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=ph>${p.e}</div>'"></div>`;
const card = p => `<a class="card pc" href="#/cake/${p.id}">${img(p)}<div class="t"><h3>${p.name}</h3><p>${p.desc}</p><b>${p.fondant ? "From " : ""}${pkr(p.price)}</b></div></a>`;
const opts = (arr, sel) => arr.map(o => `<option${o == sel ? " selected" : ""}>${o}</option>`).join("");
const TBC = v => v ? esc(v) : "<em>To be confirmed</em>";

/* ---------- pages ---------- */
const pages = {
  home() {
    const plain = PRODUCTS.filter(p => !p.fondant), fond = PRODUCTS.filter(p => p.fondant);
    return `<section class="hero"><div><h1>Sweet Moments <em>Start Here</em></h1><p>Delicious cakes, freshly baked with love and customized for every occasion.</p><a class="btn" href="#/shop">Explore Our Cakes →</a></div>${img({img:"images/hero-chocolate.jpg",name:"Chocolate drip cake",e:"🎂"})}</section>
    <section class="s"><h2>Our Cake Collection</h2><p class="note">Choose from our range of cakes, made with fresh ingredients.</p><div class="grid">${plain.map(card).join("")}</div></section>
    <section class="s custom"><div><h2>Custom Cakes</h2><p class="note">Birthday, wedding, anniversary and themed fondant cakes. Prices are confirmed by the bakery.</p><a class="btn" href="#/custom">Order Custom Cake →</a></div><div class="grid">${fond.map(card).join("")}</div></section>
    <section class="s"><h2>Why Choose Us?</h2><div class="why">${[["Fresh ingredients","Baked fresh for every order."],["Custom orders","Tell us the occasion and we design around it."],["Quality","Careful baking, from sponge to finish."],["Made with care","Every cake is decorated by hand."]].map(x => `<div class="card"><h3>${x[0]}</h3><p class="note">${x[1]}</p></div>`).join("")}</div></section>
    <section class="s"><h2>What Customers Say</h2><div class="rev">${[1,2,3].map(() => `<blockquote class="card">“Replace this with a real customer review.” <p class="note">Sample review. Replace before launch.</p></blockquote>`).join("")}</div></section>
    <section class="s cta"><h2>Planning a celebration?</h2><p>Tell us about the occasion and we'll help you pick the right cake.</p><a class="btn" href="#/contact">Contact us to order</a></section>`;
  },
  shop(q) {
    const p = new URLSearchParams(q), s = (p.get("q") || "").toLowerCase(), f = p.get("flavor") || "", c = p.get("cat") || "";
    const list = PRODUCTS.filter(x => (!s || (x.name + x.desc + x.flavor).toLowerCase().includes(s)) && (!f || x.flavor === f) && (!c || x.cat === c));
    return `<h1>Shop All Cakes</h1><form class="card filters" id="ff" role="search"><div><label for="fq">Search</label><input id="fq" value="${esc(p.get("q") || "")}"></div><div><label for="fc">Category</label><select id="fc"><option value="">All</option>${[["classic","Classic"],["fruit","Fruit"],["cheesecake","Cheesecake"],["fondant","Custom fondant"]].map(o => `<option value="${o[0]}"${o[0] === c ? " selected" : ""}>${o[1]}</option>`).join("")}</select></div><div><label for="ffl">Flavor</label><select id="ffl"><option value="">All</option>${opts(["Chocolate","Vanilla","Mango","Pineapple","Lemon"], f)}</select></div><button class="btn">Apply</button><a href="#/shop">Clear</a></form>
    ${list.length ? `<div class="grid">${list.map(card).join("")}</div>` : `<div class="card box"><p>No cakes match your search.</p><a class="btn" href="#/shop">Show all cakes</a></div>`}`;
  },
  cake(id) {
    const p = get(id); if (!p) return pages.nf();
    return `<div class="detail">${img(p)}<div><h1>${p.name}</h1><p>${p.desc}</p>${p.fondant ? '<p class="warn">Fondant designs are custom. Price and availability are confirmed by the bakery before your order is final.</p>' : ""}
    <div class="f"><label>Size<select id="sz">${SIZES.map((z, i) => `<option value="${i}">${z.l} (serves ${z.s}) – ${pkr(unit(p, z.m))}</option>`).join("")}</select></label>
    ${p.eggless ? '<label><input type="checkbox" id="eg" style="width:auto"> Make it eggless</label>' : '<p class="note">Eggless not available.</p>'}
    <label>Message on cake (optional)<input id="msg" maxlength="60" placeholder="Happy Birthday Jiya"></label>
    <div><span class="qty"><button type="button" data-a="dq" aria-label="Decrease">−</button><span id="q">1</span><button type="button" data-a="iq" aria-label="Increase">+</button></span> <b id="tot" style="font-size:1.3rem;margin-left:12px"></b></div>
    <button class="btn" data-a="add" data-id="${p.id}">Add to Cart</button></div></div></div>
    <section class="s"><h2>You may also like</h2><div class="grid">${PRODUCTS.filter(x => x.id !== id && x.cat === p.cat || (x.id !== id && p.cat === "fondant" && x.fondant)).slice(0, 4).map(card).join("") || PRODUCTS.filter(x => x.id !== id).slice(0, 4).map(card).join("")}</div></section>`;
  },
  cart() {
    if (!cart.length) return `<div class="card box"><h1>Your cart is empty</h1><a class="btn" href="#/shop">Browse cakes</a></div>`;
    const sub = cart.reduce((n, i) => n + i.u * i.q, 0);
    return `<div class="two"><div><h1>Shopping Cart</h1>${cart.map((i, k) => { const p = get(i.id); return `<div class="card row">${img(p)}<div style="flex:1"><b>${p.name}</b><br><span class="note">${i.size}${i.eg ? " · Eggless" : ""}${i.msg ? ` · “${esc(i.msg)}”` : ""}</span><br><span class="qty"><button data-a="cq" data-k="${k}" data-d="-1" aria-label="Decrease">−</button>${i.q}<button data-a="cq" data-k="${k}" data-d="1" aria-label="Increase">+</button></span> <a href="#/cart" data-a="rm" data-k="${k}">Remove</a></div><div style="text-align:right">${pkr(i.u)} each<br><b>${pkr(i.u * i.q)}</b></div></div>`; }).join("")}</div>
    <aside class="card box" style="height:fit-content"><h2>Order summary</h2><p>Subtotal <b style="float:right">${pkr(sub)}</b></p><p class="note">Delivery fee is confirmed by the bakery.</p><a class="btn" href="#/checkout">Proceed to checkout</a> <a class="btn o" href="#/shop" style="margin-top:8px">Continue shopping</a></aside></div>`;
  },
  checkout() {
    if (!cart.length) return pages.cart();
    return `<form id="co" class="card box" novalidate style="max-width:700px"><h1>Checkout</h1><div class="f">
    <label>Full name<input id="n" autocomplete="name"><span class="err" id="e-n"></span></label>
    <div class="grid2"><label>Phone number<input id="p" type="tel" autocomplete="tel"><span class="err" id="e-p"></span></label><label>Email (optional)<input id="em" type="email"></label></div>
    <label>Delivery or pickup<select id="ful"><option>Delivery</option><option>Pickup</option></select></label>
    <label id="al">Delivery address<textarea id="a" rows="2"></textarea><span class="err" id="e-a"></span></label>
    <label>Preferred date and time<input id="w" type="datetime-local"><span class="err" id="e-w"></span></label>
    <p class="note">${CONFIG.leadTime ? esc(CONFIG.leadTime) : "Lead time to be confirmed by the bakery."}</p>
    <label>Order notes<textarea id="o" rows="2"></textarea></label>
    <label>Payment method<select id="pm"><option>Cash on Delivery</option><option>Pay on Pickup</option></select></label>
    <p class="warn">Your order is saved by the bakery and confirmed with you by phone. No online payment is taken.</p>
    <button class="btn">Place order</button></div></form>`;
  },
  custom() {
    const C = CUSTOM, fl = Object.keys(C.perServing);
    const s = (id, l, a) => `<label>${l}<select id="${id}">${opts(a)}</select></label>`;
    return `<h1>Customize Your Cake</h1><p class="note">The price shown is an estimate only. Custom cake prices and availability may require confirmation before your order is finalized.</p>
    <div class="two"><form id="cf" class="card box" novalidate><div class="grid2">${s("c-fl","Cake flavor",fl)}${s("c-sv","Servings",C.servings)}${s("c-t","Tiers",[1,2,3])}${s("c-sh","Cake shape",Object.keys(C.shape))}${s("c-fr","Frosting",Object.keys(C.frosting))}${s("c-fi","Filling",Object.keys(C.filling))}${s("c-d","Decoration",Object.keys(C.deco))}${s("c-th","Theme",C.themes)}</div><div class="f">
    <label>Text on the cake<input id="c-tx" maxlength="60"></label><label>Preferred date and time<input id="c-w" type="datetime-local"><span class="err" id="e-cw"></span></label>
    <label>Budget range<input id="c-b" placeholder="e.g. Rs. 5,000 – 10,000"></label><label>Special instructions<textarea id="c-i" rows="3"></textarea></label>
    <label>Your name<input id="c-n"><span class="err" id="e-cn"></span></label><label>Phone<input id="c-p" type="tel"><span class="err" id="e-cp"></span></label>
    <p class="note">Describe your design in the instructions. You can share reference photos with the bakery after you submit.</p><button class="btn">Request Custom Cake</button></div></form>
    <aside class="card box" id="sum" style="height:fit-content" aria-live="polite"></aside></div>`;
  },
  about() { return `<div style="max-width:640px"><h1>About Jiya Cake and Bake</h1><p>We bake fresh cakes for birthdays, weddings, anniversaries and everyday celebrations, including custom fondant cakes.</p><p class="warn">Owner's note: replace this text with your bakery's real story in script.js.</p><a class="btn" href="#/shop">Explore our cakes</a></div>`; },
  contact() {
    const wa = CONFIG.whatsapp ? `<a class="btn" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.whatsapp}">Chat on WhatsApp</a>` : '<p class="note">WhatsApp number not added yet (edit CONFIG in script.js).</p>';
    return `<div style="max-width:640px"><h1>Contact Us</h1><div class="card box"><p>Phone: ${TBC(CONFIG.phone)}</p><p>Address: ${TBC(CONFIG.address)}</p><p>Opening hours: ${TBC(CONFIG.hours)}</p>${wa}</div>
    <form id="mf" class="card box f" novalidate style="margin-top:16px"><h2>Send us a message</h2><label>Name<input id="m-n"></label><label>Phone or email<input id="m-c"></label><label>Message<textarea id="m-m" rows="4"></textarea></label><button class="btn">Send message</button></form></div>`;
  },
  done() { let d = {}; try { d = JSON.parse(sessionStorage.getItem("jcb-done") || "{}"); } catch (e) {} if (!d.ref) return pages.nf();
    return `<div class="card box" style="max-width:640px"><h1>Thank you!</h1><p>Your ${d.kind === "order" ? "order" : "custom cake request"} has been saved. Reference: <b>${esc(d.ref)}</b></p>${d.total ? `<p>Total: <b>${pkr(d.total)}</b></p>` : ""}${d.estimate ? `<p>Estimated price: <b>${pkr(d.estimate)}</b> (the bakery will confirm the final price and availability)</p>` : ""}<p class="note">Status: pending. The bakery will contact you to confirm.</p><a class="btn" href="#/shop">Keep shopping</a></div>`; },
  nf() { return `<div class="card box" style="text-align:center"><p class="script" style="font:400 3.5rem 'Great Vibes';margin:0;color:var(--rose)">Oops!</p><h1>This page has crumbled</h1><a class="btn" href="#/shop">Browse our cakes</a></div>`; }
};

/* ---------- router ---------- */
function route() {
  const [path, q = ""] = (location.hash.slice(1) || "/").split("?"), seg = path.split("/").filter(Boolean);
  const name = seg[0] || "home";
  app.innerHTML = name === "shop" ? pages.shop(q) : name === "cake" ? pages.cake(seg[1]) : (pages[name] && name !== "nf" ? pages[name]() : pages.nf());
  document.title = (name === "home" ? "" : name[0].toUpperCase() + name.slice(1) + " | ") + "Jiya Cake and Bake";
  document.querySelectorAll(".top nav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#/" + (name === "home" ? "" : name)));
  scrollTo(0, 0);
  if (name === "cake") updPrice();
  if (name === "custom") { updSum(); $("#cf").oninput = updSum; $("#cf").onsubmit = submitCustom; }
  if (name === "checkout") { $("#co").onsubmit = submitOrder; $("#ful").onchange = e => { $("#al").style.display = e.target.value === "Delivery" ? "" : "none"; }; }
  if (name === "contact") $("#mf").onsubmit = async e => { e.preventDefault(); try { await post("/api/contact", { name: $("#m-n").value, contact: $("#m-c").value, message: $("#m-m").value }); toast("Message sent. Thank you!"); e.target.reset(); } catch (x) { toast(x.error || "Could not send. Please try again."); } };
  if (name === "shop") $("#ff").onsubmit = e => { e.preventDefault(); location.hash = "#/shop?" + new URLSearchParams({ q: $("#fq").value, cat: $("#fc").value, flavor: $("#ffl").value }); };
}
addEventListener("hashchange", route);
$("#hsearch").onsubmit = e => { e.preventDefault(); location.hash = "#/shop?q=" + encodeURIComponent($("#hq").value); };

/* ---------- product page + cart actions ---------- */
let qty = 1;
function updPrice() { qty = 1; const id = location.hash.split("/")[2], p = get(id), z = SIZES[$("#sz").value]; $("#tot").textContent = pkr(unit(p, z.m) * qty); $("#sz").onchange = updPrice; }
document.addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a;
  if (a === "iq" || a === "dq") { qty = Math.max(1, Math.min(20, qty + (a === "iq" ? 1 : -1))); $("#q").textContent = qty; const p = get(location.hash.split("/")[2]); $("#tot").textContent = pkr(unit(p, SIZES[$("#sz").value].m) * qty); }
  if (a === "add") { const p = get(b.dataset.id), z = SIZES[$("#sz").value], eg = $("#eg") ? $("#eg").checked : false, msg = $("#msg").value.trim();
    const ex = cart.find(i => i.id === p.id && i.size === z.l && i.eg === eg && i.msg === msg);
    ex ? ex.q = Math.min(20, ex.q + qty) : cart.push({ id: p.id, size: z.l, u: unit(p, z.m), q: qty, eg, msg }); save(); toast(p.name + " added to cart"); }
  if (a === "cq") { const i = cart[b.dataset.k]; i.q = Math.max(1, Math.min(20, i.q + +b.dataset.d)); save(); route(); }
  if (a === "rm") { e.preventDefault(); cart.splice(b.dataset.k, 1); save(); toast("Item removed"); route(); }
  if (a === "copy") { $("#mt").select(); try { navigator.clipboard.writeText($("#mt").value); } catch (x) { document.execCommand("copy"); } toast("Message copied"); }
});

/* ---------- checkout / custom: saved on the server ---------- */
async function post(url, body) { const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); if (!r.ok) throw d; return d; }
function bad(id, msg) { $("#" + id).textContent = msg; return 1; }
let idem = crypto.randomUUID();
async function submitOrder(e) {
  e.preventDefault(); document.querySelectorAll(".err").forEach(x => x.textContent = ""); let er = 0;
  const v = id => $("#" + id).value.trim(), del = v("ful") === "Delivery", w = new Date(v("w"));
  if (v("n").length < 2) er = bad("e-n", "Enter your name");
  if (!/^\+?[\d\s-]{7,18}$/.test(v("p"))) er = bad("e-p", "Enter a valid phone number");
  if (del && v("a").length < 8) er = bad("e-a", "Enter your delivery address");
  if (!v("w") || isNaN(w) || w < new Date()) er = bad("e-w", "Choose a future date and time");
  if (del && v("pm") === "Pay on Pickup") { toast("Pay on Pickup is only for pickup orders"); er = 1; }
  if (er) return;
  const btn = e.target.querySelector("button"); btn.disabled = true;
  try {
    const d = await post("/api/orders", { idem, name: v("n"), phone: v("p"), email: v("em"), fulfilment: v("ful"), address: v("a"), needed: w.toISOString(), notes: v("o"), payment: v("pm"), items: cart.map(i => ({ id: i.id, size: i.size, eggless: i.eg, message: i.msg, qty: i.q })) });
    sessionStorage.setItem("jcb-done", JSON.stringify({ kind: "order", ref: d.reference, total: d.total })); cart = []; save(); idem = crypto.randomUUID(); location.hash = "#/done";
  } catch (x) { toast(x.error || "We couldn't place your order. Please try again."); btn.disabled = false; }
}
const estimate = () => { const C = CUSTOM, g = id => $("#" + id).value, sv = +g("c-sv"); let t = C.perServing[g("c-fl")] * sv * C.tiers[g("c-t")] * C.shape[g("c-sh")] + C.deco[g("c-d")] + C.frosting[g("c-fr")] + C.filling[g("c-fi")]; if (g("c-d") === "Fondant") t += C.fondantPer * sv; return Math.max(C.min, Math.round(t / 50) * 50); };
function updSum() { const g = id => $("#" + id).value; $("#sum").innerHTML = `<h2>Your selections</h2><p>${g("c-fl")} cake, ${g("c-t")} tier(s), ${g("c-sh").toLowerCase()}</p><p>Serves about ${g("c-sv")}</p><p>${g("c-fr")} frosting, ${g("c-fi").toLowerCase()} filling</p><p>${g("c-d")} · ${g("c-th")}</p><p style="font-size:1.2rem"><b>Estimate: ${pkr(estimate())}</b></p><p class="note">Estimate only. Custom cake prices and availability may require confirmation before your order is finalized.</p>`; }
async function submitCustom(e) {
  e.preventDefault(); document.querySelectorAll(".err").forEach(x => x.textContent = ""); let er = 0;
  const g = id => $("#" + id).value.trim(), w = new Date(g("c-w"));
  if (g("c-n").length < 2) er = bad("e-cn", "Enter your name");
  if (!/^\+?[\d\s-]{7,18}$/.test(g("c-p"))) er = bad("e-cp", "Enter a valid phone number");
  if (!g("c-w") || isNaN(w) || w < new Date()) er = bad("e-cw", "Choose a future date and time");
  if (er) return;
  const btn = e.target.querySelector("button"); btn.disabled = true;
  try {
    const d = await post("/api/custom", { name: g("c-n"), phone: g("c-p"), needed: w.toISOString(), flavor: g("c-fl"), servings: +g("c-sv"), tiers: +g("c-t"), shape: g("c-sh"), frosting: g("c-fr"), filling: g("c-fi"), decoration: g("c-d"), theme: g("c-th"), text: g("c-tx"), budget: g("c-b"), instructions: g("c-i") });
    sessionStorage.setItem("jcb-done", JSON.stringify({ kind: "custom", ref: d.reference, estimate: d.estimate })); location.hash = "#/done";
  } catch (x) { toast(x.error || "We couldn't send your request. Please try again."); btn.disabled = false; }
}

/* ---------- chat helper (ready-made answers, not AI) ---------- */
const CHIPS = ["Show me all cakes", "What are your cake flavors?", "Help me customize a cake", "Tell me about your prices", "Recommend a birthday cake", "How can I place an order?"];
function say(t, who, ids) {
  const d = document.createElement("div"); d.className = "m" + (who ? " u" : ""); d.textContent = t;
  (ids || []).forEach(id => { const p = get(id), a = document.createElement("a"); a.className = "mini"; a.href = "#/cake/" + p.id; a.onclick = () => $("#chat").classList.remove("open"); a.innerHTML = img(p) + `<span><b>${p.name}</b><br><small>${p.fondant ? "From " : ""}${pkr(p.price)}</small></span>`; d.appendChild(a); });
  $("#clog").appendChild(d); $("#clog").scrollTop = 1e6;
}
const hist = []; let last = null;
async function ask(t, retry) {
  t = (t || "").trim(); if (!t || ask.busy) return; ask.busy = true;
  document.querySelectorAll(".notice").forEach(n => n.remove());
  if (!retry) { say(t, 1); hist.push({ role: "user", content: t }); }
  const wait = document.createElement("div"); wait.className = "m"; wait.textContent = "● ● ●"; $("#clog").appendChild(wait);
  try {
    const d = await post("/api/chat", { messages: hist.slice(-12) });
    wait.remove(); say(d.reply, 0, d.ids); hist.push({ role: "assistant", content: d.reply });
  } catch (x) {
    wait.remove(); const n = document.createElement("div"); n.className = "m notice"; n.style.background = "#fff7e0";
    n.textContent = x.error === "rate_limited" ? "You're sending messages quickly. Please wait a moment, then retry." : "The AI assistant is unavailable right now. This is an automatic notice, not an AI answer. You can browse the shop or contact us.";
    const b = document.createElement("button"); b.textContent = "Retry"; b.className = "btn o"; b.style.marginTop = "6px"; b.onclick = () => ask(t, true); n.appendChild(document.createElement("br")); n.appendChild(b); $("#clog").appendChild(n);
  }
  ask.busy = false; $("#clog").scrollTop = 1e6;
}
say("Hi! I'm Jiya, your AI cake assistant. I can help with cakes, flavors, custom orders and prices. How can I help today?", 0);
const chips = document.createElement("div"); chips.className = "chips"; chips.innerHTML = CHIPS.map(c => `<button type="button">${c}</button>`).join(""); $("#clog").appendChild(chips);
chips.onclick = e => { if (e.target.tagName === "BUTTON") ask(e.target.textContent); };
$("#cform").onsubmit = e => { e.preventDefault(); ask($("#cin").value); $("#cin").value = ""; };
$("#copen").onclick = () => $("#chat").classList.add("open"); $("#cclose").onclick = () => $("#chat").classList.remove("open");

fetch("/api/config").then(r => r.json()).then(c => {
  ({ settings: CONFIG, products: PRODUCTS, sizes: SIZES, custom: CUSTOM } = c);
  $("#finfo").innerHTML = `Phone: ${TBC(CONFIG.phone)} · Hours: ${TBC(CONFIG.hours)} · Address: ${TBC(CONFIG.address)}`;
  save(); route();
}).catch(() => { app.innerHTML = '<div class="card box"><h1>We\'re having trouble loading</h1><p>Please refresh the page or try again shortly.</p></div>'; });
