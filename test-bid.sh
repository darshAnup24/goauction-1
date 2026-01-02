#!/bin/bash

# Test bid placement
echo "Testing bid placement..."

# First, login to get a token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: ${TOKEN:0:20}..."

# Get a listing ID
echo -e "\n2. Getting listings..."
LISTINGS=$(curl -s http://localhost:5000/api/listings)
LISTING_ID=$(echo $LISTINGS | jq -r '.listings[0].id')
echo "Listing ID: $LISTING_ID"

# Get listing details
echo -e "\n3. Getting listing details..."
LISTING=$(curl -s http://localhost:5000/api/listings/$LISTING_ID)
echo $LISTING | jq '{id: .listing.id, title: .listing.title, currentBid: .listing.currentBid, status: .listing.status, endTime: .listing.endTime}'

# Place a bid
echo -e "\n4. Placing bid..."
BID_RESPONSE=$(curl -s -X POST http://localhost:5000/api/bids/place \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"listingId\":\"$LISTING_ID\",\"amount\":100}")

echo "Response:"
echo $BID_RESPONSE | jq '.'

# Check if successful
if echo $BID_RESPONSE | jq -e '.success' > /dev/null; then
  echo -e "\n✅ Bid placed successfully!"
else
  echo -e "\n❌ Bid placement failed!"
  echo "Error: $(echo $BID_RESPONSE | jq -r '.error // .message')"
fi
