#!/usr/bin/env bash
set -euo pipefail

# UtsavAI — GCP Cloud Run bootstrap script
# Usage: GCP_PROJECT=my-project REGION=asia-south1 bash scripts/gcp-bootstrap.sh

PROJECT="${GCP_PROJECT:?Set GCP_PROJECT}"
REGION="${REGION:-asia-south1}"
SERVICE="utsavai"
DB_NAME="utsavai"
SA_NAME="utsavai-runner"
REPO="utsavai"

echo "==> Setting project to $PROJECT"
gcloud config set project "$PROJECT"

echo "==> Enabling APIs"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com

echo "==> Creating Artifact Registry repo"
gcloud artifacts repositories describe "$REPO" --location="$REGION" 2>/dev/null || \
  gcloud artifacts repositories create "$REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="UtsavAI container images"

echo "==> Creating Firestore database (if not exists)"
gcloud firestore databases describe --database="$DB_NAME" 2>/dev/null || \
  gcloud firestore databases create \
    --database="$DB_NAME" \
    --location="$REGION" \
    --type=firestore-native

echo "==> Creating service account"
gcloud iam service-accounts describe "${SA_NAME}@${PROJECT}.iam.gserviceaccount.com" 2>/dev/null || \
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="UtsavAI Cloud Run SA"

SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"

echo "==> Granting roles"
for ROLE in roles/datastore.user roles/aiplatform.user; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" \
    --condition=None \
    --quiet
done

IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${SERVICE}"

echo "==> Building container image"
gcloud builds submit \
  --tag "${IMAGE}:latest" \
  --timeout=600s

echo "==> Deploying to Cloud Run"
gcloud run deploy "$SERVICE" \
  --image="${IMAGE}:latest" \
  --region="$REGION" \
  --service-account="$SA_EMAIL" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --timeout=60s \
  --set-env-vars="NODE_ENV=production,FIRESTORE_DATABASE=${DB_NAME},GCP_PROJECT=${PROJECT}"

echo "==> Fetching service URL"
URL=$(gcloud run services describe "$SERVICE" --region="$REGION" --format='value(status.url)')
echo ""
echo "========================================"
echo "  UtsavAI deployed: $URL"
echo "========================================"
