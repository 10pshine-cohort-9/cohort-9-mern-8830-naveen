import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Mail, Feather } from 'lucide-react';
import { forgotPassword } from '../api/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setMessage('');
        setSubmitting(true);

        try {
            const data = await forgotPassword({ email });

            setMessage(
                data.message ||
                'If an account exists with that email, a password reset link has been sent.'
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Could not process your password reset request.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-cream px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

                <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand">
                        <Feather size={17} />
                    </span>

                    <h1 className="text-2xl font-semibold">
                        Reset Password
                    </h1>
                </div>

                <p className="mb-6 text-sm text-gray-500">
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
                    >
                        {error}
                    </p>
                )}

                {message && (
                    <div
                        role="status"
                        className="mb-4 rounded-lg bg-green-50 px-3 py-3 text-xs text-green-700"
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium"
                        >
                            Email Address
                        </label>

                        <div className="flex items-center rounded-lg border border-black/10 px-3">
                            <Mail
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-none bg-transparent px-3 py-3 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-clay py-3 text-white hover:opacity-90 disabled:opacity-50"
                    >
                        {submitting
                            ? 'Sending...'
                            : 'Send Reset Link'}
                    </button>

                </form>

                <Link
                    to="/login"
                    className="mt-6 block text-center text-sm text-clay hover:underline"
                >
                    Back to Login
                </Link>

            </div>
        </div>
    );
};

export default ForgotPassword;