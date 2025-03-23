import { DataImportService } from '../utils/dataImport.js';
import { logger } from '../utils/logger.js';
import 'dotenv/config';

async function main() {
  try {
    const importService = DataImportService.getInstance();
    
    await importService.importMITREAttackPatterns();
    
    logger.info('Data import completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during data import:', error);
    process.exit(1);
  }
}

main(); 
