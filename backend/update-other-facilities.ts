import { AppDataSource } from './src/config/data-source';
import { Facility } from './src/entities/Facility';

async function run() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Facility);
    const facilities = await repo.find();
    
    const profBowling = facilities.find(f => f.name === 'Professional Bowling Machine');
    if (profBowling) {
        profBowling.imageUrl = '/assets/professional_bowling_machine.png';
        await repo.save(profBowling);
        console.log('Updated Professional Bowling Machine imageUrl');
    }

    const battingMachine = facilities.find(f => f.name === 'Batting Training Machine');
    if (battingMachine) {
        battingMachine.imageUrl = '/assets/batting_training_machine.png';
        await repo.save(battingMachine);
        console.log('Updated Batting Training Machine imageUrl');
    }

    process.exit(0);
}
run();
