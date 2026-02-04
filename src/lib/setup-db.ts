import { getNeo4jDriver, closeDriver } from './neo4j';

async function setupDatabase() {
    console.log('Starting database setup...');
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
        console.log('Checking for fulltext index "developer_usernames"...');
        const result = await session.run('SHOW FULLTEXT INDEXES WHERE name = "developer_usernames"');

        if (result.records.length === 0) {
            console.log('Index not found. Creating fulltext index "developer_usernames"...');
            await session.run('CREATE FULLTEXT INDEX developer_usernames FOR (n:Developer) ON EACH [n.username]');
            console.log('Index created successfully.');
        } else {
            console.log('Index "developer_usernames" already exists.');
        }
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    } finally {
        await session.close();
        await closeDriver();
    }
}

setupDatabase();
