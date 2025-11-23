// ============================================
// CONFIGURATION DE L'API
// ============================================

const API_BASE_URL = "http://127.0.0.1:5000/api/v1";

// ============================================
// UTILITAIRES : Cookies & Auth
// ============================================

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}

function isUserLoggedIn() {
  const token = getCookie("token");
  return token !== null && token !== "";
}

function logoutUser() {
  document.cookie = "token=; path=/; max-age=0";
  console.log("👋 Déconnexion réussie");
  window.location.href = "login.html";
}

// ============================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initVanta();
  initLoginForm();
  checkAuthentication();
  initPriceFilter();
  
  // Initialiser page place.html
  if (document.getElementById("place-name")) {
    initPlaceDetailsPage();
  }
  
  // Initialiser page add_review.html
  if (document.getElementById("review-form") && window.location.pathname.includes("add_review")) {
    initAddReviewPage();
  }
});

// ============================================
// ANIMATION VANTA
// ============================================

function initVanta() {
  const vantaElement = document.querySelector(".vanta-birds");
  if (!vantaElement) return;

  VANTA.BIRDS({
    el: ".vanta-birds",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    backgroundColor: 0x9595de,
    colorMode: "variance",
    wingSpan: 27.0,
    speedLimit: 6.0,
    backgroundAlpha: 0.86,
  });
}

// ============================================
// EXERCICE 1 : FORMULAIRE DE LOGIN
// ============================================

function initLoginForm() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
    const submitButton = document.querySelector(".login-submit");

    errorMessage.style.display = "none";
    errorMessage.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Connexion...";

    try {
      console.log("📤 Tentative de connexion...");
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("📥 Réponse:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Connexion réussie !", data);
        
        // Stocker le token dans un cookie
        document.cookie = `token=${data.access_token}; path=/; max-age=86400`;
        
        submitButton.textContent = "✓ Connexion réussie !";
        submitButton.style.background = "linear-gradient(45deg, #4CAF50, #8BC34A)";
        
        // Redirection après 1 seconde
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        const errorData = await response.json();
        console.log("❌ Échec:", errorData);
        errorMessage.textContent = errorData.error || errorData.message || "Email ou mot de passe incorrect";
        errorMessage.style.display = "block";
      }
    } catch (err) {
      console.error("💥 Erreur réseau:", err);
      errorMessage.textContent = "Impossible de se connecter au serveur. Vérifiez qu'il est démarré sur http://127.0.0.1:5000";
      errorMessage.style.display = "block";
    }

    submitButton.disabled = false;
    if (submitButton.textContent !== "✓ Connexion réussie !") {
      submitButton.textContent = "Se connecter";
    }
  });
}

// ============================================
// EXERCICE 2 : AUTHENTIFICATION & INDEX
// ============================================

function checkAuthentication() {
  const placesList = document.getElementById("places-list");
  if (!placesList) return; // Pas sur index.html
  
  const loginButton = document.querySelector('.login-button');
  const token = getCookie("token");
  
  console.log("🔍 Vérification authentification...");
  console.log("Token:", token ? "Présent ✓" : "Absent ✗");
  
  if (!token) {
    // Non connecté
    if (loginButton) {
      loginButton.textContent = "Login";
      loginButton.href = "login.html";
      loginButton.onclick = null;
    }
    loadPlaces(null);
  } else {
    // Connecté
    if (loginButton) {
      loginButton.textContent = "Logout";
      loginButton.href = "#";
      loginButton.onclick = (e) => {
        e.preventDefault();
        if (confirm("Voulez-vous vous déconnecter ?")) {
          logoutUser();
        }
      };
    }
    loadPlaces(token);
  }
}

// ============================================
// CHARGER LES PLACES (INDEX.HTML)
// ============================================

let allPlaces = [];

