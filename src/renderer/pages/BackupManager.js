import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ipcRenderer } from 'electron';
import { FaBackup, FaRedo, FaTrash, FaLock, FaUnlock } from 'react-icons/fa';

const BackupManager = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const result = await ipcRenderer.invoke('list-backups');
      setBackups(result);
      setError(null);
    } catch (err) {
      setError('Failed to load backups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      setBackupProgress(0);
      
      // Listen for backup progress updates
      const progressListener = (event, progress) => {
        setBackupProgress(progress);
      };
      ipcRenderer.on('backup-progress', progressListener);

      await ipcRenderer.invoke('create-backup');
      await loadBackups();
      setError(null);
    } catch (err) {
      setError('Failed to create backup: ' + err.message);
    } finally {
      setLoading(false);
      setBackupProgress(0);
      ipcRenderer.removeAllListeners('backup-progress');
    }
  };

  const handleRestoreBackup = async () => {
    try {
      setLoading(true);
      await ipcRenderer.invoke('restore-backup', selectedBackup.path);
      setError(null);
      setShowConfirmRestore(false);
      // Show success message
      alert('Backup restored successfully! The application will restart to apply changes.');
      ipcRenderer.send('restart-app');
    } catch (err) {
      setError('Failed to restore backup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async () => {
    try {
      setLoading(true);
      await ipcRenderer.invoke('delete-backup', selectedBackup.path);
      await loadBackups();
      setError(null);
      setShowConfirmDelete(false);
    } catch (err) {
      setError('Failed to delete backup: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Backup Manager</h1>
        <button
          onClick={handleCreateBackup}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
        >
          <FaBackup className="mr-2" />
          Create Backup
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {backupProgress > 0 && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${backupProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Creating backup... {backupProgress}%
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && backups.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Loading backups...
                </td>
              </tr>
            ) : backups.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No backups found
                </td>
              </tr>
            ) : (
              backups.map((backup) => (
                <tr key={backup.filename} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(backup.date, 'PPP p')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatFileSize(backup.size)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Encrypted
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedBackup(backup);
                        setShowConfirmRestore(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      disabled={loading}
                    >
                      <FaRedo className="inline-block mr-1" />
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBackup(backup);
                        setShowConfirmDelete(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                      disabled={loading}
                    >
                      <FaTrash className="inline-block mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Restore Confirmation Modal */}
      {showConfirmRestore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Restore
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to restore this backup? This will replace all current data with the backup data from{' '}
              {format(selectedBackup.date, 'PPP p')}.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmRestore(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Restoring...' : 'Restore'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this backup from{' '}
              {format(selectedBackup.date, 'PPP p')}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBackup}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManager; 