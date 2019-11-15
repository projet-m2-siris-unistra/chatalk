FROM golang:1.12 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -ldflags "-linkmode external -extldflags -static" -a conv_creation.go

FROM scratch
WORKDIR /app
COPY --from=builder /app/conv_creation .
CMD [ "/app/conv_creation" ]
