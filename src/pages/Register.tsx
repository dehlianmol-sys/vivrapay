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
    <div className="flex justify-center bg-white min-h-[100dvh]">
      <div className="w-full max-w-[400px] px-6 py-10 bg-white">
        <div className="text-center mt-[12vh] mb-[8vh]">
          <img
            src={getLogoUrl('Vivrapaylogo.png')}
            alt="Tivra Pay Logo"
            className="w-[40vw] max-w-[170px] h-auto object-contain block mx-auto"
          />
        </div>

        <form onSubmit={submit}>
          <div className="flex items-center bg-[#f8fbff] rounded-[30px] px-5 py-3.5 mb-5">
            <UserIcon size={22} className="text-[#4da0ff] mr-4 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="border-none bg-transparent outline-none w-full text-base text-black"
              required
            />
          </div>

          <div className="flex items-center bg-[#f8fbff] rounded-[30px] px-5 py-3.5 mb-5">
            <Smartphone size={22} className="text-[#4da0ff] mr-4 shrink-0" strokeWidth={1.5} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="border-none bg-transparent outline-none w-full text-base text-black"
              required
            />
          </div>

          <div className="flex items-center bg-[#f8fbff] rounded-[30px] px-5 py-3.5 mb-5">
            <Lock size={22} className="text-[#4da0ff] mr-4 shrink-0" strokeWidth={1.5} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border-none bg-transparent outline-none w-full text-base text-black"
              required
            />
          </div>

          <div className="flex justify-between items-center mb-9 px-1.5">
            <span className="text-[#4da0ff] text-[15px]">Get ₹150 signup bonus</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#2b8cff] hover:bg-[#1e7aeb] text-white border-none rounded-[10px] py-4 w-full text-lg font-medium cursor-pointer mb-4 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="flex justify-center items-center text-xs text-[#4da0ff] mt-2.5">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mr-1.5 w-4 h-4 accent-[#2b8cff] cursor-pointer"
            />
            Agree{' '}
            <a href="#" className="text-[#4da0ff] underline ml-1" onClick={(e) => e.preventDefault()}>
              'User Privacy Agreement'
            </a>
          </label>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2b8cff] font-medium no-underline">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}
