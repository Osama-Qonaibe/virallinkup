#!/bin/bash
# ViralLinkUp Dev Server Startup Script
cd /home/z/my-project

# Kill any existing processes on port 3000
fuser -k 3000/tcp 2>/dev/null
sleep 1

# Clear old logs
> dev.log

# Start dev server
node node_modules/.bin/next dev -p 3000 > dev.log 2>&1 &
DEV_PID=$!
echo "Dev server PID: $DEV_PID"
echo $DEV_PID > /tmp/virallinkup.pid

# Wait for server to be ready
for i in $(seq 1 30); do
  sleep 1
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
    echo "Server is ready at http://localhost:3000"
    exit 0
  fi
  if ! kill -0 $DEV_PID 2>/dev/null; then
    echo "ERROR: Server process died. Check dev.log:"
    tail -20 dev.log
    exit 1
  fi
done

echo "WARNING: Server may not be responding. Last log:"
tail -10 dev.log
