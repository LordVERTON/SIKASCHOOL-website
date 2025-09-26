-- Script pour corriger la structure de la table faqs
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer la table faqs existante si elle a une mauvaise structure
DROP TABLE IF EXISTS faqs CASCADE;

-- Recréer la table faqs avec la bonne structure
CREATE TABLE faqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter le trigger
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques RLS
CREATE POLICY "FAQs are viewable by everyone" ON faqs FOR SELECT USING (is_active = true);
