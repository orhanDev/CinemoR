-- Fix encoding issues in movie titles
-- This script fixes common UTF-8 encoding problems

-- Fix LES MISÉRABLES title
UPDATE movies 
SET title = 'LES MISÉRABLES – DIE GESCHICHTE VON JEAN VALJEAN'
WHERE id = 5 AND title LIKE '%MIS%RABLES%';

-- Check current encoding of the database
SELECT 
    datname,
    pg_encoding_to_char(encoding) as encoding
FROM pg_database 
WHERE datname = 'cinemor-api';

-- Verify the fix
SELECT id, title FROM movies WHERE id = 5;
