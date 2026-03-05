import { AppDataSource } from './src/config/data-source';
import { User, UserRole } from './src/entities/User';

const run = async () => {
    await AppDataSource.initialize();

    const user = await AppDataSource.getRepository(User).findOne({
        where: { role: UserRole.PLAYER },
        order: { joinDate: 'DESC' },
        select: ["id", "name", "email", "phone", "role", "joinDate"],
        relations: ["playerProfile"]
    });
    console.log("With array select:", user?.playerProfile);

    const user2 = await AppDataSource.getRepository(User).findOne({
        where: { role: UserRole.PLAYER },
        order: { joinDate: 'DESC' },
        relations: ["playerProfile"]
    });
    console.log("Without array select:", user2?.playerProfile);

    process.exit(0);
}

run().catch(console.error);
