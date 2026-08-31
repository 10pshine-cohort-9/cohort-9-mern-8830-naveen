import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Feather } from "lucide-react";
import { resetPassword } from "../api/auth";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();

    // Token is obtained internally from the reset link.
    // The user does not need to see or enter it.
    const token = searchParams.get("token") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            setError(
                "This password reset link is invalid or incomplete. Please request a new reset link."
            );
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            await resetPassword({
                token,
                newPassword,
            });

            setSuccess(
                "Password reset successfully. You can now log in."
            );

            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not reset your password. The link may have expired."
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

                    <h1 className="text-xl font-semibold">
                        Set New Password
                    </h1>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
                    >
                        {error}
                    </p>
                )}

                {success && (
                    <p
                        role="status"
                        className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-600"
                    >
                        {success}
                    </p>
                )}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label
                                htmlFor="newPassword"
                                className="mb-1 block text-sm font-medium"
                            >
                                New Password
                            </label>

                            <div className="flex items-center rounded-lg border border-black/10 px-3">
                                <Lock
                                    size={17}
                                    className="text-gray-400"
                                />

                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    minLength={8}
                                    required
                                    autoComplete="new-password"
                                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-1 block text-sm font-medium"
                            >
                                Confirm New Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                minLength={8}
                                required
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {submitting
                                ? "Resetting..."
                                : "Reset Password"}
                        </button>
                    </form>
                )}

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

export default ResetPassword;