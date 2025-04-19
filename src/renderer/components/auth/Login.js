import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../Button';
import { FormInput } from '../FormInput';
import { Card } from '../Card';

export const Login = () => {
  const { verifyPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isValid = await verifyPassword(password);
    if (!isValid) {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <Card title="Enter Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <Button type="submit" className="w-full">
          Unlock
        </Button>
      </form>
    </Card>
  );
}; 