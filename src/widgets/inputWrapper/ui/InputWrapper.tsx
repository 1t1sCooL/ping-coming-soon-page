import React, { useState } from 'react';
import styles from "./inputWrapper.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InputWrapper = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        if (value === '') {
            setError('Email is required');
        } else if (!EMAIL_REGEX.test(value)) {
            setError('Please enter a valid email address');
        } else {
            setError('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (error || !email) {
            return;
        }
        console.log('Email submitted:', email);
    };
    return (
        <form className={styles.inputWrapper} onSubmit={handleSubmit}>
            <div className={styles.input}>
                <input
                    type="email"
                    placeholder="Your email address..."
                    value={email}
                    onChange={handleEmailChange}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'email-error' : undefined}
                />
                {error && <span id="email-error" className={styles.error}>{error}</span>}
            </div>
            <button type="submit" disabled={!!error || !email.trim()}>
                Notify Me
            </button>
        </form>
    )
}