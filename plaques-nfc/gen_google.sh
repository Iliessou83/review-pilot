#!/bin/bash
# Génère 19 plaques NFC Google supplémentaires (la #01 = test déjà validée)
KEY="AIzaSyB7wr5M7jhuBXYhAptBVP5aPgbRjavdXUs"
GEN="/Users/iliessou/.claude/skills/banana/scripts/generate.py"
OUT="/Users/iliessou/Workspace/Projets/review-pilot/plaques-nfc/google"
mkdir -p "$OUT"

# Copier la #01 validée
cp "/Users/iliessou/Documents/nanobanana_generated/banana_20260613_032413_084598.png" "$OUT/plaque_01_dark_emerald.png" 2>/dev/null

SIG='At the very bottom edge, small discreet light-grey signature text reading "Caela Reputation". NEVER add any extra text or watermarks beyond the specified phrases. Sharp vector-clean edges, generous negative space, professional graphic design, print-ready.'

declare -a PROMPTS=(
"2:3|plaque_02_white_minimal|A minimalist flat graphic design for a small NFC review card on a pure clean white background. At the top a horizontal row of five solid gold five-pointed stars evenly spaced. Below, bold black sans-serif text reading \"Avis Google\" where the word Google uses the four Google brand colors blue red yellow green. In the lower center a crisp black QR code placeholder square with rounded corners, and to its right a small blue contactless NFC wave icon. Apple-clean minimalism, soft drop shadow. $SIG"
"3:2|plaque_03_horizontal|A horizontal landscape flat design for a small NFC review counter card on a soft light-grey background. On the left side a vertical stack of five gold stars and bold dark text \"Avis Google\" with Google brand colors on the word Google. On the right side a clean black QR code placeholder square next to a small metallic NFC wave icon. Balanced two-column layout. $SIG"
"2:3|plaque_04_google_blue|A flat graphic design for an NFC review card on a deep Google-blue background. A horizontal row of five bright gold stars at the top. Bold white sans-serif text \"Votre avis compte\" in the upper middle. A white rounded QR code placeholder square centered below, with a small white NFC wave icon beside it. Confident corporate look. $SIG"
"2:3|plaque_05_kraft_warm|A flat graphic design for an NFC review card on a warm kraft beige paper texture background, friendly cafe and bakery vibe. Five gold stars at top, warm brown sans-serif text \"Laissez un avis\" and below it smaller multicolor Google brand text \"Google\". A dark QR placeholder square low center with a small NFC wave icon. Cozy artisanal feel. $SIG"
"2:3|plaque_06_gradient_glass|A flat graphic design for an NFC review card with a smooth diagonal gradient background flowing through Google brand blue green yellow and red, with a frosted glassmorphism card panel floating in the center. Five white-gold stars on the glass panel, bold white text \"Avis Google\", a white QR placeholder square and a glowing NFC wave icon. Modern premium tech aesthetic. $SIG"
"2:3|plaque_07_tap_arrow|A flat graphic design for an NFC review card on a matte black background. Five gold stars at top, bold white text \"Avis Google\" with Google colors on Google. A bright emerald curved arrow pointing down toward a glowing contactless NFC wave icon next to the text \"Tap ici\". A small white QR placeholder square below. Clear call-to-action psychology. $SIG"
"1:1|plaque_08_round_badge|A square flat graphic sticker design on a dark anthracite background featuring a circular golden badge in the center. Inside the badge a colorful Google G logo and a ring of five gold stars around it, with the curved text \"Avis Google\". A small white QR placeholder square below the badge and a tiny NFC wave icon. Emblem badge style. $SIG"
"2:3|plaque_09_gold_frame|A luxury flat graphic design for an NFC review card on a black background framed by a thin elegant gold border line. Five gold stars at the top, refined white serif-influenced text \"Notez-nous\" and smaller multicolor \"Google\" beneath. A white QR placeholder square low center with a gold NFC wave icon. High-end boutique luxury. $SIG"
"2:3|plaque_10_big_g|A flat graphic design for an NFC review card on a clean white background featuring a large colorful Google G logo prominently at the top center, with five gold stars beneath it. Bold dark text \"Laissez un avis\". A black QR placeholder square at the bottom with a blue NFC wave icon. Bright friendly modern. $SIG"
"3:4|plaque_11_counter_standee|A product photograph of a sleek black acrylic NFC review table standee sitting on a warm wooden cafe counter, soft blurred background. The standee card prominently shows five gold stars, bold white text \"Avis Google\" with Google brand colors, a white QR code placeholder and an NFC wave icon. Commercial product photography, soft studio lighting, shallow depth of field. Wallpaper magazine product editorial. $SIG"
"2:3|plaque_12_neon_emerald|A flat graphic design for an NFC review card on a deep black background with subtle emerald neon glow accents. Five glowing gold stars at top, bold white text \"5 etoiles ?\" and smaller multicolor \"Avis Google\". A white QR placeholder square with an emerald glowing NFC wave icon beside it. Modern nightlife tech vibe. $SIG"
"2:3|plaque_13_phone_tap|A flat graphic design for an NFC review card on a dark anthracite background showing a simple line illustration of a smartphone approaching a glowing contactless NFC wave icon in the center. Five gold stars at top, bold white text \"Approchez votre tel\". A small Google-colored G logo and a white QR placeholder square at the bottom. Instructional clean. $SIG"
"2:3|plaque_14_pastel_soft|A flat graphic design for an NFC review card on a soft pastel light background with gentle rounded shapes. Five soft gold stars at top, friendly rounded dark text \"Votre avis compte\" with multicolor Google brand accents. A rounded QR placeholder square and a small NFC wave icon. Approachable warm friendly design. $SIG"
"1:1|plaque_15_square_sticker|A square flat sticker design on a white background with a thin rounded border. Five gold stars across the top, bold black text \"Avis Google\" with Google brand colors on Google in the middle, a centered black QR placeholder square at the bottom and a small blue NFC wave icon in a corner. Sticker decal style. $SIG"
"3:4|plaque_16_acrylic_block|A product photograph of a transparent frosted acrylic NFC review block standing on a clean minimalist white reception desk. The block displays five gold stars, bold dark text \"Avis Google\" with Google colors, a QR code placeholder and an NFC wave icon embedded in the acrylic. Premium commercial product photography, bright soft lighting. Architectural Digest product feature. $SIG"
"2:3|plaque_17_monoline|A flat graphic design for an NFC review card on a deep navy background using a clean monoline line-art style. Five outlined gold stars at top, thin elegant white line-art text \"Avis Google\" with Google colors, a line-art QR placeholder frame and a monoline NFC wave icon. Minimal modern line illustration. $SIG"
"2:3|plaque_18_gold_foil|A flat graphic design for an NFC review card on a rich dark navy background with luxurious gold foil texture accents. Five metallic gold foil stars prominently at top, elegant gold text \"Merci de votre visite\" and smaller multicolor \"Avis Google\". A white QR placeholder square low center with a gold NFC wave icon. Opulent premium foil aesthetic. $SIG"
"2:3|plaque_19_review_snippet|A flat graphic design for an NFC review card on a clean white background styled like a Google review interface card. A small colorful Google G logo top-left, five gold stars in a row and bold dark text \"Excellent\". Below, the prompt text \"Laissez votre avis\" and a black QR placeholder square with a blue NFC wave icon. UI snippet card style. $SIG"
"2:3|plaque_20_black_gold_premium|A flat graphic design for an NFC review card on a matte black background with a single thin emerald accent line. Five gold stars centered at top, bold elegant white text \"Avis Google\" with the four Google brand colors on the word Google, a crisp white QR placeholder square and a refined silver NFC wave icon. Ultra premium minimal dark luxury. $SIG"
)

i=0
for entry in "${PROMPTS[@]}"; do
  i=$((i+1))
  RATIO="${entry%%|*}"
  rest="${entry#*|}"
  NAME="${rest%%|*}"
  PROMPT="${rest#*|}"
  echo ">>> [$i/19] $NAME ($RATIO)"
  RES=$(python3 "$GEN" --api-key "$KEY" --aspect-ratio "$RATIO" --resolution "2K" --prompt "$PROMPT" 2>&1)
  SRC=$(echo "$RES" | python3 -c "import sys,json;
try:
  d=json.load(sys.stdin); print(d.get('path',''))
except: print('')" 2>/dev/null)
  if [ -n "$SRC" ] && [ -f "$SRC" ]; then
    cp "$SRC" "$OUT/$NAME.png"
    echo "    OK -> $NAME.png"
  else
    echo "    FAIL: $RES"
  fi
  sleep 2
done
echo "=== TERMINE: $(ls -1 $OUT/*.png | wc -l) plaques dans $OUT ==="
