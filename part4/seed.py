# seed.py
from app import create_app, db
from app.models.user import User
from app.models.place import Place
from app.models.amenity import Amenity
import random


app = create_app()
app.app_context().push()

def seed_database():
    print("🔄 Seed de la base de données en cours...")

    # Vérifier qu'il y a au moins un utilisateur
    user = User.query.first()
    if not user:
        print("❌ Aucun utilisateur trouvé. Créez au moins un utilisateur avant de lancer le seed.")
        return

    # --- AMENITIES ---
    amenities_list = ["WiFi", "Piscine", "Climatisation", "Parking", "Petit déjeuner", "Salle de sport"]
    
    for amenity_name in amenities_list:
        if not Amenity.query.filter_by(name=amenity_name).first():
            db.session.add(Amenity(name=amenity_name))
    db.session.commit()
    
    all_amenities = Amenity.query.all()

    # --- PLACES ---
if Place.query.count() > 0:
    Place.query.delete()
    db.session.commit()

titles = [
    "Appartement cosy au centre-ville",
    "Chalet avec vue sur la montagne",
    "Loft moderne près du port"
]

for i in range(3):
    place = Place(
        title=titles[i],
        description=f"Description détaillée pour {titles[i]}.",
        price=random.randint(50, 200),
        latitude=48.8 + random.random() * 0.05,
        longitude=2.3 + random.random() * 0.05,
        user_id=user.id  # <--- ici on passe l'id de l'utilisateur
    )
    # Ajouter 1 à 3 amenities aléatoires
    place.amenities.extend(random.sample(all_amenities, random.randint(1, 3)))
    db.session.add(place)

db.session.commit()
print("✅ Seed terminé : 3 places ajoutées avec amenities.")