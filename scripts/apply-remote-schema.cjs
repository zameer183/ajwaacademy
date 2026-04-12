const fs = require('fs');
const dns = require('dns');
const { Client } = require('pg');

const sql = fs.readFileSync(
  '/mnt/e/ibraheem/ajwa-online-academy/supabase/public-content-schema.sql',
  'utf8'
);

const client = new Client({
  host: 'db.vdzwhurilkucadjgcshv.supabase.co',
  lookup(hostname, options, callback) {
    return dns.lookup(hostname, { ...options, family: 4 }, callback);
  },
  port: 5432,
  user: 'postgres',
  password: 'F6xF3IXn22oFoAzyHooOcugbHqW01kleNE5D2SJwDHklnrnf1bBcs4RFcx5tzvz4gqQYxviuITQzlb5Fsp0p0A==',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  statement_timeout: 30000,
});

(async () => {
  await client.connect();
  await client.query(sql);
  console.log('schema-applied');
  await client.end();
})().catch(async (error) => {
  console.error(error.message || error);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
