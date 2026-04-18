import { AppDataSource } from './src/config/data-source';
import { Facility } from './src/entities/Facility';

async function run() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Facility);
    const facilities = await repo.find();

    console.log('All facilities:');
    facilities.forEach(f => console.log(`  [${f.type}] ${f.name} -> imageUrl: ${f.imageUrl}`));

    const updates: { keyword: string[], name?: string, image: string }[] = [
        {
            keyword: ['bowling machine', 'professional bowling'],
            name: 'Professional Bowling Machine',
            image: '/assets/bowling machine.jpg'
        },
        {
            keyword: ['batting', 'batting machine', 'batting training'],
            name: 'Batting Training Machine',
            image: '/assets/battingmachines.webp'
        },
        {
            keyword: ['spin', 'bowling simulator', 'simulator'],
            name: 'Bowling Simulator',
            image: '/assets/bowling_simulator.png'
        }
    ];

    for (const update of updates) {
        const match = facilities.find(f =>
            update.keyword.some(k => f.name.toLowerCase().includes(k.toLowerCase()))
        );
        if (match) {
            if (update.name) match.name = update.name;
            match.imageUrl = update.image;
            await repo.save(match);
            console.log(`✅ Updated: "${match.name}" -> image: ${match.imageUrl}`);
        } else {
            console.log(`⚠️  No match found for keywords: ${update.keyword.join(', ')}`);
        }
    }

    console.log('\nDone!');
    process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
