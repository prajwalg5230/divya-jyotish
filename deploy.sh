#!/data/data/com.termux/files/usr/bin/env bash
# ========================================================
# Divya Jyotish - Automated Cloudflare Pages Deployer
# ========================================================
set -e

# Load Cloudflare credentials securely from user config
CF_CONFIG_FILE="$HOME/.config/cloudflare/salakaar.env"
if [ -f "$CF_CONFIG_FILE" ]; then
  # shellcheck source=/dev/null
  source "$CF_CONFIG_FILE"
fi

PROJECT_NAME="divya-jyotish"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🚀 Deploying $PROJECT_NAME to Cloudflare Pages..."
CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}" \
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}" \
npx wrangler pages deploy . --project-name="$PROJECT_NAME" --branch=main

echo ""
echo "✨ Successfully deployed!"
echo "🔗 Live URL: https://divya-jyotish.pages.dev"
