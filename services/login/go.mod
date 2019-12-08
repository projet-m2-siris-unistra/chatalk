module chatalk.fr/login

go 1.12

require (
	chatalk.fr/utils v0.0.0-00010101000000-000000000000
	github.com/google/uuid v1.1.1
	github.com/lib/pq v1.2.0
	github.com/nats-io/nats.go v1.9.1
	github.com/nats-io/stan.go v0.5.2
	golang.org/x/crypto v0.0.0-20191112222119-e1110fd1c708
	gopkg.in/guregu/null.v3 v3.4.0
)

replace chatalk.fr/utils => ../utils
