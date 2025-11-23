#!/usr/bin/env python3
"""
Script pour recréer complètement la base de données
"""
import os
from app import create_app, db

app = create_app()

with app.app_context():
    # Afficher le chemin de la base de données
    db_path = app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:///', '')
    print(f"📍 Base de données : {db_path}")
    
    # Supprimer toutes les tables
    print("🗑️  Suppression de toutes les tables...")
    db.drop_all()
    
    # Recréer toutes les tables avec le nouveau schéma
    print("🔨 Création des nouvelles tables...")
    db.create_all()
    
    print("✅ Base de données réinitialisée avec succès !")
    print("\nVous pouvez maintenant exécuter :")
    print("  python3 seed.py")