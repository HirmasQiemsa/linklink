import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardBody, CardHeader, Input, Button, Divider } from '@nextui-org/react';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login({ setSession }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const formatEmail = (user) => `${user.toLowerCase().replace(/[^a-z0-9]/g, '')}@linklink.app`;

  const handleLogin = async () => {
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
        setErrorMsg('Username atau PIN salah. Jika Anda belum terdaftar, silakan buat akun baru.');
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Error: Fitur "Confirm email" masih aktif di Supabase Anda. Anda harus mematikannya di dashboard Supabase (Authentication > Providers > Email).');
      } else {
        setErrorMsg(error.message);
      }
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setErrorMsg('');
    setSuccessMsg('');

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
        setErrorMsg('Username ini sudah terdaftar. Silakan Masuk.');
      } else {
        setErrorMsg(error.message);
      }
    } else {
      if (data.session) {
         // Auto login berhasil
      } else {
        setSuccessMsg('Akun berhasil dibuat! Namun Anda tidak otomatis login. Pastikan "Confirm email" di Supabase dimatikan, lalu silakan Masuk.');
        setIsRegister(false); // Kembalikan ke layar login
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 md:bg-white">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        
        {/* Kolom Kiri: Branding (Terlihat seperti Facebook) */}
        <div className="hidden md:flex flex-col justify-center items-start pl-4">
          <div className="bg-primary p-4 rounded-2xl mb-6 text-white inline-block">
            <LogIn size={48} />
          </div>
          <h1 className="text-5xl font-extrabold text-primary mb-4">Linklink</h1>
          <p className="text-2xl text-gray-700 leading-snug max-w-md">
            Pusat tautan aplikasi Anda. Semua akses akademik dan pekerjaan kini ada di satu tempat.
          </p>
        </div>

        {/* Kolom Kanan: Form Login */}
        <div className="flex flex-col items-center">
          
          {/* Logo Mobile */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary">
              <LogIn size={40} />
            </div>
            <h1 className="text-3xl font-bold text-primary">Linklink</h1>
          </div>

          <Card className="w-full max-w-md p-2 sm:p-6 shadow-2xl rounded-2xl md:border md:border-gray-100">
            <CardBody>
              <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
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
            
            {successMsg && (
              <div className="bg-success-50 text-success-600 p-4 rounded-xl text-center border border-success-200">
                {successMsg}
              </div>
            )}

            <div className="flex flex-col gap-4 mt-2">
              {isRegister ? (
                <>
                  <Button 
                    color="primary" 
                    size="lg" 
                    className="text-lg font-bold" 
                    isLoading={loading}
                    onPress={handleRegister}
                    startContent={!loading && <UserPlus size={20} />}
                  >
                    Buat Akun Sekarang
                  </Button>
                  <p className="text-center text-gray-500 mt-2">
                    Sudah punya akun?{' '}
                    <span 
                      className="text-primary font-bold cursor-pointer hover:underline"
                      onClick={toggleMode}
                    >
                      Masuk di sini
                    </span>
                  </p>
                </>
              ) : (
                <>
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
                    onPress={toggleMode}
                  >
                    Daftar Akun Baru
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardBody>
      </Card>
        </div>

      </div>
    </div>
  );
}
