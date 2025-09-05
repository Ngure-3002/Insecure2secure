const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ 
            filename: 'backup.log'
        })
    ]
});

function setupBackup() {
    const backupPath = process.env.BACKUP_PATH || path.join(__dirname, '../backups');
    const frequency = ms(process.env.BACKUP_FREQUENCY || '24h');

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
    }

    // Schedule regular backups
    setInterval(() => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupPath, `backup-${timestamp}.gz`);

        const mongodump = spawn('mongodump', [
            `--uri=${process.env.MONGODB_URI}`,
            `--archive=${backupFile}`,
            '--gzip'
        ]);

        mongodump.stdout.on('data', (data) => {
            logger.info(`mongodump: ${data}`);
        });

        mongodump.stderr.on('data', (data) => {
            logger.error(`mongodump error: ${data}`);
        });

        mongodump.on('close', (code) => {
            if (code === 0) {
                logger.info(`Backup completed successfully: ${backupFile}`);
                cleanOldBackups(backupPath);
            } else {
                logger.error(`Backup failed with code: ${code}`);
            }
        });
    }, frequency);
}

function cleanOldBackups(backupPath) {
    const maxBackups = 7; // Keep last 7 days of backups
    fs.readdir(backupPath, (err, files) => {
        if (err) {
            logger.error('Error reading backup directory:', err);
            return;
        }

        // Sort files by date (newest first)
        const sortedFiles = files
            .filter(file => file.startsWith('backup-'))
            .sort()
            .reverse();

        // Remove old backups
        if (sortedFiles.length > maxBackups) {
            sortedFiles.slice(maxBackups).forEach(file => {
                fs.unlink(path.join(backupPath, file), (err) => {
                    if (err) {
                        logger.error(`Error deleting old backup ${file}:`, err);
                    } else {
                                        logger.info(`Deleted old backup: ${file}`);
                                    }
                                });
                            });
                        }
                    });
                }
                
                module.exports = { setupBackup };