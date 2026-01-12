const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase connection string
const connectionString = 'postgresql://postgres.bpqbkedptqoljfzhudvb:CelerityOps2025!@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', 'sc_lead_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SC Lead tables migration...');
    await client.query(sql);
    console.log('SC Lead tables created successfully!\n');

    // Create SC Lead role
    console.log('Creating SC Lead role...');
    const roleResult = await client.query(`
      INSERT INTO roles (name, description, permissions_json)
      VALUES ('SC Lead', 'Study Coordinator Lead - Líder de coordinadores clínicos', '{"view_all_sites": true, "manage_team": true, "view_kpis": true}')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `);

    if (roleResult.rows.length > 0) {
      console.log('SC Lead role created:', roleResult.rows[0]);
    } else {
      console.log('SC Lead role already exists');
      const existing = await client.query(`SELECT id, name FROM roles WHERE name = 'SC Lead'`);
      console.log('Existing role:', existing.rows[0]);
    }

    // Verify tables were created
    console.log('\nVerifying SC Lead tables...');
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'sc_lead%'
      ORDER BY table_name;
    `);

    console.log('SC Lead tables found:');
    tables.rows.forEach(row => console.log('  -', row.table_name));

    console.log('\n Setup complete!');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.log('\nNeed database password. Please provide it.');
    }
  } finally {
    await client.end();
  }
}

runMigration();
