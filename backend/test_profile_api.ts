import { AppDataSource } from './src/config/data-source';
import { User, UserRole } from './src/entities/User';
import { UserController } from './src/controllers/UserController';

const run = async () => {
    await AppDataSource.initialize();

    // Fetch a user
    const user = await AppDataSource.getRepository(User).findOne({
        where: { role: UserRole.PLAYER },
        order: { joinDate: 'DESC' },
        relations: ["playerProfile"]
    });

    if (!user) {
        console.log("No user found.");
        process.exit(1);
    }

    console.log("Simulating API GET /users/profile for user:", user.email, user.id);

    const req = {
        user: { userId: user.id }
    } as any;

    const res = {
        status: (code: number) => { console.log("Status:", code); return res; },
        json: (data: any) => { console.log("Response JSON:", JSON.stringify(data, null, 2)); }
    } as any;

    await UserController.getProfile(req, res);

    process.exit(0);
}

run().catch(console.error);
