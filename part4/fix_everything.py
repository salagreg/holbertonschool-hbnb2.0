#!/usr/bin/env python3
"""
RESET NUCLÉAIRE - Supprime TOUT et recrée TOUT proprement
"""
import os
from app import create_app, db
from app.models.user import User
from app.models.place import Place

app = create_app()

print("=" * 60)
print("💣 RESET NUCLÉAIRE DE LA BASE DE DONNÉES")
print("=" * 60)
print("\n⚠️  ATTENTION : Ceci va supprimer TOUTES vos données !")
print("Appuyez sur ENTRÉE pour continuer ou CTRL+C pour annuler...")
input()

with app.app_context():
    # ====================================
    # ÉTAPE 1 : SUPPRIMER LA BASE
    # ====================================
    print("\n📋 ÉTAPE 1 : Suppression complète")
    print("-" * 60)
    
    db_path = app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:///', '')
    
    if db_path and os.path.exists(db_path):
        print(f"🗑️  Suppression de {db_path}...")
        os.remove(db_path)
        print("✅ Base supprimée")
    else:
        print("ℹ️  Aucune base à supprimer")
    
    # ====================================
    # ÉTAPE 2 : RECRÉER LA BASE
    # ====================================
    print("\n📋 ÉTAPE 2 : Recréation de la base")
    print("-" * 60)
    
    print("🔨 Création des tables...")
    db.create_all()
    print("✅ Tables créées")
    
    # Afficher la structure
    print("\n📊 Structure du modèle Place :")
    place_columns = [c.name for c in Place.__table__.columns]
    for col in place_columns:
        print(f"   • {col}")
    
    print("\n📊 Structure du modèle User :")
    user_columns = [c.name for c in User.__table__.columns]
    for col in user_columns:
        print(f"   • {col}")
    
    # ====================================
    # ÉTAPE 3 : CRÉER L'UTILISATEUR
    # ====================================
    print("\n📋 ÉTAPE 3 : Création de l'utilisateur")
    print("-" * 60)
    
    print("👤 Création de admin@hbnb.com...")
    user = User(
        email="admin@hbnb.com",
        first_name="Admin",
        last_name="User",
        password="admin123"  # Hash automatique
    )
    
    db.session.add(user)
    db.session.commit()
    print(f"✅ Utilisateur créé (ID: {user.id})")
    
    # ====================================
    # ÉTAPE 4 : CRÉER LES PLACES
    # ====================================
    print("\n📋 ÉTAPE 4 : Création des places")
    print("-" * 60)
    
    # Déterminer le bon champ (name ou title)
    name_field = 'title' if 'title' in place_columns else 'name'
    print(f"   → Utilisation du champ '{name_field}'")
    
    places_data = [
        {
            "name": "Cozy Apartment Downtown",
            "description": "A charming apartment in the heart of the city.",
            "price": 120,
            "latitude": 48.8566,
            "longitude": 2.3522,
            "image_url": "https://images.unsplash.com/photo-1560448070-8497a1f32e7a?w=400&h=220&fit=crop"
        },
        {
            "name": "Mountain View Chalet",
            "description": "Stunning chalet with breathtaking mountain views.",
            "price": 250,
            "latitude": 45.8326,
            "longitude": 6.8652,
            "image_url": "https://images.unsplash.com/photo-1501117716987-c8e8b6d5c9e2?w=400&h=220&fit=crop"
        },
        {
            "name": "Modern Loft by the Ocean",
            "description": "Contemporary loft with ocean views.",
            "price": 180,
            "latitude": 43.2965,
            "longitude": 5.3698,
            "image_url": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=220&fit=crop"
        },
        {
            "name": "Rustic Cottage in Provence",
            "description": "Authentic Provencal cottage surrounded by lavender.",
            "price": 95,
            "latitude": 43.9493,
            "longitude": 4.8055,
            "image_url": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=220&fit=crop"
        },
        {
            "name": "Luxury Villa with Pool",
            "description": "Spacious villa with private pool.",
            "price": 350,
            "latitude": 43.7102,
            "longitude": 7.2620,
            "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=220&fit=crop"
        },
        {
            "name": "Historic Studio in Montmartre",
            "description": "Charming studio in the artistic heart of Paris.",
            "price": 85,
            "latitude": 48.8867,
            "longitude": 2.3431,
            "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=220&fit=crop"
        }
    ]
    
    print(f"🏠 Création de {len(places_data)} places...")
    
    for i, place_data in enumerate(places_data, 1):
        # Créer la place
        place_dict = {
            "description": place_data["description"],
            "price": place_data["price"],
            "latitude": place_data["latitude"],
            "longitude": place_data["longitude"],
            "image_url": place_data["image_url"],
            "user_id": user.id
        }
        
        # Ajouter le champ name ou title
        place_dict[name_field] = place_data["name"]
        
        place = Place(**place_dict)
        db.session.add(place)
        
        print(f"   {i}. {place_data['name']} - {place_data['price']}€/nuit")
    
    db.session.commit()
    print("✅ Places créées")
    
    # ====================================
    # ÉTAPE 5 : VÉRIFICATION FINALE
    # ====================================
    print("\n📋 ÉTAPE 5 : Vérification")
    print("-" * 60)
    
    user_count = User.query.count()
    place_count = Place.query.count()
    
    print(f"✅ Utilisateurs : {user_count}")
    print(f"✅ Places : {place_count}")
    
    # Test de lecture
    print("\n🔍 Test de lecture des places :")
    for place in Place.query.all():
        place_name = getattr(place, name_field, "Sans nom")
        print(f"   • {place_name} ({place.price}€)")
    
    print("\n" + "=" * 60)
    print("✅ BASE DE DONNÉES PRÊTE !")
    print("=" * 60)
    print("\n📝 Informations de connexion :")
    print("   Email    : admin@hbnb.com")
    print("   Password : admin123")
    print("\n🚀 Commandes suivantes :")
    print("   1. Lancer l'API : python3 run.py")
    print("   2. Tester : curl http://127.0.0.1:5000/api/v1/places/")
    print("   3. Ouvrir index.html dans le navigateur")
    print("=" * 60)
