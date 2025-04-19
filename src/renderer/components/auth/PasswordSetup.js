import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../Button';
import { FormInput } from '../FormInput';
import { Card } from '../Card';

export const PasswordSetup = () => {
  const { setPassword } = useAuth();
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const success = await setPassword(password);
    if (success) {
      setSuccess(true);
      setPasswordValue('');
      setConfirmPassword('');
    } else {
      setError('Failed to set password');
    }
  };

  return (
    <Card title="Set Up Password Protection">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPasswordValue(e.target.value)}
          required
          minLength={8}
        />
        <FormInput
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {success && (
          <div className="text-green-500 text-sm">
            Password protection enabled successfully
          </div>
        )}
        <Button type="submit" className="w-full">
          Enable Password Protection
        </Button>
      </form>
    </Card>
  );
}; 