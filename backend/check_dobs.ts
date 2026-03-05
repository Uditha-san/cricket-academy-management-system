import { AppDataSource } from './src/config/data-source';
import { User } from './src/entities/User';

const run = async () => {
    await AppDataSource.initialize();

    // Fetch all players with profiles
    const users = await AppDataSource.getRepository(User).find({
        relations: ["playerProfile"]
    });

    console.log("Users and their DOBs:");
    for (const u of users) {
        console.log(`User ${u.id} (${u.role}): name: ${u.name}, verify: ${u.isVerified}, Profile DOB: ${u.playerProfile?.dateOfBirth}`);
    }

    process.exit(0);
}

run().catch(console.error);
