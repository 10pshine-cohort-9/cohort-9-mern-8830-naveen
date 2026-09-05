import React, {useState} from 'react';
import {Pencil, User,Mail,Calendar,Clock,CreditCard,Sun,Bell,ShieldCheck,Globe,Lock, LogOut,Trash2,ChevronRight,Shield} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { deleteAccount, updateMe } from '../api/auth';
import {useAuth} from '../context/AuthContext';

const InfoRow=({icon: Icon, label, value, badge})=>(
    <div className='flex items-center justify-between py-2.5'>
        <span className='flex items-center gap-2.5 text-sm text-ink/60'>
        <Icon size={15}/>{label}</span>
        {badge? (
            <span className='rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-clay'>
                {value}
            </span>
        ):( <span className='text-sm text-ink/80'>{value||'—'}</span>)}
    </div>
);

const PrefRow=({icon: Icon, label,value})=>(
    <button type='button' className='flex w-full items-center justify-between py-2.5 text-left hover:opacity-80'>
        <span className='flex items-center gap-2.5 text-sm text-ink/60'>
        <Icon size={15}></Icon>{label}</span>
        <span className="flex items-center gap-1 text-sm text-ink/80">{value}<ChevronRight size={14} className='text-ink/30'/></span>
    </button>
);

const ActionRow=({icon:Icon, title, subtitle, onClick,danger})=> (
    <button type='button' onClick={onClick} className={`flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-left hover:bg-black/[0.02] ${danger? 'text-red-600 hover:bg-red-50' : 'text-ink/80'}`}>
    <span className='flex items-start gap-2.5'>
        <Icon size={15} className='mt-0.5'/>
        <span>
            <span className='block text-sm font-medium'>{title}</span>
            <span className={`block text-xs ${danger? 'text-red-400': 'text-ink/40'}`}>{subtitle}</span>
        </span>
    </span>
    <ChevronRight size={14} className={danger? 'text-red-300' : 'text-ink/30'}/>
    </button>
);