async function loadPlaces(token) {
  const placesList = document.getElementById("places-list");
  if (!placesList) return;

  try {
    console.log("📡 Chargement des places...");
    
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("🔑 Avec authentification");
    }

    const response = await fetch(`${API_BASE_URL}/places/`, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }

    const places = await response.json();
    console.log("✅ Places reçues:", places.length);
    
    allPlaces = places;
    displayPlaces(places);
    
  } catch (error) {
    console.error("❌ Erreur chargement places:", error);
    placesList.innerHTML = `
      <div style="color: white; text-align: center; padding: 2rem; grid-column: 1/-1;">
        <h3>⚠️ Impossible de charger les places</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById("places-list");
  if (!placesList) return;
  
  placesList.innerHTML = "";
  
  if (places.length === 0) {
    placesList.innerHTML = `
      <div style="color: white; text-align: center; padding: 2rem; grid-column: 1/-1;">
        <h3>Aucune place trouvée</h3>
      </div>
    `;
    return;
  }
  
  places.forEach((place) => {
    const article = document.createElement("article");
    
    article.innerHTML = `
      <div class="place-card" data-price="${place.price || 0}">
        <img 
          src="${place.image_url || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=220&fit=crop'}" 
          alt="${place.name || place.title || 'Place'}" 
          class="card-image" 
        />
        <div class="card-content">
          <h2 class="place-name">${place.name || place.title || 'Sans nom'}</h2>
          <div class="place-info">
            <span class="place-price">${place.price || 0}€ / nuit</span>
            <span class="place-rating">⭐ ${place.rating || 'N/A'}</span>
          </div>
          <p class="place-description">${place.description || 'Pas de description'}</p>
          <div class="card-footer">
            <span class="place-location">
              <svg class="location-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              ${place.location || 'Lieu non spécifié'}
            </span>
            <a href="place.html?id=${place.id}" class="details-button">View Details</a>
          </div>
        </div>
      </div>
    `;
    
    placesList.appendChild(article);
  });
  
  console.log(`📋 ${places.length} place(s) affichée(s)`);
}

// ============================================
// FILTRE DE PRIX
// ============================================

function initPriceFilter() {
  const priceFilter = document.getElementById("price-filter");
  if (!priceFilter) return;
  
  console.log("🎛️ Initialisation du filtre de prix");
  
  priceFilter.addEventListener("change", (event) => {
    const selectedPrice = event.target.value;
    console.log("🔍 Filtre appliqué:", selectedPrice);
    filterPlacesByPrice(selectedPrice);
  });
}

function filterPlacesByPrice(maxPrice) {
  const placeCards = document.querySelectorAll(".place-card");
  let visibleCount = 0;
  
  placeCards.forEach((card) => {
    const placePrice = parseInt(card.getAttribute("data-price"));
    
    if (maxPrice === "all") {
      card.parentElement.style.display = "block";
      visibleCount++;
    } else {
      const filterPrice = parseInt(maxPrice);
      if (placePrice <= filterPrice) {
        card.parentElement.style.display = "block";
        visibleCount++;
      } else {
        card.parentElement.style.display = "none";
      }
    }
  });
  
  console.log(`✅ ${visibleCount} place(s) visible(s)`);
}

// ============================================
// EXERCICE 3 : PAGE PLACE DETAILS
// ============================================

function initPlaceDetailsPage() {
  const placeId = getPlaceIdFromURL();
  const token = getCookie("token");
  
  fetchPlaceDetails(token, placeId);
  
  // Afficher le lien add_review si connecté
  const addReviewLink = document.getElementById("add-review-link");
  if (addReviewLink) {
    if (token) {
      addReviewLink.href = `add_review.html?id=${placeId}`;
      addReviewLink.style.display = "inline-block";
    }
  }
  
  // Gérer le formulaire inline
  const reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    reviewForm.style.display = token ? "block" : "none";
    
    if (token) {
      reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await submitReview(token, placeId);
      });
    }
  }
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchPlaceDetails(token, placeId) {
  try {
    console.log("📡 Chargement des détails de la place...");
    
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
      method: "GET",
      headers: headers,
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }
    
    const place = await response.json();
    console.log("✅ Détails reçus:", place);
    
    displayPlaceDetails(place);
    
    // Charger les reviews
    fetchReviews(placeId);
    
  } catch (error) {
    console.error("❌ Erreur chargement détails:", error);
    document.getElementById("place-name").textContent = "Erreur de chargement";
  }
}

function displayPlaceDetails(place) {
  // Nom
  document.getElementById("place-name").textContent = place.name || place.title || "Sans nom";
  
  // Description
  document.getElementById("place-description").textContent = place.description || "Pas de description";
  
  // Prix
  const priceEl = document.getElementById("place-price");
  if (priceEl) {
    priceEl.textContent = `${place.price || 0}€ / nuit`;
  }
  
  // Host
  const hostEl = document.getElementById("place-host");
  if (hostEl && place.host) {
    hostEl.textContent = `Hôte : ${place.host.first_name || ''} ${place.host.last_name || ''}`;
  }
  
  // Amenities
  const amenitiesEl = document.getElementById("amenities-list");
  if (amenitiesEl) {
    amenitiesEl.innerHTML = "";
    if (place.amenities && place.amenities.length > 0) {
      place.amenities.forEach(amenity => {
        const li = document.createElement("li");
        li.textContent = amenity.name || amenity;
        amenitiesEl.appendChild(li);
      });
    } else {
      amenitiesEl.innerHTML = "<li>Aucun équipement listé</li>";
    }
  }
}

async function fetchReviews(placeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/places/${placeId}/reviews`);
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }
    
    const reviews = await response.json();
    console.log("✅ Reviews reçues:", reviews.length);
    
    displayReviews(reviews);
    
  } catch (error) {
    console.error("❌ Erreur chargement reviews:", error);
  }
}

