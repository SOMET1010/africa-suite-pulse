-- Nettoyage final: Supprimer les fonctions de test
DROP FUNCTION IF EXISTS test_final_pos_auth();
DROP FUNCTION IF EXISTS test_pos_auth_simple(text);
DROP FUNCTION IF EXISTS test_pos_authentication(text);