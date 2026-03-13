#!/bin/bash

# Keep-alive script to prevent backend cold starts
# This script pings the backend every 5 minutes

BACKEND_URL="https://git-push-hub.preview.emergentagent.com/api/health"
LOG_FILE="/tmp/keepalive.log"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>&1)
    
    if [ "$RESPONSE" = "200" ]; then
        echo "[$TIMESTAMP] Backend is alive (HTTP $RESPONSE)" >> "$LOG_FILE"
    else
        echo "[$TIMESTAMP] Backend check failed (HTTP $RESPONSE)" >> "$LOG_FILE"
    fi
    
    tail -n 100 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
    
    sleep 300
done
