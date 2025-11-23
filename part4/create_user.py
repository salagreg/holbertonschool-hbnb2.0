#!/usr/bin/env python3
"""
Script pour créer un utilisateur directement dans la base de données
"""
from app import create_app, db
from app.models.user import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    print("👤 Création d'un utilisateur...")
    
    # Vérifier si un utilisateur existe déjà
    existing_user = User.query.first()
    if existing_user:
        print(f"\n✅ Un utilisateur existe déjà :")
        print(f"   Email: {existing_user.email}")
        print(f"   ID: {existing_user.id}")
        print(f"\nVoulez-vous créer un autre utilisateur ? (o/n)")
        choice = input().lower()
        if choice != 'o':
            print("Annulé.")
            exit()
    
    # Demander les informations
    print("\n📝 Entrez les informations de l'utilisateur :")
    email = input("Email (ex: admin@hbnb.com): ").strip() or "admin@hbnb.com"
    password = input("Mot de passe (ex: admin123): ").strip() or "admin123"
    first_name = input("Prénom (ex: Admin): ").strip() or "Admin"
    last_name = input("Nom (ex: User): ").strip() or "User"
    
    # Vérifier si l'email existe déjà
    if User.query.filter_by(email=email).first():
        print(f"\n❌ Un utilisateur avec l'email '{email}' existe déjà !")
        exit()
    
    # Créer l'utilisateur
    try:
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        
        # Définir le mot de passe (hash automatique si votre modèle le gère)
        # Adaptez selon votre modèle User
        if hasattr(user, 'set_password'):
            user.set_password(password)
        elif hasattr(user, 'password_hash'):
            user.password_hash = generate_password_hash(password)
        elif hasattr(user, 'password'):
            # Si le modèle stocke le mot de passe en clair (non recommandé)
            user.password = generate_password_hash(password)
        
        db.session.add(user)
        db.session.commit()
        
        print(f"\n✅ Utilisateur créé avec succès !")
        print(f"   Email: {user.email}")
        print(f"   ID: {user.id}")
        print(f"   Nom: {user.first_name} {user.last_name}")
        
        # Afficher tous les utilisateurs
        all_users = User.query.all()
        print(f"\n📊 Total d'utilisateurs : {len(all_users)}")
        
    except Exception as e:
        db.session.rollback()
        print(f"\n❌ Erreur lors de la création : {e}")
        import traceback
        traceback.print_exc()
        