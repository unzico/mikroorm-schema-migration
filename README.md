# mikroorm-schema-migration

If you use a custom schema and define it in the config that is passed to the MikroORM client, you would expect the migrations to be performed for the defined custom schema. However, that's not the case.

## How to use

### Initial setup

```bash
$ yarn # Install dependencies
$ yarn docker pull && yarn docker up -d # Launch PostgreSQL database
```

### Reproduce bug

1. `yarn dev` to run migrations
2. `yarn cli tables` to log tables (all tables are created in the `custom` schema)
3. `yarn cli reset` to drop the database
4. comment out line 10 (`.withSchema("custom")`) in the migration file in `src/migrations`
5. `yarn dev`
6. `yarn cli tables` to see that the `test` table was created in the `public` schema instead of the `custom` schema (**that's the bug**)
