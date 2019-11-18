FROM golang:1.12 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -ldflags "-linkmode external -extldflags -static" -a conv_manag.go

FROM scratch
WORKDIR /app
COPY --from=builder /app/conv_manag .
CMD [ "/app/conv_manag" ]
