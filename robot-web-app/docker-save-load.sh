#!/bin/bash

# Docker Image Save/Load Script
# This script helps you build, save, and load Docker images

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="robot-control-web"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"
TAR_FILE="${IMAGE_NAME}.tar"
COMPRESSED_TAR_FILE="${IMAGE_NAME}.tar.gz"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  build           - Build Docker image using docker-compose"
    echo "  save            - Save Docker image to tar file"
    echo "  save-compressed - Save Docker image to compressed tar.gz file"
    echo "  load            - Load Docker image from tar file"
    echo "  load-compressed - Load Docker image from compressed tar.gz file"
    echo "  all             - Build and save image (default)"
    echo "  info            - Show image information"
    echo "  clean           - Remove tar files"
    echo "  help            - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all                    # Build and save image"
    echo "  $0 build                  # Only build image"
    echo "  $0 save-compressed        # Save as compressed tar.gz"
    echo "  $0 load                   # Load from tar file"
}

# Function to build Docker image
build_image() {
    print_info "Building Docker image using docker-compose..."
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found!"
        exit 1
    fi
    
    docker-compose build
    
    print_success "Docker image built successfully: ${FULL_IMAGE_NAME}"
    docker images | grep "${IMAGE_NAME}" | head -1
}

# Function to save Docker image to tar file
save_image() {
    print_info "Saving Docker image to tar file..."
    
    # Check if image exists
    if ! docker images | grep -q "${IMAGE_NAME}"; then
        print_error "Image ${FULL_IMAGE_NAME} not found. Please build it first."
        exit 1
    fi
    
    print_info "Saving ${FULL_IMAGE_NAME} to ${TAR_FILE}..."
    docker save "${FULL_IMAGE_NAME}" -o "${TAR_FILE}"
    
    # Get file size
    FILE_SIZE=$(du -h "${TAR_FILE}" | cut -f1)
    
    print_success "Image saved successfully!"
    print_info "File: ${TAR_FILE}"
    print_info "Size: ${FILE_SIZE}"
    
    # Show checksum
    print_info "Calculating SHA256 checksum..."
    sha256sum "${TAR_FILE}" > "${TAR_FILE}.sha256"
    print_success "Checksum saved to ${TAR_FILE}.sha256"
}

# Function to save Docker image to compressed tar.gz file
save_image_compressed() {
    print_info "Saving Docker image to compressed tar.gz file..."
    
    # Check if image exists
    if ! docker images | grep -q "${IMAGE_NAME}"; then
        print_error "Image ${FULL_IMAGE_NAME} not found. Please build it first."
        exit 1
    fi
    
    print_info "Saving and compressing ${FULL_IMAGE_NAME} to ${COMPRESSED_TAR_FILE}..."
    docker save "${FULL_IMAGE_NAME}" | gzip > "${COMPRESSED_TAR_FILE}"
    
    # Get file sizes
    COMPRESSED_SIZE=$(du -h "${COMPRESSED_TAR_FILE}" | cut -f1)
    
    print_success "Image saved and compressed successfully!"
    print_info "File: ${COMPRESSED_TAR_FILE}"
    print_info "Compressed Size: ${COMPRESSED_SIZE}"
    
    # Show checksum
    print_info "Calculating SHA256 checksum..."
    sha256sum "${COMPRESSED_TAR_FILE}" > "${COMPRESSED_TAR_FILE}.sha256"
    print_success "Checksum saved to ${COMPRESSED_TAR_FILE}.sha256"
}

# Function to load Docker image from tar file
load_image() {
    print_info "Loading Docker image from tar file..."
    
    if [ ! -f "${TAR_FILE}" ]; then
        print_error "Tar file ${TAR_FILE} not found!"
        exit 1
    fi
    
    # Verify checksum if available
    if [ -f "${TAR_FILE}.sha256" ]; then
        print_info "Verifying checksum..."
        if sha256sum -c "${TAR_FILE}.sha256"; then
            print_success "Checksum verified!"
        else
            print_error "Checksum verification failed!"
            exit 1
        fi
    fi
    
    print_info "Loading image from ${TAR_FILE}..."
    docker load -i "${TAR_FILE}"
    
    print_success "Image loaded successfully!"
    docker images | grep "${IMAGE_NAME}" | head -1
}

# Function to load Docker image from compressed tar.gz file
load_image_compressed() {
    print_info "Loading Docker image from compressed tar.gz file..."
    
    if [ ! -f "${COMPRESSED_TAR_FILE}" ]; then
        print_error "Compressed tar file ${COMPRESSED_TAR_FILE} not found!"
        exit 1
    fi
    
    # Verify checksum if available
    if [ -f "${COMPRESSED_TAR_FILE}.sha256" ]; then
        print_info "Verifying checksum..."
        if sha256sum -c "${COMPRESSED_TAR_FILE}.sha256"; then
            print_success "Checksum verified!"
        else
            print_error "Checksum verification failed!"
            exit 1
        fi
    fi
    
    print_info "Loading and decompressing image from ${COMPRESSED_TAR_FILE}..."
    gunzip -c "${COMPRESSED_TAR_FILE}" | docker load
    
    print_success "Image loaded successfully!"
    docker images | grep "${IMAGE_NAME}" | head -1
}

# Function to show image information
show_info() {
    print_info "Docker Image Information:"
    echo ""
    
    if docker images | grep -q "${IMAGE_NAME}"; then
        docker images | grep "${IMAGE_NAME}"
        echo ""
        print_info "Image details:"
        docker inspect "${FULL_IMAGE_NAME}" --format='Size: {{.Size}} bytes ({{printf "%.2f" (div (float64 .Size) 1048576)}} MB)'
        docker inspect "${FULL_IMAGE_NAME}" --format='Created: {{.Created}}'
    else
        print_warning "Image ${FULL_IMAGE_NAME} not found locally"
    fi
    
    echo ""
    print_info "Tar file information:"
    
    if [ -f "${TAR_FILE}" ]; then
        ls -lh "${TAR_FILE}"
    else
        print_warning "Tar file ${TAR_FILE} not found"
    fi
    
    if [ -f "${COMPRESSED_TAR_FILE}" ]; then
        ls -lh "${COMPRESSED_TAR_FILE}"
    else
        print_warning "Compressed tar file ${COMPRESSED_TAR_FILE} not found"
    fi
}

# Function to clean tar files
clean_files() {
    print_info "Cleaning tar files..."
    
    if [ -f "${TAR_FILE}" ]; then
        rm -f "${TAR_FILE}" "${TAR_FILE}.sha256"
        print_success "Removed ${TAR_FILE}"
    fi
    
    if [ -f "${COMPRESSED_TAR_FILE}" ]; then
        rm -f "${COMPRESSED_TAR_FILE}" "${COMPRESSED_TAR_FILE}.sha256"
        print_success "Removed ${COMPRESSED_TAR_FILE}"
    fi
    
    print_success "Cleanup complete!"
}

# Main script logic
case "${1:-all}" in
    build)
        build_image
        ;;
    save)
        save_image
        ;;
    save-compressed)
        save_image_compressed
        ;;
    load)
        load_image
        ;;
    load-compressed)
        load_image_compressed
        ;;
    all)
        build_image
        echo ""
        save_image_compressed
        echo ""
        show_info
        ;;
    info)
        show_info
        ;;
    clean)
        clean_files
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Invalid option: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

print_success "Operation completed successfully!"