const Profile = () => {
    const navigate =useNavigate();
    const {user,logout, setUser} = useAuth();
    const [editing, setEditing] =useState(false);
    const [confirmingDelete,setConfirmingDelete] =useState(false);
    const [fullName, setFullName] = useState(user.fullName || '');
    const [tagline, setTagline] =useState(user.tagline || '');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    if(!user){
        return null;
    }
    const memberSince = (user.createdAt) ? new Date(user.createdAt).toLocaleDateString('en-US', {year: 'numeric',month: 'long',day: 'numeric'}) : '—';
    const handleSaveProfile= async()=>{
        if(!fullName.trim()){
            setError('Full name is required.');
            return;
        }
        setError('');
        setSaving(true);

        try{
            const {user:updated} = await updateMe({fullName: fullName.trim(), tagline: tagline.trim(),});
            setUser(updated);
            setEditing(false);
        }
        catch(err){
            setError(err.response?.data?.message || 'Could not update your profile.');
        }
        finally{
            setSaving(false);
        }
    };
    const handleLogout=()=>{
        logout();
        navigate('/login');
    };
    const handleDeleteAccount= async()=>{
        setError('');
        setSaving(true);
        try{
            await deleteAccount();
            logout();
            navigate('/login');
        }
        catch(err){
            setError(err.response?.data?.message || 'Could not delete your account');
        }
        finally{
            setSaving(false);
            setConfirmingDelete(false);
        }
    };
    const handleCancel=()=>{
        setFullName(user.fullName || '');
        setTagline(user.tagline||'');
        setEditing(false);
        setConfirmingDelete(false);
        setError('');
    };

    return(
        <div className='flex min-h-screen bg-cream'>
            <Sidebar/>
            <main className='flex-1 px-8 py-8'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-semibold'>My Profile</h1>
                    <p className='text-sm text-ink/50'>Manage your account and preferences</p>

                </div>
                {error && (
                    <p role='alert' className='mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</p>
                )}
                <div className='mb-6 flex items-center justify-between rounded-xl border border-black/5 bg-white p-5'>
                    <div className='flex items-center gap-4'>
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=notes-user-${user.email?.length || 0}`} alt="User avatar" className="h-16 w-16 rounded-full border border-black/5 bg-sand"/>
                            <div>
                            {editing ? (
                                <>
                                    <label htmlFor='fullName' className='sr-only'>Full Name</label>
                                    <input id ='fullName' value={fullName} onChange={(e)=>setFullName(e.target.value)} className='mb-1 rounded border border-black/10 px-2 py-1 text-base font-semibold outline-none'/></>): (<h2 className='text-base font-semibold'>{user.fullName}</h2>)}

                            <p className='text-sm text-ink/50'>{user.email}</p>
                            {editing ? (
                                <><label htmlFor="tagline" className='sr-only'>Tagline</label>
                                <input id = 'tagline'value={tagline} onChange={(e)=>setTagline(e.target.value)} className='mt-1 rounded border border-black/10 px-2 py-1 text-sm outline-none'/></>): (<p className='mt-1 text-sm text-ink/50'>{user.tagline}</p>)}
                        </div>
                    </div>
                    {editing ? (
                        <div className='flex gap-2'>
                            <button type='button' onClick={handleCancel} disabled={saving} className='rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-sand'>Cancel</button>
                            <button type='button' onClick={handleSaveProfile} disabled={saving}className='rounded-lg bg-ink px-4 py-2 text-white hover:opacity-90'>{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    ):(
                        <button type='button' onClick={()=>setEditing(true)} className='flex items-center gap-1.5 rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-sand/40'><Pencil size={14}/>Edit Profile</button>)}
                </div>
                <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <div className='rounded-xl border border-black/5 bg-white p-5'>
                        <h3 className='mb-2 text-sm font-semibold'>Account Information</h3>
                        <div className='divide-y divide-black/5'>
                        <InfoRow icon={User} label='Full Name' value={user.fullName}/>
                        <InfoRow icon={Mail} label='Email Address' value={user.email}/>
                        <InfoRow icon={Calendar} label='Member Since' value={memberSince}/>
                        <InfoRow icon={Clock} label='Timezone' value={user.timezone}/>
                        <InfoRow icon={CreditCard} label='Account Type' value={user.accountType} badge={true}/>
                        </div>
                    </div>
                    <div className='rounded-xl border border-black/5 bg-white p-5'>
                        <h3 className='mb-2 text-sm font-semibold'>Preferences</h3>
                        <div className='divide-y divide-black/5'>
                        <PrefRow icon={Sun} label='Theme' value={user.theme}/>
                        <PrefRow icon={Bell} label='Notifications' value='Enabled'/>
                        <PrefRow icon={ShieldCheck} label='Privacy' value='Manage'/>
                        <PrefRow icon={Globe} label='Language' value={user.language}/>
                        </div>
                    </div>
                        <div className='rounded-lg border border-black/5 bg-white p-5'>
                            <h3 className='mb-2 text-sm font-semibold'>Security</h3>
                            <div className='divide-y divide-black/5'>
                            <ActionRow icon={Lock} title='Change Password' subtitle='Update your password regularly' onClick={()=>navigate('/change-password')}/>
                        </div>
                    </div>
                    <div className='rounded-xl border border-black/5 bg-white p-5'>
                        <h3 className='mb-2 text-sm font-semibold'>Manage Account</h3>
                        <div className='divide-y divide-black/5'>
                            <ActionRow icon={LogOut} title='Logout' subtitle='Sign out of your account' onClick={handleLogout}/>
                            <ActionRow icon={Trash2} title='Delete Account' subtitle='Permanently delete your account' onClick={()=>setConfirmingDelete(true)} danger/>
                            {confirmingDelete && (
                                <div className='mt-4 rounded-lg bg-red-50 p-4'>
                                    <p className='mb-3 text-sm text-red-600'>Are you sure you want to delete your account?</p>
                                    <div className='flex gap-3'>
                                        <button type='button' onClick={handleDeleteAccount} className='rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700' disabled={saving}>{saving? 'Deleting...' : 'Delete'}</button>
                                        <button type='button' onClick={handleCancel} disabled={saving} className='rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-sand/40'>Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className='rounded-xl border border-black/5 bg-white p-4'>
                    <div className='flex items-center justify-center gap-2 text-sm text-ink/50'>
                    <Shield size={16}/>
                    Your notes are encrypted and only visible to you.
                    </div>
                </div>
        </main>
    </div>
    );
};
export default Profile;
