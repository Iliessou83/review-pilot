-- ---------------------------------------------------------------------------
-- HYGIÈNE SÉCURITÉ A01/A02 (Low) — review-pilot, 2026-07-25
-- ---------------------------------------------------------------------------
-- État LIVE vérifié (Management API, base eozuxlzmfblvetkhsvgm) :
--   Les 11 tables `public` ont TOUTES `relrowsecurity = true` et AUCUNE policy
--   (pg_policies = vide). RLS active + zéro policy = deny-all pour anon/
--   authenticated via PostgREST (SELECT renvoie 0 ligne, INSERT/UPDATE/DELETE
--   refusés). Donc la prise de compte via password_reset_tokens N'EST PAS
--   exploitable : RLS bloque, même si le GRANT anon subsiste.
--
-- Résiduel (dette, non exploitable via REST) : les GRANT par défaut
-- (INSERT/SELECT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER) restent accordés à
-- anon/authenticated sur plusieurs tables (dont password_reset_tokens, users).
-- RLS les neutralise aujourd'hui, mais c'est un privilège mort à supprimer :
-- si quelqu'un désactive RLS ou ajoute une policy permissive un jour, la porte
-- se rouvre en grand. TRUNCATE n'est de toute façon pas soumis à RLS.
--
-- L'app se connecte en direct Postgres (rôle propriétaire) et n'utilise pas la
-- clé anon → révoquer ces grants ne casse rien.
-- Vérif post-fix : `curl "$URL/rest/v1/password_reset_tokens" -H "apikey:$ANON"`
-- → 401/42501 ; le site (login, reset, avis) fonctionne toujours.

do $$
declare t text;
begin
  for t in
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end
$$;

alter default privileges in schema public revoke all on tables from anon, authenticated;
