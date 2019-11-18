FROM golang:1.12 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -ldflags "-linkmode external -extldflags -static" -a login.go

FROM scratch
WORKDIR /app
COPY --from=builder /app/login .
CMD [ "/app/login" ]
