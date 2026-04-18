import { AppDataSource } from './src/config/data-source';
import { Facility } from './src/entities/Facility';

async function run() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Facility);
    const facilities = await repo.find();
    console.log('Facilities:', facilities);
    
    // Find spin bowling simulator
    const spin = facilities.find(f => f.name.toLowerCase().includes('spin') || f.name.toLowerCase().includes('simulator'));
    if (spin) {
        console.log('Found:', spin.name);
        spin.name = 'Bowling Simulator';
        spin.imageUrl = '/assets/bowling_simulator.png';
        await repo.save(spin);
        console.log('Updated to Bowling Simulator!');
    } else {
        console.log('Could not find Spin Bowling Simulator.');
    }
    process.exit(0);
}
run();
