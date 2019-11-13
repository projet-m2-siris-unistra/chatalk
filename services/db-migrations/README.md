`db-migrations`
===============

## How to create a new migration?

To create a new migration, you can install on your machine the `migrate` CLI tool:

```sh
go get -tags 'postgres' -u github.com/golang-migrate/migrate/cmd/migrate
```

To create a new table, for example `users`, you can use the following command:

```sh
migrate create -ext sql -dir ../db-migrations -seq create_users
```

Il will create to new SQL files:
- `xxxxxx_create_users.up.sql`: fill this file to to all required stuff to create the `users` table
- `xxxxxx_create_users.down.sql`: fill this file to drop the `users` table (to revert the action defined in `up`)

Migrations will be automatically run when you do a `docker-compose up --build` in the parent directory (`services`).
