/**
 * checkout.js - Logique de la page de paiement SweetCustomize
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- ÉLÉMENTS DU DOM ---
  const cartCountEl = document.getElementById('cartCount');
  const summaryItemsContainer = document.getElementById('checkoutSummaryItems');
  const subtotalEl = document.getElementById('summarySubtotal');
  const discountRow = document.getElementById('summaryDiscountRow');
  const discountPercentEl = document.getElementById('discountPercent');
  const discountDisplayEl = document.getElementById('summaryDiscount');
  const deliveryDisplayEl = document.getElementById('summaryDelivery');
  const totalDisplayEl = document.getElementById('summaryTotalTTC');

  // Coupon
  const couponInput = document.getElementById('couponInput');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const couponStatusMsg = document.getElementById('couponStatusMsg');

  // Livraison
  const deliveryStandardRadio = document.getElementById('deliveryStandard');
  const deliveryExpressRadio = document.getElementById('deliveryExpress');
  const labelDeliveryStandard = document.getElementById('labelDeliveryStandard');
  const labelDeliveryExpress = document.getElementById('labelDeliveryExpress');

  // Paiement
  const paymentCodRadio = document.getElementById('paymentCod');
  const paymentCardRadio = document.getElementById('paymentCard');
  const paymentPaypalRadio = document.getElementById('paymentPaypal');
  const tabCod = document.getElementById('tabCod');
  const tabCard = document.getElementById('tabCard');
  const tabPaypal = document.getElementById('tabPaypal');
  const creditCardDetails = document.getElementById('creditCardDetails');
  const paymentStatusMsg = document.getElementById('paymentStatusMsg');
  const paymentStatusText = document.getElementById('paymentStatusText');

  // Champs de formulaires
  const checkoutForm = document.getElementById('checkoutForm');
  const btnConfirmOrder = document.getElementById('btnConfirmOrder');
  const successPopup = document.getElementById('successPopup');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  // --- VARIABLES D'ÉTAT ---
  let cart = [];
  let subtotal = 0;
  let deliveryFee = 20; // Par défaut Standard (20 DH)
  let discountRate = 0; // Taux de réduction (0.1 pour 10%)
  let appliedCoupon = "";

  // --- MENU RESPONSIVE MOBILE ---
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // --- CHARGEMENT DU PANIER & CALCUL DES PRIX ---
  function loadCart() {
    const storedCart = localStorage.getItem('sweetCustomizeCart');
    cart = storedCart ? JSON.parse(storedCart) : [];
    renderSummaryItems();
    calculatePrices();
    updateGlobalCartCounter();
  }

  function updateGlobalCartCounter() {
    const totalQty = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    if (cartCountEl) cartCountEl.innerText = totalQty;
  }

  function renderSummaryItems() {
    if (!summaryItemsContainer) return;

    if (cart.length === 0) {
      summaryItemsContainer.innerHTML = `
        <div class="empty-summary-cart">
          <i class="fas fa-shopping-basket"></i>
          <p>Votre panier est vide.</p>
          <p style="font-size:0.85rem; margin-top:8px;">
            <a href="index.html" style="color:var(--accent-gold); text-decoration:underline;">Retourner aux créations</a>
          </p>
        </div>
      `;
      if (btnConfirmOrder) btnConfirmOrder.disabled = true;
      return;
    }

    if (btnConfirmOrder) btnConfirmOrder.disabled = false;

    let html = '';
    cart.forEach(item => {
      const qty = item.quantity || 1;
      const itemTotal = item.finalPrice * qty;
      const ingredientsText = item.ingredients && item.ingredients.length 
        ? item.ingredients.join(', ') 
        : 'Recette Signature';

      // Détermine la classe du badge par catégorie
      let categoryClass = 'classic';
      let categoryLabel = 'Classique';
      if (item.category === 'sugar-free') {
        categoryClass = 'sugar-free';
        categoryLabel = 'Sans Sucre';
      } else if (item.category === 'gluten-free') {
        categoryClass = 'gluten-free';
        categoryLabel = 'Sans Gluten';
      } else if (item.category === 'custom') {
        categoryClass = 'custom';
        categoryLabel = 'Sur Mesure';
      }

      const itemImg = item.image || (
        item.category === 'sugar-free' ? 'images/problem from sugar 1.jpeg' :
        item.category === 'gluten-free' ? 'images/problem from siliac 1.jpeg' :
        'images/custom-creation.jpeg'
      );

      html += `
        <div class="summary-item-box">
          <div class="item-thumb-box">
            <img src="${itemImg}" alt="${item.name}">
          </div>
          <div class="item-details-box">
            <div class="item-title-row">
              <h4>${item.name}</h4>
              <span class="item-total-price">${itemTotal.toFixed(2)} DH</span>
            </div>
            <span class="item-desc-badge ${categoryClass}">${categoryLabel}</span>
            <p class="item-ingredients">${ingredientsText}</p>
            <div class="item-qty-row">Quantité: ${qty} x ${item.finalPrice.toFixed(2)} DH</div>
          </div>
        </div>
      `;
    });

    summaryItemsContainer.innerHTML = html;
  }

  function calculatePrices() {
    // Calcul du sous-total
    subtotal = cart.reduce((sum, item) => sum + (item.finalPrice * (item.quantity || 1)), 0);
    
    // Calcul de la remise
    const discountAmount = subtotal * discountRate;
    
    // Calcul du total final
    const totalTTC = subtotal - discountAmount + deliveryFee;

    // Mise à jour de l'affichage
    subtotalEl.innerText = subtotal.toFixed(2) + " DH";
    deliveryDisplayEl.innerText = deliveryFee.toFixed(2) + " DH";
    totalDisplayEl.innerText = totalTTC.toFixed(2) + " DH";

    if (discountRate > 0) {
      discountPercentEl.innerText = (discountRate * 100).toString();
      discountDisplayEl.innerText = "-" + discountAmount.toFixed(2) + " DH";
      discountRow.style.display = 'flex';
    } else {
      discountRow.style.display = 'none';
    }
  }

  // --- GESTION DES MODES DE LIVRAISON ---
  if (deliveryStandardRadio && deliveryExpressRadio) {
    deliveryStandardRadio.addEventListener('change', () => {
      if (deliveryStandardRadio.checked) {
        deliveryFee = 20;
        labelDeliveryStandard.classList.add('active');
        labelDeliveryExpress.classList.remove('active');
        calculatePrices();
      }
    });

    deliveryExpressRadio.addEventListener('change', () => {
      if (deliveryExpressRadio.checked) {
        deliveryFee = 50;
        labelDeliveryExpress.classList.add('active');
        labelDeliveryStandard.classList.remove('active');
        calculatePrices();
      }
    });
  }

  // --- GESTION DU CODE DE PAIEMENT & DYNAMIQUES DE FORMULAIRE ---
  function updatePaymentView() {
    tabCod.classList.remove('active');
    tabCard.classList.remove('active');
    tabPaypal.classList.remove('active');
    
    if (paymentCodRadio.checked) {
      tabCod.classList.add('active');
      creditCardDetails.style.display = 'none';
      paymentStatusMsg.style.display = 'flex';
      paymentStatusText.innerText = "Vous paierez le montant total en espèces directement auprès de notre livreur à réception de vos douceurs.";
      toggleCreditCardRequired(false);
    } else if (paymentCardRadio.checked) {
      tabCard.classList.add('active');
      creditCardDetails.style.display = 'block';
      paymentStatusMsg.style.display = 'none';
      toggleCreditCardRequired(true);
    } else if (paymentPaypalRadio.checked) {
      tabPaypal.classList.add('active');
      creditCardDetails.style.display = 'none';
      paymentStatusMsg.style.display = 'flex';
      paymentStatusText.innerText = "Vous serez redirigé vers l'interface sécurisée de PayPal pour finaliser le paiement avec votre compte ou carte bancaire.";
      toggleCreditCardRequired(false);
    }
  }

  if (paymentCodRadio && paymentCardRadio && paymentPaypalRadio) {
    paymentCodRadio.addEventListener('change', updatePaymentView);
    paymentCardRadio.addEventListener('change', updatePaymentView);
    paymentPaypalRadio.addEventListener('change', updatePaymentView);
  }

  function toggleCreditCardRequired(required) {
    const ccInputs = ['cardHolder', 'cardNumber', 'cardExpiry', 'cardCvv'];
    ccInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        if (required) {
          input.setAttribute('required', 'required');
        } else {
          input.removeAttribute('required');
          // Nettoie les erreurs s'il y en avait
          clearInputError(input);
        }
      }
    });
  }

  // --- MASQUES DE SAISIE POUR CARTE ET CONTACTS ---
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      // Autoriser seulement chiffres, + et espaces
      e.target.value = e.target.value.replace(/[^0-9+\s]/g, '');
    });
  }

  const cardNoInput = document.getElementById('cardNumber');
  if (cardNoInput) {
    cardNoInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      let formatted = '';
      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += ' ';
        }
        formatted += val[i];
      }
      e.target.value = formatted.substring(0, 19);
    });
  }

  const cardExpiryInput = document.getElementById('cardExpiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 2) {
        e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
      } else {
        e.target.value = val;
      }
    });
  }

  const cardCvvInput = document.getElementById('cardCvv');
  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
  }

  // --- GESTION DU COUPON CODE (SWEET10) ---
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      
      if (!code) {
        showCouponMsg("Veuillez saisir un code promo.", "error");
        return;
      }

      if (appliedCoupon === code) {
        showCouponMsg("Ce code promo est déjà appliqué.", "error");
        return;
      }

      if (code === "SWEET10") {
        discountRate = 0.10; // 10%
        appliedCoupon = code;
        calculatePrices();
        showCouponMsg("Félicitations ! Code SWEET10 appliqué : -10% sur vos desserts.", "success");
        couponInput.setAttribute('disabled', 'true');
        applyCouponBtn.setAttribute('disabled', 'true');
      } else {
        showCouponMsg("Code promo invalide. Essayez SWEET10.", "error");
      }
    });
  }

  function showCouponMsg(msg, type) {
    if (!couponStatusMsg) return;
    couponStatusMsg.innerText = msg;
    couponStatusMsg.className = "coupon-status-msg " + type;
  }

  // --- FORM VALIDATION UTILITIES ---
  function showInputError(input, msgId) {
    const group = input.closest('.input-group');
    if (group) {
      group.classList.add('invalid');
    }
  }

  function clearInputError(input) {
    const group = input.closest('.input-group');
    if (group) {
      group.classList.remove('invalid');
    }
  }

  // Écouter le focus/input pour supprimer dynamiquement les erreurs
  const allInputs = document.querySelectorAll('input');
  allInputs.forEach(input => {
    input.addEventListener('input', () => {
      clearInputError(input);
    });
  });

  // --- DÉTAILS DU CLIENT VALIDATION ---
  function validateForm() {
    let isValid = true;

    // 1. Nom Complet
    const fullName = document.getElementById('fullName');
    if (!fullName.value.trim()) {
      showInputError(fullName);
      isValid = false;
    } else {
      clearInputError(fullName);
    }

    // 2. Email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
      showInputError(email);
      isValid = false;
    } else {
      clearInputError(email);
    }

    // 3. Téléphone
    const phone = document.getElementById('phone');
    // Regex pour format marocain et international simple
    const phoneRegex = /^(?:\+212|0)[5-7]\d{8}$/;
    if (!phone.value.trim() || !phoneRegex.test(phone.value.trim().replace(/\s/g, ''))) {
      showInputError(phone);
      isValid = false;
    } else {
      clearInputError(phone);
    }

    // 4. Adresse
    const address = document.getElementById('address');
    if (!address.value.trim() || address.value.trim().length < 8) {
      showInputError(address);
      isValid = false;
    } else {
      clearInputError(address);
    }

    // 5. Ville
    const city = document.getElementById('city');
    if (!city.value.trim()) {
      showInputError(city);
      isValid = false;
    } else {
      clearInputError(city);
    }

    // 6. Code Postal
    const postalCode = document.getElementById('postalCode');
    const pcRegex = /^\d{4,8}$/;
    if (!postalCode.value.trim() || !pcRegex.test(postalCode.value.trim())) {
      showInputError(postalCode);
      isValid = false;
    } else {
      clearInputError(postalCode);
    }

    // 7. Si Carte Bancaire est sélectionnée
    if (paymentCardRadio.checked) {
      const cardHolder = document.getElementById('cardHolder');
      if (!cardHolder.value.trim() || cardHolder.value.trim().length < 3) {
        showInputError(cardHolder);
        isValid = false;
      } else {
        clearInputError(cardHolder);
      }

      const cardNumber = document.getElementById('cardNumber');
      const cleanCardNum = cardNumber.value.replace(/\s/g, '');
      if (!cleanCardNum || cleanCardNum.length < 16) {
        showInputError(cardNumber);
        isValid = false;
      } else {
        clearInputError(cardNumber);
      }

      const cardExpiry = document.getElementById('cardExpiry');
      const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!cardExpiry.value.trim() || !expRegex.test(cardExpiry.value.trim())) {
        showInputError(cardExpiry);
        isValid = false;
      } else {
        // Validation basique de la date d'expiration (année future)
        const parts = cardExpiry.value.split('/');
        const month = parseInt(parts[0], 10);
        const year = parseInt("20" + parts[1], 10);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          showInputError(cardExpiry);
          isValid = false;
        } else {
          clearInputError(cardExpiry);
        }
      }

      const cardCvv = document.getElementById('cardCvv');
      if (!cardCvv.value.trim() || cardCvv.value.trim().length < 3) {
        showInputError(cardCvv);
        isValid = false;
      } else {
        clearInputError(cardCvv);
      }
    }

    return isValid;
  }

  // --- ACTION DE SOUMISSION ---
  if (btnConfirmOrder) {
    btnConfirmOrder.addEventListener('click', (e) => {
      e.preventDefault();

      // S'assurer qu'il y a des articles
      if (cart.length === 0) {
        alert("Votre panier est vide. Veuillez ajouter des douceurs avant de finaliser.");
        return;
      }

      // Valider le formulaire
      if (!validateForm()) {
        // Faire défiler vers le premier élément invalide
        const firstInvalid = document.querySelector('.input-group.invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Sauvegarde temporaire des infos de commande pour la page de confirmation (optionnel)
      const orderSummary = {
        customerName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value + ", " + document.getElementById('city').value,
        deliveryMethod: deliveryStandardRadio.checked ? "Standard (20 DH)" : "Express (50 DH)",
        paymentMethod: paymentCodRadio.checked ? "Cash on Delivery" : paymentCardRadio.checked ? "Carte Bancaire" : "PayPal",
        totalPaid: (subtotal - (subtotal * discountRate) + deliveryFee).toFixed(2) + " DH",
        orderNumber: "SC-" + Math.floor(100000 + Math.random() * 900000),
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity || 1,
          category: item.category,
          ingredients: item.ingredients
        }))
      };
      
      localStorage.setItem('lastSweetOrder', JSON.stringify(orderSummary));

      // Bloquer le bouton et afficher la popup de succès
      btnConfirmOrder.disabled = true;
      btnConfirmOrder.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Validation en cours...`;

      setTimeout(() => {
        // Activer la popup animée
        successPopup.classList.add('active');

        // Vider le panier
        localStorage.removeItem('sweetCustomizeCart');
        window.dispatchEvent(new Event('storage'));

        // Redirection après 3 secondes (temps que la barre de chargement se remplisse)
        setTimeout(() => {
          window.location.href = 'confirmation.html';
        }, 2800);

      }, 1000);
    });
  }

  // --- INITIALISATION ---
  loadCart();
  updatePaymentView(); // Rendre l'état de paiement par défaut visible (COD)
});
