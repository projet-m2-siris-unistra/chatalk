FROM golang:1.12 AS builder
WORKDIR /app
ARG service
COPY ./utils/go.mod ./utils/go.sum /utils/
COPY ./${service}/go.mod ./${service}/go.sum ./
RUN go mod download
COPY ./utils /utils
COPY ./${service} .
RUN go build -ldflags "-linkmode external -extldflags -static" -a ${service}.go

FROM scratch
ARG service
COPY --from=builder /app/${service} /app
CMD [ "/app" ]
