-- Script pour corriger la structure de la table reviews
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer la table reviews existante si elle a une mauvaise structure
DROP TABLE IF EXISTS reviews CASCADE;

-- Recréer la table reviews avec la bonne structure
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_role VARCHAR(100),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter le trigger
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques RLS
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true);
