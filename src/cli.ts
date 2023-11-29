import { Client, type ClientConfig } from "pg";

type Callback = (client: Client) => Promise<void>;

function clientFactory(config?: ClientConfig) {
  return new Client({
    user: "postgres",
    password: "postgres",
    database: "example",
    host: "localhost",
    port: 5432,
    ...config,
  });
}

function execute(client: Client) {
  return async (callback: Callback) => {
    try {
      await client.connect();

      await callback(client);
    } catch (error) {
      console.error(error);
    } finally {
      await client.end();
    }
  };
}

async function main() {
  // Get the command line arguments
  const [, , command] = process.argv;

  // Dispatch based on the command
  switch (command?.toLocaleLowerCase()) {
    case "tables": {
      const client = clientFactory();
      const cb: Callback = async (client) => {
        const result = await client.query(`
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_schema IN ('public', 'custom');
        `);
        console.table(result.rows);
      };

      await execute(client)(cb);
      break;
    }
    case "reset":
      const client = clientFactory({ database: "postgres" });
      const cb: Callback = async (client) => {
        await client.query(`DROP DATABASE IF EXISTS example`);
        console.log("Dropped database 'example'.");
      };
      await execute(client)(cb);
      break;
    default:
      throw new Error("Invalid command. Supported commands: tables, reset");
  }
}

main();
