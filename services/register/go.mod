module chatalk.fr/register

go 1.12

require (
	chatalk.fr/utils v0.0.0-00010101000000-000000000000
	github.com/Shyp/go-dberror v0.0.0-20180123195207-36ecba57721e
	github.com/google/uuid v1.1.1
	github.com/lib/pq v1.2.0
	github.com/nats-io/nats.go v1.9.1
	github.com/nats-io/stan.go v0.5.2
	golang.org/x/crypto v0.0.0-20191112222119-e1110fd1c708
)

replace chatalk.fr/utils => ../utils
