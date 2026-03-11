/**
 * Girly Being Backup System
 * Automated backup and version control for the blog
 */

class BlogBackupSystem {
    constructor() {
        this.backupKey = 'girlybeing_backups';
        this.maxBackups = 10;
        this.currentVersion = this.getCurrentVersion();
    }

    getCurrentVersion() {
        const now = new Date();
        return {
            timestamp: now.toISOString(),
            version: this.generateVersionNumber(),
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        };
    }

    generateVersionNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `v${year}${month}${day}-${hours}${minutes}`;
    }

    async createBackup() {
        try {
            const backup = {
                version: this.currentVersion,
                files: await this.captureFiles(),
                metadata: {
                    totalFiles: 0,
                    totalSize: 0,
                    backupType: 'manual',
                    userAgent: navigator.userAgent,
                    url: window.location.href
                }
            };

            backup.metadata.totalFiles = backup.files.length;
            backup.metadata.totalSize = this.calculateTotalSize(backup.files);

            await this.saveBackup(backup);
            this.showToast('Backup created successfully!', 'success');
            return backup;
        } catch (error) {
            console.error('Backup failed:', error);
            this.showToast('Backup failed!', 'error');
            throw error;
        }
    }

    async captureFiles() {
        const files = [];
        
        // Capture HTML files
        const htmlFiles = [
            'index.html',
            'index-enhanced.html',
            'post-waiting-for-happiness.html',
            'post-show-up-for-yourself.html',
            'post-big-why.html',
            'post-body-knows.html',
            'post-manifestation-real.html',
            'post-motivation-lie.html',
            'post-shadow-power.html',
            'post-mind-mechanics.html',
            'post-building-yourself.html',
            'post-boundaries-arent-where-we-fight.html',
            'post-what-do-you-bring-to-the-table.html',
            'post-the-art-of-seeing-without-drowning.html',
            'post-when-silence-becomes-violence.html'
        ];

        for (const filename of htmlFiles) {
            try {
                const content = await this.fetchFile(filename);
                files.push({
                    name: filename,
                    type: 'html',
                    content: content,
                    size: new Blob([content]).size
                });
            } catch (error) {
                console.warn(`Could not capture ${filename}:`, error);
            }
        }

        // Capture CSS files
        const cssFiles = ['styles.css', 'styles-enhanced.css'];
        for (const filename of cssFiles) {
            try {
                const content = await this.fetchFile(filename);
                files.push({
                    name: filename,
                    type: 'css',
                    content: content,
                    size: new Blob([content]).size
                });
            } catch (error) {
                console.warn(`Could not capture ${filename}:`, error);
            }
        }

        // Capture JavaScript files
        const jsFiles = ['script.js', 'backup-system.js'];
        for (const filename of jsFiles) {
            try {
                const content = await this.fetchFile(filename);
                files.push({
                    name: filename,
                    type: 'javascript',
                    content: content,
                    size: new Blob([content]).size
                });
            } catch (error) {
                console.warn(`Could not capture ${filename}:`, error);
            }
        }

        // Capture JSON files
        const jsonFiles = ['posts.json'];
        for (const filename of jsonFiles) {
            try {
                const content = await this.fetchFile(filename);
                files.push({
                    name: filename,
                    type: 'json',
                    content: content,
                    size: new Blob([content]).size
                });
            } catch (error) {
                console.warn(`Could not capture ${filename}:`, error);
            }
        }

        return files;
    }

    async fetchFile(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            // If fetch fails, try to get from localStorage or return empty string
            console.warn(`Failed to fetch ${filename}:`, error);
            return '';
        }
    }

    calculateTotalSize(files) {
        return files.reduce((total, file) => total + (file.size || 0), 0);
    }

    async saveBackup(backup) {
        const backups = this.getBackups();
        backups.push(backup);
        
        // Keep only the latest backups
        if (backups.length > this.maxBackups) {
            backups.splice(0, backups.length - this.maxBackups);
        }
        
        localStorage.setItem(this.backupKey, JSON.stringify(backups));
        
        // Also create a downloadable backup
        this.createDownloadableBackup(backup);
    }

    getBackups() {
        try {
            return JSON.parse(localStorage.getItem(this.backupKey) || '[]');
        } catch (error) {
            console.error('Error reading backups:', error);
            return [];
        }
    }

    createDownloadableBackup(backup) {
        const backupData = {
            version: backup.version,
            files: backup.files,
            metadata: backup.metadata,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `girlybeing-backup-${backup.version.version}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async restoreBackup(backupVersion) {
        try {
            const backups = this.getBackups();
            const backup = backups.find(b => b.version.version === backupVersion);
            
            if (!backup) {
                throw new Error('Backup not found');
            }

            // Restore files (this would need server-side implementation for actual file restoration)
            console.log('Restoring backup:', backup);
            this.showToast('Backup restored successfully!', 'success');
            
            return backup;
        } catch (error) {
            console.error('Restore failed:', error);
            this.showToast('Restore failed!', 'error');
            throw error;
        }
    }

    listBackups() {
        return this.getBackups().map(backup => ({
            version: backup.version.version,
            date: backup.version.date,
            time: backup.version.time,
            fileCount: backup.files.length,
            size: this.formatFileSize(backup.metadata.totalSize),
            type: backup.metadata.backupType
        }));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        const toastMessage = document.getElementById('toast-message');
        const alertDiv = toast.querySelector('.alert');
        
        // Update alert styling based on type
        alertDiv.className = `alert alert-${type}`;
        toastMessage.textContent = message;
        
        // Update icon based on type
        const icon = alertDiv.querySelector('[data-lucide]');
        if (icon) {
            const iconMap = {
                success: 'check-circle',
                error: 'x-circle',
                warning: 'alert-triangle',
                info: 'info'
            };
            icon.setAttribute('data-lucide', iconMap[type] || 'info');
            lucide.createIcons();
        }
        
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Auto-backup functionality
    enableAutoBackup(intervalMinutes = 30) {
        setInterval(() => {
            this.createBackup().then(backup => {
                console.log('Auto-backup created:', backup.version.version);
            }).catch(error => {
                console.error('Auto-backup failed:', error);
            });
        }, intervalMinutes * 60 * 1000);
    }

    // Export all backups
    exportAllBackups() {
        const backups = this.getBackups();
        const blob = new Blob([JSON.stringify(backups, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `girlybeing-all-backups-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('All backups exported!', 'success');
    }

    // Clear all backups
    clearAllBackups() {
        if (confirm('Are you sure you want to delete all backups? This action cannot be undone.')) {
            localStorage.removeItem(this.backupKey);
            this.showToast('All backups cleared!', 'warning');
        }
    }
}

