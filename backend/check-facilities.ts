import { AppDataSource } from './src/config/data-source';
import { Facility } from './src/entities/Facility';

async function run() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Facility);
    const facilities = await repo.find();
    console.log(facilities.map(f => ({id: f.id, name: f.name, imageUrl: f.imageUrl})));
    process.exit(0);
}
run();
