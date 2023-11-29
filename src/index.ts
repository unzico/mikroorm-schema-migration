import { Client } from "pg";
import { MikroORM, type Options } from "@mikro-orm/core";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";

type Orm = Awaited<ReturnType<typeof startDatabase>>;

function log(message: string) {
  console.log("%s | %s", new Date().toISOString(), message);
}

const config: Options<PostgreSqlDriver> = {
  metadataProvider: TsMorphMetadataProvider,
  type: "postgresql",
  user: "postgres",
  password: "postgres",
  dbName: "example",
  host: "localhost",
  port: 5432,
  // we define the schema here to be used by the migrations
  // however, the migrations will fail to create the table in the 'custom' schema by default
  // and uses the 'public' schema instead
  schema: "custom",
  migrations: {
    path: "./src/migrations",
    tableName: "migrations",
    transactional: true,
  },
  entities: ["build/models/*.js"],
  entitiesTs: ["src/models/*.ts"],
  driverOptions: {
    keepAlive: true,
    connectionTimeoutMillis: 10000,
  },
  debug: false,
};

/**
 * We cannot initiate MikroORM if the database doesn't exist and MikroORM
 * will not create the database for us.
 *
 * @param config The config used by MikroORM to connect to the database.
 */
async function createDatabase(config: Options<PostgreSqlDriver>) {
  const dbName = config.dbName;
  const dbOwner = config.user;
  const client = new Client({
    user: "postgres",
    password: "postgres",
    database: "postgres",
    host: config.host,
    port: config.port,
  });

  log("Creating database...");
  try {
    await client.connect();
    await client.query(
      `CREATE DATABASE ${dbName} OWNER = ${dbOwner} ENCODING = 'UTF-8' TEMPLATE template1`
    );
    log(`Created database '${dbName}'.`);
  } catch (e) {
    if (e instanceof Error) {
      // @ts-ignore
      if (e.code === "42P04") {
        log(`Database '${dbName}' already exists. Proceeding.`);
      } else {
        console.error(e);
      }
    }
  } finally {
    await client.end();
  }
}

async function runMigrations(orm: Orm) {
  log("Starting migrations...");
  const migrator = orm.getMigrator();
  const migrations = await migrator.getPendingMigrations();

  if (migrations.length > 0) {
    log(`Running ${migrations.length} migrations.`);
    await migrator.up();
  } else {
    log("0 migrations detected.");
  }

  log("Migrations finished.");
}

/**
 * Initialize the database connection and run the migrations.
 */
async function startDatabase() {
  log("Initiating database...");

  await createDatabase(config);

  const orm = await MikroORM.init<PostgreSqlDriver>(config);

  await runMigrations(orm);

  log("Database initiation completed.");

  return orm;
}

async function main() {
  await startDatabase();
}

main()
  .then(() => process.exit())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