function displayReviews(reviews) {
  const reviewsList = document.getElementById("reviews-list");
  if (!reviewsList) return;
  
  reviewsList.innerHTML = "";
  
  if (reviews.length === 0) {
    reviewsList.innerHTML = "<p>Aucun avis pour le moment.</p>";
    return;
  }
  
  reviews.forEach((review) => {
    const div = document.createElement("div");
    div.className = "review-card";
    div.innerHTML = `
      <p><strong>${review.user?.first_name || 'Anonyme'}</strong> - Note: ${review.rating}/5</p>
      <p>${review.text || review.comment || ''}</p>
    `;
    reviewsList.appendChild(div);
  });
}

async function submitReview(token, placeId) {
  const text = document.getElementById("review-text").value;
  const rating = document.getElementById("review-rating").value;
  
  if (!text || !rating) {
    alert("Veuillez remplir tous les champs");
    return;
  }
  
  try {
    console.log("📤 Envoi de la review...");
    
    const response = await fetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        text: text,
        rating: parseInt(rating),
        place_id: placeId
      })
    });
    
    if (response.ok) {
      console.log("✅ Review ajoutée !");
      alert("Votre avis a été publié !");
      document.getElementById("review-text").value = "";
      document.getElementById("review-rating").value = "";
      fetchReviews(placeId);
    } else {
      const error = await response.json();
      console.error("❌ Erreur:", error);
      alert("Erreur lors de la publication de l'avis");
    }
  } catch (error) {
    console.error("💥 Erreur réseau:", error);
    alert("Erreur réseau lors de la publication");
  }
}

// ============================================
// EXERCICE 4 : PAGE ADD REVIEW
// ============================================

function initAddReviewPage() {
  console.log("📝 Initialisation de la page add review");
  
  const token = getCookie("token");
  
  // Vérifier l'authentification
  if (!token) {
    console.log("❌ Non authentifié, redirection...");
    window.location.href = "index.html";
    return;
  }
  
  const placeId = getPlaceIdFromURL();
  if (!placeId) {
    console.error("❌ Aucun ID de place dans l'URL");
    alert("Erreur : aucune place spécifiée");
    window.location.href = "index.html";
    return;
  }
  
  console.log("✅ Authentifié, Place ID:", placeId);
  
  // Remplir les options de rating
  const ratingSelect = document.getElementById("rating");
  if (ratingSelect) {
    for (let i = 1; i <= 5; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `${i} étoile${i > 1 ? 's' : ''}`;
      ratingSelect.appendChild(option);
    }
  }
  
  // Event listener pour le formulaire
  const reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await submitReviewFromAddPage(token, placeId);
    });
  }
}

async function submitReviewFromAddPage(token, placeId) {
  const text = document.getElementById("review").value;
  const rating = document.getElementById("rating").value;
  
  if (!text || !rating) {
    alert("Veuillez remplir tous les champs");
    return;
  }
  
  try {
    console.log("📤 Envoi de la review...");
    
    const response = await fetch(`${API_BASE_URL}/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        text: text,
        rating: parseInt(rating),
        place_id: placeId
      })
    });
    
    if (response.ok) {
      console.log("✅ Review ajoutée !");
      alert("Votre avis a été publié avec succès !");
      window.location.href = `place.html?id=${placeId}`;
    } else {
      const error = await response.json();
      console.error("❌ Erreur:", error);
      alert(`Erreur: ${error.message || 'Impossible de publier l\'avis'}`);
    }
  } catch (error) {
    console.error("💥 Erreur réseau:", error);
    alert("Erreur réseau lors de la publication");
  }
}
