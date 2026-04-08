# Build stage
FROM golang:1.24.0-alpine AS builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY Backend/ .
RUN go mod download
RUN CGO_ENABLED=1 go build -o backend ./cmd/main.go

# Runtime stage
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/backend .
COPY --from=builder /app/internal/utils ./internal/utils
EXPOSE 8080
CMD ["./backend"]
