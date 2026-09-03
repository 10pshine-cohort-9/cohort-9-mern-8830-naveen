import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {User, Mail, Lock, Feather, ArrowRight} from 'lucide-react';
import {useAuth} from '../context/AuthContext';

const Signup = () => {
    const [form, setForm] = useState({fullName: '', email: '', password: '', confirmPassword: ''});
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const {signup} = useAuth();

    const handleChange =(e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');
        if (form.password !== form.confirmPassword){
            setError('Passwords do not match.');
            return;
        }
        if(form.password.length < 8){
            setError('Password must be at least 8 characters long.');
            return;
        }
        if (!agreed){
            setError('Please accept the Terms of Service and Privacy Policy.');
            return;
        }
        setSubmitting(true);
        try{
            await signup({fullName: form.fullName,email: form.email, password: form.password});
            navigate('/notes');
        }
        catch(err){
            setError(err.response?.data?.message || "Could not create account.");
        }
        finally{
            setSubmitting(false);
        }
};
    return(
        <div className="dune-bg flex min-h-screen items-center justify-center px-4 py-10">
            <div className= "w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
                <div className= "mb-6 flex flex-col items-center text-center">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sand text-ink">
                        <Feather size = {22}/>
                    </span>
                    <h1 className ="text-lg font-semibold">Notes</h1>
                    <p className="text-xs text-ink/50">Capture thoughts. Organize ideas.</p>
                </div>
                <h2 className="mb-1 text-center text-xl font-semibold">Create your account</h2>
                <p className ="mb-6 text-center text-sm text-ink/50">Start your journey with Notes</p>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
                )}

                <form onSubmit={handleSubmit} className ="flex flex-col gap-3">
                    <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2.5">
                        <User size={20} className="text-ink/40"/>
                        <input type="text" name="fullName" placeholder="Full Name" required value={form.fullName} onChange={handleChange} autoComplete='name' className="w-full bg-transparent text-sm placeholder:text-ink/50 focus:outline-none"/>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2.5">
                        <Mail size={20} className="text-ink/40" />
                        <input type="email" name="email" placeholder="Email" value={form.email} required onChange={handleChange} autoComplete='email' className="w-full bg-transparent text-sm placeholder:text-ink/50 focus:outline-none"/>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2.5">
                        <Lock size={20} className="text-ink/40" />
                        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={8} autoComplete='new-password' className="w-full bg-transparent text-sm placeholder:text-ink/50 focus:outline-none"/>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2.5">
                        <Lock size={20} className="text-ink/40" />
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required minLength={8} autoComplete='new-password' className="w-full bg-transparent text-sm placeholder:text-ink/50 focus:outline-none"/>
                    </label>
                    <label className="flex items-start gap-2 text-xs text-ink/60">
                        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />{' '}
                        I agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>
                    </label>

                    <button type="submit" disabled={submitting} className ="mt-1 flex items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"> {submitting ? 'Creating account...' : 'Sign up'} <ArrowRight size={15}/> </button>
                </form>

                <p className ="mt-6 text-center text-xs text-ink/50">
                    Already have an account? {''}
                    <Link to="/login" className="font-medium text-ink hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};
export default Signup;