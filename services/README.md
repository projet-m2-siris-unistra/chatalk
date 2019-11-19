Services
========

## Quick start

Install `docker` and `docker-compose` on your machine.

Run the following command:

```sh
docker-compose up --build --force-recreate
```

## Services description

Once started all these services will be run:
- `db`: postgreSQL database
- `db-migrations`: run all database schema migrations
- `bus`: the NATS streaming bus
- `entrypoint`: handle all websockets, dispatch requests to the right service through the `bus`
- `register`: register a user in the `db`
- `fake-ui`: a fake UI to do some tests
- `ui`: the real UI

The UI will be available on http://localhost:4321.

The fake UI will be available on http://localhost:1234.

The websocket will be exposed on ws://localhost:42042.

To inspect the bus, you can go on http://localhost:8222.

## Teardown

To delete all the containers and their data, use:

```sh
docker-compose down
```
