import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {useLoginMutation, useTwoFactorAuthMutation} from "./services/usersApi";

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState(1) // 1 = логин, 2 = ввод кода

    const [login, { isLoading: loggingIn }] = useLoginMutation()
    const [twoFactorAuth, { isLoading: verifying }] = useTwoFactorAuthMutation()
    const navigate = useNavigate()

    const handleLogin = async () => {
        try {
            await login({ email, password }).unwrap()
            setStep(2) // переходим к вводу кода
        } catch (err) {
            alert(err.data?.error || 'Ошибка входа')
        }
    }

    const handleVerify = async () => {
        try {
            await twoFactorAuth({ email, code: otp }).unwrap()
            navigate('/orders') // редирект после входа
        } catch (err) {
            alert(err.data?.error || 'Ошибка верификации')
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
            {step === 1 ? (
                <>
                    <h2>Вход</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
                    />
                    <button onClick={handleLogin} disabled={loggingIn} style={{ width: '100%', padding: 10 }}>
                        {loggingIn ? 'Входим...' : 'Войти'}
                    </button>
                </>
            ) : (
                <>
                    <h2>Введите код из почты</h2>
                    <input
                        type="text"
                        placeholder="Код"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
                    />
                    <button onClick={handleVerify} disabled={verifying} style={{ width: '100%', padding: 10 }}>
                        {verifying ? 'Проверяем...' : 'Подтвердить'}
                    </button>
                </>
            )}
        </div>
    )
}

export default LoginPage
