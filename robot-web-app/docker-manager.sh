#!/bin/bash

# Robot Control Web - Docker Management Script
# This script helps you build, save, and load Docker images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

IMAGE_NAME="robot-control-web"
IMAGE_TAG="latest"
TAR_FILE="${IMAGE_NAME}.tar"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🐳 Robot Control Web - Docker Manager${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to show menu
show_menu() {
    echo -e "${YELLOW}Select an option:${NC}"
    echo "1. Build Docker image"
    echo "2. Save Docker image to TAR file"
    echo "3. Load Docker image from TAR file"
    echo "4. Run container with docker-compose"
    echo "5. Stop container"
    echo "6. View container logs"
    echo "7. Build and Save (1 + 2)"
    echo "8. Complete workflow (Build → Save → Run)"
    echo "9. Exit"
    echo ""
    read -p "Enter your choice [1-9]: " choice
}

# Function to build Docker image
build_image() {
    echo -e "${GREEN}📦 Building Docker image...${NC}"
    docker-compose build
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
    echo -e "${BLUE}Image: ${IMAGE_NAME}:${IMAGE_TAG}${NC}"
}

# Function to save Docker image to tar
save_image() {
    echo -e "${GREEN}💾 Saving Docker image to TAR file...${NC}"
    docker save ${IMAGE_NAME}:${IMAGE_TAG} -o ${TAR_FILE}
    
    if [ -f "${TAR_FILE}" ]; then
        FILE_SIZE=$(du -h ${TAR_FILE} | cut -f1)
        echo -e "${GREEN}✅ Docker image saved successfully!${NC}"
        echo -e "${BLUE}File: ${TAR_FILE}${NC}"
        echo -e "${BLUE}Size: ${FILE_SIZE}${NC}"
    else
        echo -e "${RED}❌ Failed to save Docker image${NC}"
        exit 1
    fi
}

# Function to load Docker image from tar
load_image() {
    if [ ! -f "${TAR_FILE}" ]; then
        echo -e "${RED}❌ TAR file not found: ${TAR_FILE}${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}📥 Loading Docker image from TAR file...${NC}"
    docker load -i ${TAR_FILE}
    echo -e "${GREEN}✅ Docker image loaded successfully!${NC}"
}

# Function to run container
run_container() {
    echo -e "${GREEN}🚀 Starting container with docker-compose...${NC}"
    docker-compose up -d
    echo -e "${GREEN}✅ Container started successfully!${NC}"
    echo -e "${BLUE}Access the UI at: http://localhost:8000${NC}"
    echo ""
    echo -e "${YELLOW}View logs with: docker-compose logs -f${NC}"
}

# Function to stop container
stop_container() {
    echo -e "${YELLOW}⏹️  Stopping container...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Container stopped${NC}"
}

# Function to view logs
view_logs() {
    echo -e "${GREEN}📋 Viewing container logs (Ctrl+C to exit)...${NC}"
    docker-compose logs -f
}

# Main script
while true; do
    show_menu
    
    case $choice in
        1)
            build_image
            ;;
        2)
            save_image
            ;;
        3)
            load_image
            ;;
        4)
            run_container
            ;;
        5)
            stop_container
            ;;
        6)
            view_logs
            ;;
        7)
            build_image
            save_image
            ;;
        8)
            build_image
            save_image
            run_container
            ;;
        9)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    read -p "Press Enter to continue..."
    clear
done
