#!/bin/bash
CMD_NAME=$1
DURATION=$2

echo "Starting command: $CMD_NAME"
for i in $(seq 1 $DURATION); do
    echo "Processing step $i/$DURATION..."
    sleep 1
done
echo "Command $CMD_NAME completed successfully."
