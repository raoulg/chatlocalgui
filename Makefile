.DEFAULT_GOAL := help
.PHONY: build run build-backend build-frontend create-network run-backend run-frontend help

DOCPATH := $$HOME/code/curriculum
DOCKER_BACKEND_IMAGE := backend-image
DOCKER_FRONTEND_IMAGE := frontend-image
DOCKER_NETWORK := chatlocal-network
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m

build:
	@echo "Building Docker images..."
	make build-backend
	make build-frontend
	make create-network

run:
	@echo "Running Docker containers..."
	make run-backend
	make run-frontend
	@echo "------------------------"
	@echo "Access your application at:"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "------------------------"


build-backend:
	@echo "Building backend Docker image..."
	docker build -t $(DOCKER_BACKEND_IMAGE) -f backend/Dockerfile backend

build-frontend:
	@echo "Building frontend Docker image..."
	docker build -t $(DOCKER_FRONTEND_IMAGE) -f frontend/Dockerfile frontend

serve:
	docker-compose up --build -d
	@echo "$(GREEN)Please wait a few seconds while the service is starting. You can then access it at http://localhost:3000$(NC)"

up:
	@echo "$(GREEN)Starting the pipeline server$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Please wait a few seconds while the service is starting. You can then access it at http://localhost:3000$(NC)"

down:
	@echo "$(RED)Stopping the pipeline server...$(NC)"
	docker-compose down
	@echo "$(GREEN)Finished stopping the server$(NC)"

test:
	curl -X POST -H "Content-Type: application/json" -d '{"question": "What is your question?"}' http://localhost:8000/api/chat

log:
	@echo "$(GREEN) Tailing logs...$(NC)"
	docker-compose logs

run-backend:
	@echo "$(GREEN) Running backend container...$(NC)"
	docker run -d \
		--network=$(DOCKER_NETWORK) \
		--name backend-container \
		-v $$HOME/.cache/chatlocal:/root/.cache/chatlocal \
		-e OPENAI_API_KEY=$$OPENAI_API_KEY \
		$(DOCKER_BACKEND_IMAGE)

run-frontend:
	@echo "$(GREEN) Running frontend container...$(NC)"
	docker run \
		--network=$(DOCKER_NETWORK) \
		-p 3000:3000 \
		$(DOCKER_FRONTEND_IMAGE)

clean:
	@echo "$(GREEN) Cleaning up Docker resources...$(NC)"
	docker stop backend-container frontend-container
	docker rm backend-container frontend-container
	docker rmi $(DOCKER_BACKEND_IMAGE) $(DOCKER_FRONTEND_IMAGE)

help:
	@echo "Available targets:"
	@echo "  build             - Build Docker images and network"
	@echo "  run               - Run Docker containers"
	@echo "  build-backend     - Build the backend Docker image"
	@echo "  build-frontend    - Build the frontend Docker image"
	@echo "  create-network    - Create Docker network"
	@echo "  run-backend       - Run the backend container"
	@echo "  run-frontend      - Run the frontend container"
	@echo "  help              - Display this help message"

