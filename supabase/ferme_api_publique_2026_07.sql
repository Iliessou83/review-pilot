-- ============================================================
-- FERMETURE DE L'API PUBLIQUE — review-pilot, 2026-07-25. Ré-exécutable.
--
-- Constat, vérifié en réel depuis Internet avec la seule clé anonyme :
-- 6 tables (users, contacts, subscriptions, review_requests, wheel_configs,
-- wheel_spins) avaient RLS DÉSACTIVÉE, zéro policy, et les droits par défaut
-- de Supabase accordés à anon/authenticated. Autrement dit : n'importe qui
-- connaissant l'URL du projet pouvait lire la table users (password_hash
-- compris) et écrire des lignes. L'insertion de test n'a échoué que sur une
-- contrainte NOT NULL, jamais sur une permission.
--
-- Les tables sont vides aujourd'hui (produit pas encore lancé), donc aucune
-- donnée n'a fuité. À corriger AVANT la mise en service, pas après.
--
-- L'application n'utilise pas l'API REST : elle se connecte en direct avec
-- postgres-js via DATABASE_URL (rôle propriétaire, qui contourne RLS).
-- Fermer PostgREST ne lui retire donc rien.
-- ============================================================

do $$
declare t text;
begin
  foreach t in array array[
    'users', 'contacts', 'subscriptions', 'review_requests', 'wheel_configs', 'wheel_spins'
  ] loop
    if exists (select 1 from information_schema.tables
               where table_schema = 'public' and table_name = t) then
      execute format('alter table public.%I enable row level security', t);
      -- Aucune policy n'est créée : RLS active sans policy = tout refusé pour
      -- anon/authenticated, tout permis pour le rôle propriétaire utilisé par
      -- l'application. C'est exactement le comportement voulu ici.
      execute format('revoke all on public.%I from anon, authenticated', t);
    end if;
  end loop;
end
$$;

-- Retire aussi les droits accordés d'avance aux futures tables : sans ça, la
-- prochaine table créée rouvrira la même porte sans que personne le remarque.
alter default privileges in schema public revoke all on tables from anon, authenticated;
