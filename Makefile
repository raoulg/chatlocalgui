.DEFAULT_GOAL := help
.PHONY: build run build-backend build-frontend create-network run-backend run-frontend help

DOCPATH := $$HOME/code/curriculum
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m

serve:
	docker-compose up --build -d
	@echo "$(GREEN)Please wait a few seconds while the service is starting."
	@echo "------------------------"
	@echo "Access your application at:"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "------------------------$(NC)"

up:
	@echo "$(GREEN)Starting the pipeline server$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Please wait a few seconds while the service is starting."
	@echo "------------------------"
	@echo "Access your application at:"
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo "------------------------$(NC)"

down:
	@echo "$(RED)Stopping the pipeline server...$(NC)"
	docker-compose down
	@echo "$(GREEN)Finished stopping the server$(NC)"

test:
	curl -X POST -H "Content-Type: application/json" -d '{"question": "What is your question?"}' http://localhost:8000/api/chat

log:
	@echo "$(GREEN) Tailing logs...$(NC)"
	docker-compose logs

