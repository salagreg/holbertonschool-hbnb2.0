🏡 HBNB – Système de Réservation et Modélisation
🔍 Aperçu du projet
Ce projet consiste à créer une application pour la réservation de logements, avec une architecture claire et des diagrammes UML détaillés.
Les utilisateurs peuvent :
Créer un compte et se connecter
Parcourir les logements selon différents critères
Ajouter des avis et notes
Voir les équipements disponibles
Ce README présente l’organisation du code, les principales entités, et les diagrammes utilisés pour concevoir le système.
🏗 Structure du projet
L’application est organisée en trois couches principales :
1️⃣ Interface Utilisateur
Gère l’affichage et l’interaction avec l’utilisateur.
Les contrôleurs communiquent avec la couche métier via un point d’accès centralisé pour simplifier les appels.
Exemples de contrôleurs :
UserController : gestion des comptes
PlaceController : affichage et recherche de logements
ReviewController : gestion des avis
2️⃣ Logique Métier
Contient les modèles et règles de gestion.
Prépare les données avant leur envoi à la base de données.
Exemples de modèles :
User
Place
Review
3️⃣ Accès aux Données
Interagit avec la base de données pour récupérer ou modifier les informations.
Effectue des opérations CRUD sécurisées.
Exemples :
DatabaseConnector
Repository
📊 Modèle de Données
Les principales entités et leurs relations sont représentées dans le diagramme de classes.
Principales entités
User : informations personnelles et statut administrateur
Place : logement avec description, prix et propriétaire
Review : avis et notes laissés par les utilisateurs
Amenity : équipements disponibles
AmenitiesPlaces : lien entre logements et équipements
Relations clés
Composition : un avis ne peut exister sans logement
Agrégation : les équipements existent indépendamment des logements
🔄 Exemples de Scénarios (Diagrammes de Séquence)
Création de compte
✅ Compte créé avec succès
⚠️ Erreur de données (400)
🔄 Email déjà utilisé (409)
❌ Erreur serveur (500)
Recherche de logements
✅ Résultats conformes aux critères
⚠️ Critères invalides (400)
❌ Problème lors de la recherche (500)
Suppression d’un avis
✅ Avis supprimé (204)
⚠️ ID invalide (400)
❓ Avis inexistant (404)
❌ Erreur serveur (500)
📌 Conclusion
L’application suit une architecture modulaire en couches, avec des diagrammes UML pour visualiser la structure et le flux des données.
Cette organisation rend le projet maintenable, scalable, et clair à comprendre avant et après le développement.
