-- Migration manuelle : QR code dynamique Caela QR pour chaque roue.
-- Colonne nullable : remplie au premier appel de getOrCreateDynamicQr()
-- (src/lib/caelaQr.ts), jamais recréée ensuite (appel Caela QR unique par roue).
-- À exécuter sur la base review-pilot (Supabase, projet eozuxlzmfblvetkhsvgm).

ALTER TABLE wheel_configs ADD COLUMN IF NOT EXISTS qr_scan_url text;
