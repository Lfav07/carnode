#!/bin/sh
set -e

KC_URL="${KC_URL:-http://keycloak:8080}"
KC_ADMIN="${KC_ADMIN:-admin}"
KC_ADMIN_PASS="${KC_ADMIN_PASS:-admin}"
KC_REALM="${KC_REALM:-carnode}"
KC_CLIENT_ID="${KC_CLIENT_ID:-user-service}"
KC_CLIENT_SECRET="${KC_CLIENT_SECRET:-J529zbiOM91EWc2kkkReqXeCjc6gkptKZyxBXQs1K4tBb7ISKkVcaVbKF5clehzaFTC38E5AT9kLk7w2m44OlW}"
FRONTEND_CLIENT_ID="${FRONTEND_CLIENT_ID:-react-frontend}"

admin_token() {
  curl -s -X POST "${KC_URL}/realms/master/protocol/openid-connect/token" \
    -d "client_id=admin-cli" \
    -d "username=${KC_ADMIN}" \
    -d "password=${KC_ADMIN_PASS}" \
    -d "grant_type=password" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4 || true
}

realm_exists() {
  curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${KC_REALM}"
}

create_realm() {
  echo "[keycloak-init] Creating realm ${KC_REALM}..."
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${KC_URL}/admin/realms" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "realm": "'"${KC_REALM}"'",
      "enabled": true,
      "registrationAllowed": true,
      "loginWithEmailAllowed": true,
      "duplicateEmailsAllowed": false,
      "resetPasswordAllowed": true,
      "editUsernameAllowed": false,
      "bruteForceProtected": false
    }' || true
  echo ""
}

client_exists() {
  local client_id="$1"
  count=$(curl -s \
    -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${KC_REALM}/clients?clientId=${client_id}" | grep -o '"clientId"' | wc -l || true)
  [ "$count" -gt 0 ]
}

create_backend_client() {
  echo "[keycloak-init] Creating client ${KC_CLIENT_ID} (confidential)..."
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${KC_URL}/admin/realms/${KC_REALM}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "'"${KC_CLIENT_ID}"'",
      "enabled": true,
      "protocol": "openid-connect",
      "publicClient": false,
      "secret": "'"${KC_CLIENT_SECRET}"'",
      "directAccessGrantsEnabled": true,
      "serviceAccountsEnabled": true,
      "redirectUris": ["http://localhost:3000/*"],
      "webOrigins": ["http://localhost:3000"]
    }' || true
  echo ""
}

create_frontend_client() {
  echo "[keycloak-init] Creating client ${FRONTEND_CLIENT_ID} (public)..."
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${KC_URL}/admin/realms/${KC_REALM}/clients" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "'"${FRONTEND_CLIENT_ID}"'",
      "enabled": true,
      "protocol": "openid-connect",
      "publicClient": true,
      "directAccessGrantsEnabled": true,
      "redirectUris": [
        "http://localhost:5173/*",
        "http://localhost:80/*"
      ],
      "webOrigins": [
        "http://localhost:5173",
        "http://localhost:80"
      ]
    }' || true
  echo ""
}

role_exists() {
  local role_name="$1"
  count=$(curl -s \
    -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${KC_REALM}/roles/${role_name}" -o /dev/null -w "%{http_code}")
  [ "$count" = "200" ]
}

create_role() {
  local role_name="$1"
  local description="$2"
  echo "[keycloak-init] Creating role ${role_name}..."
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${KC_URL}/admin/realms/${KC_REALM}/roles" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "'"${role_name}"'",
      "description": "'"${description}"'"
    }' || true
  echo ""
}

assign_realm_role_to_client() {
  local client_uuid="$1"
  local role_name="$2"
  echo "[keycloak-init] Assigning role ${role_name} to service account..."
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${KC_URL}/admin/realms/${KC_REALM}/clients/${client_uuid}/role-mappings/realm" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '[{"name": "'"${role_name}"'"}]' || true
  echo ""
}

get_service_account_user() {
  curl -s \
    -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${KC_REALM}/clients/${CLIENT_UUID}/service-account-user" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || true
}

assign_role_to_user() {
  local user_id="$1"
  local role_name="$2"
  echo "[keycloak-init] Assigning role ${role_name} to user..."
  curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${KC_URL}/admin/realms/${KC_REALM}/users/${user_id}/role-mappings/realm" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '[{"name": "'"${role_name}"'"}]' || true
  echo ""
}

get_client_uuid() {
  curl -s \
    -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${KC_REALM}/clients?clientId=${KC_CLIENT_ID}" | grep -o '"uuid":"[^"]*"' | head -1 | cut -d'"' -f4 || true
}

user_exists() {
  local email="$1"
  count=$(curl -s \
    -H "Authorization: Bearer ${TOKEN}" \
    "${KC_URL}/admin/realms/${KC_REALM}/users?email=${email}" | grep -o '"id"' | wc -l || true)
  [ "$count" -gt 0 ]
}

create_user() {
  local email="$1"
  local password="$2"
  local role="$3"

  echo "[keycloak-init] Creating user ${email}..."
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "${KC_URL}/admin/realms/${KC_REALM}/users" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "'"${email}"'",
      "username": "'"${email}"'",
      "enabled": true,
      "emailVerified": true,
      "credentials": [
        {
          "type": "password",
          "value": "'"${password}"'",
          "temporary": false
        }
      ]
    }' || true)
  echo "${http_code}"

  if [ "$http_code" = "201" ]; then
    user_id=$(curl -s \
      -H "Authorization: Bearer ${TOKEN}" \
      "${KC_URL}/admin/realms/${KC_REALM}/users?email=${email}" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || true)

    if [ -n "$user_id" ]; then
      assign_role_to_user "$user_id" "$role"
    fi
  fi
}

# --- Wait for Keycloak ---
echo "[keycloak-init] Waiting for Keycloak to be ready..."
until curl -sf "${KC_URL}/realms/master" > /dev/null 2>&1; do
  sleep 2
done
echo "[keycloak-init] Keycloak is ready"

# --- Get admin token ---
TOKEN=$(admin_token)
if [ -z "$TOKEN" ]; then
  echo "[keycloak-init] Failed to obtain admin token"
  exit 1
fi
echo "[keycloak-init] Admin token obtained"

# --- Idempotency check ---
http_code=$(realm_exists)
if [ "$http_code" = "200" ]; then
  echo "[keycloak-init] Realm ${KC_REALM} already exists, skipping setup"
  exit 0
fi

# --- Create realm ---
create_realm

# --- Create clients ---
create_backend_client
create_frontend_client

# --- Create roles ---
create_role "admin" "Administrator role"
create_role "user" "Regular user role"

# --- Get backend client UUID and assign admin role to service account ---
CLIENT_UUID=$(get_client_uuid)
if [ -n "$CLIENT_UUID" ]; then
  SA_USER_ID=$(get_service_account_user)
  if [ -n "$SA_USER_ID" ]; then
    assign_realm_role_to_client "$CLIENT_UUID" "admin"
    echo "[keycloak-init] Service account configured with admin role"
  fi
fi

# --- Create users ---
create_user "admin@carnode.com" "admin" "admin"
create_user "user@carnode.com" "user" "user"

echo "[keycloak-init] Setup complete"
