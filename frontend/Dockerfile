# Use the official Go image as the base image
FROM golang:1.20.5-alpine

# Set the working directory inside the container
WORKDIR /app
RUN apk update && apk add --no-cache gcc musl-dev sqlite sqlite-dev

COPY . .

# Download the Go dependencies
RUN go mod download

# Build the Go application
ENV CGO_ENABLED=1
RUN go build -o main ./server

# Expose the port on which your Go application will run
EXPOSE 3000

# Start the Go application
CMD ["./main"]
