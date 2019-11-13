FROM migrate/migrate:v4.7.0
WORKDIR /db
COPY . migrations/
ENTRYPOINT [ "/migrate", "-path", "migrations" ]
