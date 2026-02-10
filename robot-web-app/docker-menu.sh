#!/bin/bash

# Quick Docker Operations Script
# Simplified commands for common Docker operations

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Docker Quick Operations Menu  ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "1. Build Docker Image (docker-compose build)"
echo "2. Save Image to Tar File (compressed)"
echo "3. Build + Save (All in one)"
echo "4. Load Image from Tar File"
echo "5. Run Container (docker-compose up)"
echo "6. Stop Container (docker-compose down)"
echo "7. View Logs (docker-compose logs)"
echo "8. Show Image Info"
echo "9. Clean Tar Files"
echo "0. Exit"
echo ""
echo -e "${YELLOW}Enter your choice [0-9]:${NC} "
read -r choice

case $choice in
    1)
        echo -e "${GREEN}Building Docker image...${NC}"
        docker-compose build
        ;;
    2)
        echo -e "${GREEN}Saving image to compressed tar file...${NC}"
        ./docker-save-load.sh save-compressed
        ;;
    3)
        echo -e "${GREEN}Building and saving image...${NC}"
        ./docker-save-load.sh all
        ;;
    4)
        echo -e "${GREEN}Loading image from tar file...${NC}"
        ./docker-save-load.sh load-compressed
        ;;
    5)
        echo -e "${GREEN}Starting container...${NC}"
        docker-compose up -d
        echo ""
        echo -e "${GREEN}Container started! Access at: http://localhost:8000${NC}"
        ;;
    6)
        echo -e "${GREEN}Stopping container...${NC}"
        docker-compose down
        ;;
    7)
        echo -e "${GREEN}Showing logs (Press Ctrl+C to exit)...${NC}"
        docker-compose logs -f
        ;;
    8)
        echo -e "${GREEN}Showing image information...${NC}"
        ./docker-save-load.sh info
        ;;
    9)
        echo -e "${GREEN}Cleaning tar files...${NC}"
        ./docker-save-load.sh clean
        ;;
    0)
        echo -e "${GREEN}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Operation completed!${NC}"
