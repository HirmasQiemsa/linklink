import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardBody, CardHeader, Input, Button, Divider } from '@nextui-org/react';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login({ setSession }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const formatEmail = (user) => `${user.toLowerCase().replace(/[^a-z0-9]/g, '')}@linklink.app`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (username.length < 6) {
      setErrorMsg('Username minimal 6 karakter.');
      return;
    }
    if (pin.length < 6) {
      setErrorMsg('PIN minimal 6 digit.');
      return;
    }

    setLoading(true);
    const email = formatEmail(username);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pin,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Username atau PIN salah. Jika Anda belum terdaftar, silakan klik tombol Daftar.');
      } else {
        setErrorMsg(error.message);
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (username.length < 6) {
      setErrorMsg('Username minimal 6 karakter.');
      return;
    }
    if (pin.length < 6) {
      setErrorMsg('PIN minimal 6 digit.');
      return;
    }

    setLoading(true);
    const email = formatEmail(username);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: pin,
      options: {
        data: {
          display_name: username
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        setErrorMsg('Username ini sudah terdaftar. Jika ini Anda, silakan klik tombol Masuk.');
      } else {
        setErrorMsg(error.message);
      }
    } else {
      // Auto login happens after signup usually, but we might need to handle email verification if enabled in Supabase.
      // Assuming email confirmation is OFF for this dummy setup.
      if (data.session) {
         // Logged in successfully
      } else {
        setErrorMsg('Akun berhasil dibuat, silakan klik Masuk.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col items-center pb-6">
          <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
            <LogIn size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Linklink</h1>
          <p className="text-gray-500 text-center mt-2 text-lg">Pusat Tautan Aplikasi Anda</p>
        </CardHeader>
        <CardBody>
          <form className="flex flex-col gap-6">
            <Input 
              label="Username"
              placeholder="Masukkan minimal 6 karakter"
              variant="bordered"
              value={username}
              onValueChange={setUsername}
              size="lg"
              classNames={{
                label: "text-base font-semibold",
                input: "text-lg"
              }}
            />
            <Input 
              label="PIN Keamanan"
              placeholder="Minimal 6 digit (contoh: 123456)"
              type="password"
              variant="bordered"
              value={pin}
              onValueChange={setPin}
              size="lg"
              inputMode="numeric"
              classNames={{
                label: "text-base font-semibold",
                input: "text-lg tracking-[0.2em]"
              }}
            />

            {errorMsg && (
              <div className="bg-danger-50 text-danger-600 p-4 rounded-xl text-center border border-danger-200">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-4 mt-2">
              <Button 
                color="primary" 
                size="lg" 
                className="text-lg font-bold" 
                isLoading={loading}
                onPress={handleLogin}
                startContent={!loading && <LogIn size={20} />}
              >
                Masuk
              </Button>
              
              <div className="flex items-center gap-4 py-2">
                <Divider className="flex-1" />
                <span className="text-gray-400 text-sm">ATAU</span>
                <Divider className="flex-1" />
              </div>

              <Button 
                color="default" 
                variant="bordered"
                size="lg" 
                className="text-lg font-bold border-2" 
                isLoading={loading}
                onPress={handleRegister}
                startContent={!loading && <UserPlus size={20} />}
              >
                Daftar Akun Baru
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
