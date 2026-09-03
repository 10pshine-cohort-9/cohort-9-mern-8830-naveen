import React, {useState} from 'react';
import { ArrowLeft, Lock} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/auth';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] =useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] =useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] =useState(false);
    const navigate = useNavigate();

    const handleSubmit =async(e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if(newPassword !== confirmPassword){
            setError('New password and confirm password do not match');
            return;
        }
        if(newPassword.length <8){
            setError("Password must be at least 8 characters long");
            return;
        }
        if(currentPassword === newPassword){
            setError("New password cannot be same as the current password");
            return;
        }
        setSubmitting(true);
        try{
            await changePassword({currentPassword, newPassword});
            setSuccess('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        catch(err){
            setError(err.response?.data?.message || 'Could not change password');
        }
        finally{
            setSubmitting(false);
        }
    };
    const handleCancel=()=>{
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    };
    return (
        <div className= "flex min-h-screen bg-cream">
            <Sidebar/>
            <main className="flex-1 px-8 py-8">
                <button type='button' onClick={()=> navigate('/profile')} className='mb-6 flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink'><ArrowLeft size={15}/>Back to Profile</button>
                <div className='mx-auto max-w-sm rounded-xl border border-black/5 bg-white p-6'>
                    <h2 className='mb-4 flex items-center gap-2 text-base font-semibold'><Lock size= {16}/>Change Password</h2>
                    {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
                    {success && (<p role="status" aria-live="polite" className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">Password changed successfully</p>)}
                    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                        <label htmlFor='currentPassword' className='text-sm'>Current Password</label>
                        <input id = "currentPassword" name="currentPassword" type='password' autoComplete="current-password" placeholder='Current Password' value = {currentPassword} onChange={(e)=> setCurrentPassword(e.target.value)} required className='rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ink'/>
                        <label htmlFor='newPassword' className='text-sm'>New Password</label>
                        <input id ="newPassword" name="newPassword" autoComplete="new-password" type ='password' placeholder='New Password' minLength={8} value={newPassword} onChange={(e)=> setNewPassword(e.target.value)} required className='rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ink'/>
                        <label htmlFor='confirmPassword' className='text-sm'>Confirm Password</label>
                        <input id="confirmPassword" name="confirmPassword" autoComplete="new-password" type='password' placeholder='Confirm New Password' minLength={8} value ={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)} required className='rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ink'/>
                    <div className='mt-1 flex gap-3'>
                        <button type='button' onClick={handleCancel} disabled={submitting} className='flex-1 rounded-lg border border-black/10 py-2.5 text-sm hover:bg-sand'>Cancel</button>
                        <button type='submit' disabled={submitting} className='flex-1 rounded-lg bg-ink py-2.5 text-sm font-medium text-white hover:opacity-90'>{submitting? 'Changing...' : 'Change Password'}</button>
                    </div>
                    </form>
                </div>
            </main>
        </div>
    );
};
export default ChangePassword;
