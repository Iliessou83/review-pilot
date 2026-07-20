import "server-only";
import crypto from "crypto";

// Chiffrement applicatif des jetons stockés en base (businesses.platform_token :
// refresh_token OAuth Google Business Profile, ou clé API Trustpilot saisie à la
// main). AES-256-GCM avec la clé TOKEN_ENCRYPTION_KEY (32 octets, base64 ou hex),
// à générer une seule fois et régler sur Vercel — jamais commitée, jamais générée
// automatiquement par le code :
//   openssl rand -base64 32
//
// Rétrocompatibilité : les jetons déjà en base (saisis avant ce correctif) sont en
// clair, sans préfixe. decryptToken() les reconnaît (pas de préfixe "encv1:") et les
// renvoie tels quels sans tenter de déchiffrer. Ils seront chiffrés à leur prochaine
// écriture (reconnexion Google, nouvelle saisie manuelle).

const ALGO = "aes-256-gcm";
const PREFIX = "encv1:";
const IV_LEN = 12;
const TAG_LEN = 16;

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY manquante. Générez une clé 32 octets (ex: `openssl rand -base64 32`) " +
      "et réglez-la comme variable d'environnement sur Vercel avant de connecter/enregistrer un jeton."
    );
  }
  const key = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY invalide : il faut exactement 32 octets encodés en base64 ou en hex.");
  }
  return key;
}

/** Chiffre un jeton avant écriture en base. Lève si TOKEN_ENCRYPTION_KEY n'est pas réglée. */
export function encryptToken(plain: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

/**
 * Déchiffre un jeton lu en base. Rétrocompatible : une valeur sans le préfixe
 * "encv1:" (jeton legacy en clair, ou clé de chiffrement absente/incorrecte) est
 * renvoyée telle quelle plutôt que de faire planter l'appelant.
 */
export function decryptToken(stored: string): string {
  if (!stored || !stored.startsWith(PREFIX)) return stored;
  try {
    const key = getKey();
    const raw = Buffer.from(stored.slice(PREFIX.length), "base64");
    const iv = raw.subarray(0, IV_LEN);
    const tag = raw.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const ciphertext = raw.subarray(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    // Clé absente/erronée ou donnée corrompue : on ne casse pas l'appelant (connexion
    // Google active) — au pire l'appel API en aval échouera proprement.
    return stored;
  }
}
