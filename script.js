// script.js - Fonctions partagées (compteur panier, etc.)
// Ce fichier est inclus dans toutes les pages pour assurer la cohérence.
// La logique principale de chaque page est incluse directement dans chaque fichier HTML,
// mais on garde ici des helpers communs si nécessaire.

// Exemple : fonction utilitaire pour mettre à jour l'affichage du compteur panier
function updateGlobalCartCount() {
  const cart = JSON.parse(localStorage.getItem('sweetCustomizeCart') || '[]');
  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartSpans = document.querySelectorAll('#cartCount');
  cartSpans.forEach(span => {
    if (span) span.innerText = totalItems;
  });
}

// Initialisation au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
  updateGlobalCartCount();
  
  // Mobile Menu Logic
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // Mega Menu Accordion for Mobile
  const megaNavItem = document.querySelector('.nav-item-mega');
  if (megaNavItem) {
    const megaLink = megaNavItem.querySelector('a');
    megaLink.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        megaNavItem.classList.toggle('active');
      }
    });
  }

  // Écoute les modifications du localStorage depuis d'autres onglets
  window.addEventListener('storage', (e) => {
    if (e.key === 'sweetCustomizeCart') updateGlobalCartCount();
  });
});