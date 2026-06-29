#!/bin/bash
# Génère 10 plaques NFC Instagram + 10 TikTok
KEY="AIzaSyB7wr5M7jhuBXYhAptBVP5aPgbRjavdXUs"
GEN="/Users/iliessou/.claude/skills/banana/scripts/generate.py"
IG="/Users/iliessou/Workspace/Projets/review-pilot/plaques-nfc/instagram"
TT="/Users/iliessou/Workspace/Projets/review-pilot/plaques-nfc/tiktok"
mkdir -p "$IG" "$TT"

SIG='At the very bottom edge, small discreet light-grey signature text reading "Caela Reputation". NEVER add any extra text or watermarks beyond the specified phrases. Sharp vector-clean edges, generous negative space, professional graphic design, print-ready.'

# format: RATIO|DIR|NAME|PROMPT
declare -a JOBS=(
# ---------- INSTAGRAM ----------
"2:3|$IG|ig_01_gradient|A flat graphic design for a small NFC follow card on a vibrant Instagram brand gradient background flowing from purple to magenta pink to warm orange. Centered a white rounded-square Instagram camera glyph icon, bold white sans-serif text \"Suivez-nous\" below it, then a white QR code placeholder square with a small white contactless NFC wave icon. Modern social media aesthetic. $SIG"
"2:3|$IG|ig_02_white_minimal|A minimalist flat NFC follow card on a clean pure white background. A colorful Instagram gradient camera glyph icon at the top, bold black sans-serif text \"Suivez-nous\" and smaller magenta text \"Instagram\". A black QR placeholder square low center with a pink NFC wave icon. Apple-clean minimal. $SIG"
"2:3|$IG|ig_03_black_premium|A premium flat NFC follow card on a matte black background with a subtle magenta glow. An Instagram gradient camera glyph icon at top, five no stars, bold white text \"Abonnez-vous\" with a gradient underline, a crisp white QR placeholder square and a glowing pink NFC wave icon. Dark luxury social. $SIG"
"1:1|$IG|ig_04_square_sticker|A square flat sticker design on white with thin rounded border, featuring a large Instagram gradient camera glyph inside a gradient ring, bold dark text \"Suivez-nous\", a small black QR placeholder square and a pink NFC wave icon in the corner. Sticker decal style. $SIG"
"3:4|$IG|ig_05_standee_boutique|A product photograph of a sleek NFC follow standee card on the counter of a stylish fashion boutique, soft blurred warm background. The card shows an Instagram gradient camera glyph, bold text \"Suivez-nous\", a QR placeholder and an NFC wave icon. Commercial product photography, soft lighting, shallow depth of field. $SIG"
"2:3|$IG|ig_06_tap_arrow|A flat NFC follow card on a deep Instagram gradient background. An Instagram camera glyph at top, bold white text \"Suivez notre Insta\", a bright white curved arrow pointing to a glowing NFC wave icon next to the text \"Tap ici\", and a small white QR placeholder square below. Clear call-to-action. $SIG"
"9:16|$IG|ig_07_story_vertical|A tall vertical flat NFC follow card styled like an Instagram story, vibrant gradient background purple pink orange. A white Instagram camera glyph centered top, bold white text \"Suivez-nous\", a white username placeholder pill reading \"@votrepseudo\", a white QR placeholder square and an NFC wave icon. Story aesthetic. $SIG"
"2:3|$IG|ig_08_pastel_soft|A flat NFC follow card on a soft warm beige pastel background with gentle rounded shapes, friendly cafe vibe. An Instagram gradient camera glyph, rounded dark text \"Suivez-nous\", a rounded QR placeholder square and a soft pink NFC wave icon. Approachable friendly. $SIG"
"3:4|$IG|ig_09_acrylic_block|A product photograph of a transparent frosted acrylic NFC block on a minimalist white desk, the block displays an Instagram gradient camera glyph, bold dark text \"Suivez-nous\", a QR placeholder and an NFC wave icon embedded inside. Premium commercial product photography, bright soft lighting. $SIG"
"2:3|$IG|ig_10_glass_card|A flat NFC follow card with an Instagram gradient background and a frosted glassmorphism panel floating in the center. On the glass: a white Instagram camera glyph, bold white text \"Abonnez-vous\", a white QR placeholder square and a glowing NFC wave icon. Modern premium glass aesthetic. $SIG"
# ---------- TIKTOK ----------
"2:3|$TT|tt_01_neon_black|A flat NFC follow card on a deep black background with TikTok signature neon glitch accents in cyan and red. A white TikTok musical note logo at top, bold white text \"Suivez-nous\" with a cyan-red duotone glitch shadow, a crisp white QR placeholder square and a glowing cyan NFC wave icon. Modern TikTok aesthetic. $SIG"
"2:3|$TT|tt_02_white_minimal|A minimalist flat NFC follow card on a clean white background. A black TikTok musical note logo with subtle cyan and red offset at top, bold black text \"Suivez-nous\" and smaller text \"TikTok\". A black QR placeholder square low center with a cyan NFC wave icon. Apple-clean minimal. $SIG"
"2:3|$TT|tt_03_duotone_bold|A bold flat NFC follow card with a strong cyan and red duotone split background. A white TikTok musical note logo centered, bold white text \"Abonnez-vous\", a white QR placeholder square and a white NFC wave icon. Energetic Gen-Z social design. $SIG"
"1:1|$TT|tt_04_square_sticker|A square flat sticker on black with a thin rounded cyan border, a TikTok musical note logo inside a glowing circle, bold white text \"Suivez-nous\", a small white QR placeholder square and a red NFC wave icon in the corner. Sticker decal style. $SIG"
"3:4|$TT|tt_05_standee_shop|A product photograph of a sleek black NFC follow standee on the counter of a trendy modern shop, soft blurred background. The card shows a white TikTok musical note logo, bold text \"Suivez-nous\", a QR placeholder and a cyan NFC wave icon. Commercial product photography, soft lighting, shallow depth of field. $SIG"
"2:3|$TT|tt_06_tap_arrow|A flat NFC follow card on a matte black background with cyan-red TikTok accents. A TikTok musical note logo at top, bold white text \"Suivez notre TikTok\", a bright cyan curved arrow pointing to a glowing NFC wave icon next to the text \"Tap ici\", and a small white QR placeholder square below. Clear call-to-action. $SIG"
"9:16|$TT|tt_07_story_vertical|A tall vertical flat NFC follow card styled like a TikTok screen, black background with cyan and red glow. A white TikTok musical note logo centered top, bold white text \"Suivez-nous\", a white username placeholder pill reading \"@votrepseudo\", a white QR placeholder square and an NFC wave icon. Full-screen vertical aesthetic. $SIG"
"2:3|$TT|tt_08_glitch_premium|A premium flat NFC follow card on a deep black background with a refined subtle cyan glitch line accent. A white TikTok musical note logo at top, bold elegant white text \"Abonnez-vous\", a crisp white QR placeholder square and a refined cyan NFC wave icon. Dark premium minimal. $SIG"
"1:1|$TT|tt_09_circle_badge|A square flat design on black featuring a circular cyan-and-red gradient badge in the center with a white TikTok musical note logo inside and curved text \"Suivez-nous\" around it, a small white QR placeholder square below and a cyan NFC wave icon. Emblem badge style. $SIG"
"3:4|$TT|tt_10_acrylic_block|A product photograph of a transparent frosted acrylic NFC block on a dark minimalist desk with cyan ambient light, the block displays a white TikTok musical note logo, bold text \"Suivez-nous\", a QR placeholder and an NFC wave icon embedded inside. Premium commercial product photography. $SIG"
)

i=0; total=${#JOBS[@]}
for entry in "${JOBS[@]}"; do
  i=$((i+1))
  RATIO="${entry%%|*}"; rest="${entry#*|}"
  DIR="${rest%%|*}"; rest="${rest#*|}"
  NAME="${rest%%|*}"; PROMPT="${rest#*|}"
  echo ">>> [$i/$total] $NAME ($RATIO)"
  RES=$(python3 "$GEN" --api-key "$KEY" --aspect-ratio "$RATIO" --resolution "2K" --prompt "$PROMPT" 2>&1)
  SRC=$(echo "$RES" | python3 -c "import sys,json
try:
  d=json.load(sys.stdin); print(d.get('path',''))
except: print('')" 2>/dev/null)
  if [ -n "$SRC" ] && [ -f "$SRC" ]; then
    cp "$SRC" "$DIR/$NAME.png"; echo "    OK -> $NAME.png"
  else
    echo "    FAIL: $RES"
  fi
  sleep 2
done
echo "=== TERMINE: IG=$(ls -1 $IG/*.png 2>/dev/null | wc -l) TikTok=$(ls -1 $TT/*.png 2>/dev/null | wc -l) ==="
