FROM golang:1.12-alpine AS builder
WORKDIR /app
ARG service
RUN apk update && apk add --no-cache git
COPY ./utils/go.mod ./utils/go.sum /utils/
COPY ./${service}/go.mod ./${service}/go.sum ./
RUN go mod download
COPY ./utils /utils
COPY ./${service} .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -ldflags="-w -s" ${service}.go

FROM scratch
ARG service
COPY --from=builder /app/${service} /app
CMD [ "/app" ]
