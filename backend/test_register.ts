import { AppDataSource } from './src/config/data-source';
import { User } from './src/entities/User';

const testRegistration = async () => {
    const testEmail = `test_player_${Date.now()}@test.com`;

    // 1. Send the registration request
    const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: "Test Register Player",
            email: testEmail,
            password: "Password123!",
            phone: "+94771122334",
            role: "player",
            dateOfBirth: "2002-05-10",
            preferredPosition: "All-rounder",
            battingStyle: "Left-handed",
            bowlingStyle: "Left-arm Spin",
            address: "Test Address",
            emergencyContact: "+94770000000"
        })
    });

    console.log("Registration API Response Status:", response.status);
    console.log("Registration API Response Body:", await response.json());

    // 2. Verify in DB
    await AppDataSource.initialize();
    const user = await AppDataSource.getRepository(User).findOne({
        where: { email: testEmail },
        relations: ["playerProfile"]
    });

    if (user) {
        console.log("DB Verification - User Found:");
        console.log("- Date of Birth:", user.playerProfile?.dateOfBirth);
        console.log("- Preferred Position:", user.playerProfile?.preferredPosition);
        console.log("- Batting Style:", user.playerProfile?.battingStyle);
        console.log("- Bowling Style:", user.playerProfile?.bowlingStyle);
    } else {
        console.log("Failed to find user in DB.");
    }

    process.exit(0);
};

testRegistration().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
