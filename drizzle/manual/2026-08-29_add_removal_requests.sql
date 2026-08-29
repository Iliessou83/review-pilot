-- Formulaire guidé "Signaler un avis" (/signaler-avis), remplace le mailto
-- direct : on sait dès la réception si l'accès GMB est déjà là ou s'il faut
-- guider le client pour nous ajouter comme Gérant.
CREATE TABLE IF NOT EXISTS removal_requests (
  id serial PRIMARY KEY,
  business_name text NOT NULL,
  contact_email text NOT NULL,
  review_author text NOT NULL,
  review_text text NOT NULL,
  reason text NOT NULL,
  reason_detail text,
  has_gmb_access text NOT NULL,
  gmb_listing_url text,
  status text NOT NULL DEFAULT 'nouveau',
  created_at timestamp NOT NULL DEFAULT now()
);
