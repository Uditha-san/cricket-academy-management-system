import { AppDataSource } from "./src/config/data-source";
import { Equipment } from "./src/entities/Equipment";

const products = [
    { name: 'TON Premium Cricket Bat', image: '/assets/bat.webp', price: 45000, category: 'Bats', description: 'Handcrafted English willow bat with a large sweet spot — ideal for club and professional players.', stock: 10 },
    { name: 'SS Ton Reserve Edition', image: '/assets/bat.webp', price: 55000, category: 'Bats', description: 'Super Premium Grade 1 English Willow cricket bat.', stock: 5 },
    { name: 'Kookaburra Kahuna', image: '/assets/bat.webp', price: 48000, category: 'Bats', description: 'Iconic bat with a mid-blade sweet spot.', stock: 8 },
    { name: 'GM Diamond 808', image: '/assets/bat.webp', price: 42000, category: 'Bats', description: 'Traditional blade design for dynamic stroke play.', stock: 12 },
    { name: 'Professional Batting Pads', image: '/assets/pads.jpg', price: 10000, category: 'Protective Gear', description: 'Lightweight and comfortable batting pads.', stock: 15 },
    { name: 'Thigh Pad Set', image: '/assets/pads.jpg', price: 3500, category: 'Protective Gear', description: 'Comprehensive lower body protection.', stock: 20 },
    { name: 'Chest Guard', image: '/assets/pads.jpg', price: 2500, category: 'Protective Gear', description: 'Ergonomic chest guard for impact protection.', stock: 10 },
    { name: 'Arm Guard', image: '/assets/pads.jpg', price: 1800, category: 'Protective Gear', description: 'Lightweight arm guard.', stock: 25 },
    { name: 'Professional Cricket Helmet', image: '/assets/helmet.jpg', price: 7000, category: 'Protective Gear', description: 'Safety certified cricket helmet.', stock: 8 },
    { name: 'Wicket Keeping Gloves', image: '/assets/gloves.webp', price: 8000, category: 'Gloves', description: 'High-quality wicket keeping gloves.', stock: 12 },
    { name: 'Pro Batting Gloves', image: '/assets/gloves.webp', price: 4500, category: 'Gloves', description: 'Pro level protection with excellent flexibility.', stock: 30 },
    { name: 'Inner Gloves', image: '/assets/gloves.webp', price: 800, category: 'Gloves', description: 'Cotton inner gloves for sweat absorption.', stock: 50 },
    { name: 'Leather Cricket Ball (Pack of 6)', image: '/assets/ball.webp', price: 4800, category: 'Balls', description: 'Premium leather cricket balls.', stock: 40 },
    { name: 'White Cricket Ball (Pack of 6)', image: '/assets/ball.webp', price: 5400, category: 'Balls', description: 'Regulation white balls for day/night cricket.', stock: 20 },
    { name: 'Training Ball (Synthetic)', image: '/assets/ball.webp', price: 400, category: 'Balls', description: 'Durable synthetic ball for practice.', stock: 100 },
    { name: 'Cricket Spike Shoes', image: '/assets/shoes.jpg', price: 6000, category: 'Footwear', description: 'Professional cricket spike shoes.', stock: 15 },
    { name: 'Rubber Sole Cricket Shoes', image: '/assets/shoes.jpg', price: 4500, category: 'Footwear', description: 'Multi-surface rubber sole shoes.', stock: 20 },
];

async function seed() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(Equipment);

        // Clear existing equipment to avoid duplicates during this migration
        await repo.clear();

        for (const p of products) {
            const item = repo.create(p);
            await repo.save(item);
        }

        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
