// script.js - Fonctions partagées (compteur panier, etc.)
// Ce fichier est inclus dans toutes les pages pour assurer la cohérence.
// La logique principale de chaque page est incluse directement dans chaque fichier HTML,
// mais on garde ici des helpers communs si nécessaire.

// Exemple : fonction utilitaire pour mettre à jour l'affichage du compteur panier
function updateGlobalCartCount() {
  const cart = JSON.parse(localStorage.getItem('sweetCustomizeCart') || '[]');
  const totalItems = cart.reduce((acc) => acc + 1, 0);
  const cartSpans = document.querySelectorAll('#cartCount');
  cartSpans.forEach(span => {
    if (span) span.innerText = totalItems;
  });
}

// Initialisation du compteur au chargement de chaque page
document.addEventListener('DOMContentLoaded', () => {
  updateGlobalCartCount();
  // Écoute les modifications du localStorage depuis d'autres onglets
  window.addEventListener('storage', (e) => {
    if (e.key === 'sweetCustomizeCart') updateGlobalCartCount();
  });
});