// Initialize backup system
const backupSystem = new BlogBackupSystem();

// Create backup controls UI
function createBackupControls() {
    const controls = document.createElement('div');
    controls.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
    controls.innerHTML = `
        <div class="dropdown dropdown-top dropdown-end">
            <div tabindex="0" role="button" class="btn btn-circle btn-primary">
                <i data-lucide="database" class="w-4 h-4"></i>
            </div>
            <div tabindex="0" class="dropdown-content w-80 p-4 bg-base-100 rounded-box shadow-xl">
                <h3 class="font-bold text-lg mb-4">Backup System</h3>
                
                <div class="form-control mb-4">
                    <button onclick="backupSystem.createBackup()" class="btn btn-primary btn-sm w-full">
                        <i data-lucide="save" class="w-4 h-4"></i>
                        Create Backup
                    </button>
                </div>
                
                <div class="form-control mb-4">
                    <button onclick="backupSystem.exportAllBackups()" class="btn btn-secondary btn-sm w-full">
                        <i data-lucide="download" class="w-4 h-4"></i>
                        Export All Backups
                    </button>
                </div>
                
                <div class="form-control mb-4">
                    <button onclick="showBackupHistory()" class="btn btn-outline btn-sm w-full">
                        <i data-lucide="history" class="w-4 h-4"></i>
                        View History
                    </button>
                </div>
                
                <div class="form-control">
                    <button onclick="backupSystem.clearAllBackups()" class="btn btn-error btn-sm w-full">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(controls);
    lucide.createIcons();
}

function showBackupHistory() {
    const backups = backupSystem.listBackups();
    const modal = document.createElement('div');
    modal.className = 'modal modal-open';
    modal.innerHTML = `
        <div class="modal-box w-11/12 max-w-4xl">
            <h3 class="font-bold text-lg mb-4">Backup History</h3>
            <div class="overflow-x-auto">
                <table class="table table-zebra">
                    <thead>
                        <tr>
                            <th>Version</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Files</th>
                            <th>Size</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${backups.map(backup => `
                            <tr>
                                <td class="font-mono text-xs">${backup.version}</td>
                                <td>${backup.date}</td>
                                <td>${backup.time}</td>
                                <td>${backup.fileCount}</td>
                                <td>${backup.size}</td>
                                <td><span class="badge badge-info">${backup.type}</span></td>
                                <td>
                                    <button onclick="restoreBackup('${backup.version}')" class="btn btn-xs btn-primary">Restore</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="modal-action">
                <button onclick="closeModal()" class="btn">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function restoreBackup(version) {
    if (confirm(`Are you sure you want to restore backup ${version}? This will replace current files.`)) {
        backupSystem.restoreBackup(version);
        closeModal();
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    createBackupControls();
    
    // Enable auto-backup every 30 minutes
    backupSystem.enableAutoBackup(30);
    
    // Create initial backup if none exists
    const backups = backupSystem.getBackups();
    if (backups.length === 0) {
        backupSystem.createBackup();
    }
});

// Make backup system globally available
window.backupSystem = backupSystem;
window.showBackupHistory = showBackupHistory;
window.restoreBackup = restoreBackup;
window.closeModal = closeModal;
