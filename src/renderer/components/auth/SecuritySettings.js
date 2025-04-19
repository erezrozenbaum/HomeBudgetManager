import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../Button';
import { FormInput } from '../FormInput';
import { Card } from '../Card';

export const SecuritySettings = () => {
  const {
    isPasswordProtected,
    isEncryptionEnabled,
    setEncryption,
    disableEncryption,
    removePassword
  } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEnableEncryption = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!encryptionKey) {
      setError('Encryption key is required');
      return;
    }

    const success = await setEncryption(encryptionKey);
    if (success) {
      setSuccess('Encryption enabled successfully');
      setEncryptionKey('');
    } else {
      setError('Failed to enable encryption');
    }
  };

  const handleDisableEncryption = async () => {
    setError('');
    setSuccess('');

    const success = await disableEncryption();
    if (success) {
      setSuccess('Encryption disabled successfully');
    } else {
      setError('Failed to disable encryption');
    }
  };

  const handleRemovePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    const success = await removePassword(currentPassword);
    if (success) {
      setSuccess('Password protection removed successfully');
      setCurrentPassword('');
    } else {
      setError('Failed to remove password protection');
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Encryption Settings">
        {!isEncryptionEnabled ? (
          <form onSubmit={handleEnableEncryption} className="space-y-4">
            <FormInput
              label="Encryption Key"
              type="password"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Enable Encryption
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-green-500">Encryption is enabled</p>
            <Button
              onClick={handleDisableEncryption}
              variant="danger"
              className="w-full"
            >
              Disable Encryption
            </Button>
          </div>
        )}
      </Card>

      {isPasswordProtected && (
        <Card title="Password Protection">
          <form onSubmit={handleRemovePassword} className="space-y-4">
            <FormInput
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="danger"
              className="w-full"
            >
              Remove Password Protection
            </Button>
          </form>
        </Card>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      {success && (
        <div className="text-green-500 text-sm">{success}</div>
      )}
    </div>
  );
}; 