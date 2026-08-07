import {Link} from 'react-router-dom';
import React from 'react';
import {Mail} from 'lucide-react';
const ForgotPassword =()=>{
    const handleSubmit = (e)=> {
        e.preventDefault();
        alert("password reset link sent.");
    };
    return(
        <div className='flex min-h-screen items-center justify-center bg-cream'>
            <div className='w-full max-w-md rounded-2xl bg-white p-8 shadow-lg'>
                <h1 className='mb-2 text-3xl font-bold'>Forgot Password</h1>
                <p className='mb-6 text-sm text-gray-500'>Enter your email to reset password</p>
                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                        <label htmlFor="email" className='mb-2 block text-sm font-medium'>Email Address</label>
                        <div className='flex items-center rounded-lg border px-3'>
                            <Mail size={18} className='text-gray-400'/>
                            <input id ="email" type='email' placeholder='Enter your email' className='w-full border-none bg-transparent px-3 py-3 outline-none' required/>
                        </div>
                    </div>
                    <button type='submit' className='w-full rounded-lg bg-clay py-3 text-white hover:opacity-90'>Send Reset Link</button>
                </form>
                <Link to='/login' className='mt-6 block text-center text-sm text-clay hover:underline'>Back to Login</Link>
            </div>
        </div>
    );
};
export default ForgotPassword;