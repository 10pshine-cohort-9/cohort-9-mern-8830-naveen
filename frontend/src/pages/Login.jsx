import React, {useState} from 'react';
import {Mail, Lock, Feather, ArrowRight} from 'lucide-react';
import {Link} from 'react-router-dom';
const Login = () => {
    const [form, setForm] = useState({email: '', password: ''});
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setError('');
        setSubmitting(true);

        console.log(form);

        setTimeout(() => {
            setSubmitting(false);
            alert("Login UI Working");
    }, 1000);
};
    return(
        <div className="dune-bg flex min-h-screen items-center justify-center px-4 py-10">
            <div className= "w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
                <div className= "mb-6 flex flex-col items-center text-center">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sand text-ink">
                        <Feather size = {22}/>
                    </span>
                    <h1 className ="text-lg font-semibold">Notes</h1>
                    <p className ="text-xs text-ink/50">Capture thoughts. Organize ideas.</p>
                </div>

                <h2 className="mb-1 text-center text-xl font-semibold">Welcome back</h2>
                <p className="mb-6 text-center text-sm text-ink/50">Login to continue to Notes</p>

                {error && (
                    <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2.5">
                        <Mail size={16} className ="text-ink/40"/>
                        <input type="email" name = "email" value = {form.email} onChange={handleChange} placeholder="Email address" required className ="w-full bg-transparent text-sm outline-none placeholder:text-ink/40" />
                            </label>
                    <label className ="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2.5">
                        <Lock size={16} className ="text-ink/40"/>
                        <input type="password" name = "password" value = {form.password} onChange={handleChange} placeholder="Password" required className ="w-full bg-transparent text-sm outline-none placeholder:text-ink/40"/>
                    </label>

                    <div className="text-right">
                        <button type="button" className="text-xs text-clay hover:underline">Forgot password?</button>
                    </div>
                    <button type = "submit" disabled={submitting} className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">{submitting ? 'Logging in...' : 'Login'} <ArrowRight size={15}/></button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs text-ink/30">
                    <span className="h-px flex-1 bg-black/10"/>or continue with
                    <span className="h-px flex-1 bg-black/10"/>
                </div>
                
                <p className ="mt-6 text-center text-xs text-ink/50">
                Dont have an account? {" "}
                <Link to="/signup" className="text-clay hover:underline">
                    Sign up
                </Link>
                </p>
            </div>
        </div>
    );
};
export default Login;