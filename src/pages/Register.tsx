import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Smartphone, Lock } from 'lucide-react';
import { useStore } from '../lib/store';
import { getLogoUrl } from '../lib/storage';
import { useToast } from '../lib/toast';

export default function Register() {
  const { register } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!agree) {
      toast('Please agree to the User Privacy Agreement', 'error');
      return;
    }
    if (phone.trim().length < 10) {
      toast('Enter a valid phone number', 'error');
      return;
    }
    if (password.length < 4) {
      toast('Password must be at least 4 characters', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await register(name.trim(), phone.trim(), password);
      if (!res.ok) {
        toast(res.message, 'error');
        return;
      }
      toast(res.message, 'success');
      navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#3d004c] via-[#62007a] to-[#f6f7fb] flex justify-center">
      <div className="w-full max-w-[440px] flex flex-col">
        <div className="px-7 pt-[7vh] pb-7 text-white">
          <img
            src={getLogoUrl('Vivrapaylogo.png')}
            alt="Vivrapay Logo"
            className="w-[34vw] max-w-[150px] h-auto object-contain mb-6 brightness-0 invert"
          />
          <h1 className="text-[26px] font-extrabold leading-tight">Create your account</h1>
          <p className="text-[13px] text-white/70 mt-1">Join and get your signup bonus instantly</p>
        </div>

        <div className="flex-1 rounded-t-[28px] bg-white px-7 pt-7 pb-10 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]">
          <form onSubmit={submit}>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">Full Name</label>
            <div className="flex items-center bg-[#f7f5fa] border border-transparent focus-within:border-[#62007a] rounded-2xl px-4 py-3.5 mb-4 transition-colors">
              <UserIcon size={20} className="text-[#8e24aa] mr-3 shrink-0" strokeWidth={1.6} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="border-none bg-transparent outline-none w-full text-base text-black"
                required
              />
            </div>

            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">Phone Number</label>
            <div className="flex items-center bg-[#f7f5fa] border border-transparent focus-within:border-[#62007a] rounded-2xl px-4 py-3.5 mb-4 transition-colors">
              <Smartphone size={20} className="text-[#8e24aa] mr-3 shrink-0" strokeWidth={1.6} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="border-none bg-transparent outline-none w-full text-base text-black"
                required
              />
            </div>

            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5">Password</label>
            <div className="flex items-center bg-[#f7f5fa] border border-transparent focus-within:border-[#62007a] rounded-2xl px-4 py-3.5 mb-4 transition-colors">
              <Lock size={20} className="text-[#8e24aa] mr-3 shrink-0" strokeWidth={1.6} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="border-none bg-transparent outline-none w-full text-base text-black"
                required
              />
            </div>

            <div className="mb-6 rounded-2xl bg-[#f3e5f5] px-4 py-3 text-[13px] font-semibold text-[#62007a]">
              🎁 Get ₹150 signup bonus
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-[#62007a] to-[#9c27b0] hover:opacity-95 text-white border-none rounded-2xl py-4 w-full text-base font-bold cursor-pointer mb-4 shadow-lg shadow-[#62007a]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
              {submitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="flex justify-center items-center text-[11px] text-gray-500 mt-1">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mr-1.5 w-4 h-4 accent-[#62007a] cursor-pointer"
              />
              Agree{' '}
              <a href="#" className="text-[#8e24aa] underline ml-1" onClick={(e) => e.preventDefault()}>
                'User Privacy Agreement'
              </a>
            </label>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#62007a] font-semibold no-underline">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
