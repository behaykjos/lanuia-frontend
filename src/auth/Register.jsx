import React, { useState } from 'react'
import { bannedWords } from '../utils/bannedWords'
import { useNavigate } from "react-router-dom";
import api from '../services/api';

const Register = () => {

  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const doPasswordsMatch = password === confirmPassword
  const [birthday, setBirthday] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isUsernameValid) {
      return alert('Username must be 6-20 characters and not contain offensive words')
    }
    
    if (!isEmailValid) {
      return alert('Please enter a valid email')
    }
    
    if (!isPasswordValid) {
      return alert('Password must meet all requirements')
    }
    
    if (password !== confirmPassword) {
      return alert('Passwords do not match')
    }

    const payload = {
      name,
      email,
      password,
      ...(birthday ? { birthday } : {}) // envia somente se preenchido
    }

    try {
      const res = await api.post('/auth/register', { name, email, password, birthday })
      const text = await res.text()
      console.log('STATUS:', res.status)
      console.log('RAW RESPONSE:', text)

      let data = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch (e) {
        console.warn('Could not parse JSON response', e)
        data = { raw: text }
      }

      if (!res.ok) {
        // Try to extract useful error messages returned by the server
        let errMsg = data.error
        if (!errMsg && data.errors) {
          const errs = data.errors.fieldErrors ? data.errors.fieldErrors : data.errors
          const list = Object.values(errs).flat().filter(Boolean)
          if (list.length) errMsg = list.join(', ')
        }
        if (!errMsg && data.raw) errMsg = data.raw
        throw new Error(errMsg || `Register failed (${res.status})`)
      }


      localStorage.setItem('@Lanuia:token', data.token)
      localStorage.setItem('@Lanuia:user', JSON.stringify(data.user))

      navigate("/feed")
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false)
  const [usernameTouched, setUsernameTouched] = useState(false)

  // Validação de email
  const validateEmail = (emailStr) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(emailStr)
  }
  const isEmailValid = validateEmail(email)

  // Converter leetspeak para detecção de bad words
  const convertLeetToNormal = (text) => {
    const leetMap = {
      '0': 'o',
      '1': 'i',
      '3': 'e',
      '4': 'a',
      '5': 's',
      '7': 't',
      '8': 'u',
      '9': 'g',
      '@': 'a',
      '$': 's',
      '!': 'i',
      '|': 'l'
    }
    return text.replace(/[0134578@$!|]/gi, match => leetMap[match] || match)
  }

  // Validação de username
  const validateUsername = (username) => {
    const convertedUsername = convertLeetToNormal(username)
    return {
      length: username.length >= 6 && username.length <= 20,
      notRepeated: !/^(.)\1{5,}$/.test(username),
      notBanned: !bannedWords.some(word => convertedUsername.toLowerCase().includes(word))
    }
  }
  const usernameRequirements = validateUsername(name)
  const isUsernameValid = Object.values(usernameRequirements).every(Boolean)

  // Política de senha
  const validatePassword = (pwd) => ({
    minLength: pwd.length >= 8,
    hasUppercase: /[A-Z]/.test(pwd),
    hasLowercase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(pwd),
    notUsername: pwd.toLowerCase() !== name.toLowerCase()
  })

  const passwordRequirements = validatePassword(password)
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  const getCurrentYear = () => new Date().getFullYear()
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate()
  
  // Calcular idade mínima (12 anos)
  const getMinimumBirthYear = () => {
    const today = new Date()
    const minAge = 12
    return today.getFullYear() - minAge
  }
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthYear, setBirthYear] = useState('')

  const handleBirthdayChange = () => {
    if (birthMonth && birthDay && birthYear) {
      setBirthday(`${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`)
    }
  }

  React.useEffect(() => {
    handleBirthdayChange()
  }, [birthMonth, birthDay, birthYear])

  const currentYear = getCurrentYear()
  const minimumBirthYear = getMinimumBirthYear()
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  
  // Se o ano selecionado for o mínimo, limitar mês e dia
  const isMinimumYear = parseInt(birthYear) === minimumBirthYear
  const allowedMonths = isMinimumYear ? months.slice(0, currentMonth) : months
  const daysInSelectedMonth = birthMonth ? getDaysInMonth(parseInt(birthMonth), parseInt(birthYear) || currentYear) : 31
  const isCurrentMonth = isMinimumYear && parseInt(birthMonth) === currentMonth
  const maxDay = isCurrentMonth ? currentDay : daysInSelectedMonth
  const years = Array.from({ length: minimumBirthYear - (currentYear - 100) + 1 }, (_, i) => minimumBirthYear - i)
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)


  return (
    <div>
      <h1 className="lanuia">Register</h1>
      <form onSubmit={handleSubmit}>
        <label>E-mail</label>
        <input
          type="email"
          placeholder="Your e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setEmailTouched(false)}
          onBlur={() => setEmailTouched(true)}
          required
        />
        {email && emailTouched && !isEmailValid && (
          <p style={{ fontSize: '12px', color: 'red', margin: '0px' }}>
            ✗ Invalid email address.
          </p>
        )}

        <label>Username</label>
        <input
          type="text"
          placeholder="Your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setUsernameTouched(false)}
          onBlur={() => setUsernameTouched(true)}
          required
        />
        {name && usernameTouched && !usernameRequirements.notBanned && (
          <p style={{ fontSize: '12px', color: 'red', margin: '0px' }}>
            ✗ Bad words are not allowed. Choose another username.
          </p>
        )}

        <label>Birthday</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select style={{ flex: 1 }} value={birthDay} onChange={(e) => setBirthDay(e.target.value)}>
            <option value="">Day</option>
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <select style={{ flex: 2 }} value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}>
            <option value="">Month</option>
            {allowedMonths.map((month, idx) => (
              <option key={idx} value={idx + 1}>{month}</option>
            ))}
          </select>
          <select style={{ flex: 1.5 }} value={birthYear} onChange={(e) => setBirthYear(e.target.value)}>
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="field"
          onFocus={() => setShowPasswordPolicy(true)}
          onBlur={() => setShowPasswordPolicy(false)}
        >
          <label className="field-label">Password</label>

          <div className="password-wrapper">
            <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {showPasswordPolicy && (
            <div className="password-policy">
              <p>Password Requirements:</p>
              <ul>
                <li style={{ color: passwordRequirements.minLength ? 'green' : 'red' }}>
                  At least 8 characters
                </li>
                <li style={{ color: passwordRequirements.hasUppercase && passwordRequirements.hasLowercase ? 'green' : 'red' }}>
                  Uppercase and lowercase letters
                </li>
                <li style={{ color: passwordRequirements.hasNumber && passwordRequirements.hasSpecialChar ? 'green' : 'red' }}>
                  Numbers and special characters
                </li>
                <li style={{ color: passwordRequirements.notUsername ? 'green' : 'red' }}>
                  Must not be your username
                </li>
              </ul>
            </div>
          )}
        </div>


          <div className="field">
            <label className="field-label">Confirm Password</label>
            <div className="password-wrapper" style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: '30px' }} // espaço para o ícone
              />
              {confirmPassword && (
                <span
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    color: doPasswordsMatch ? 'green' : 'red',
                  }}
                >
                  {doPasswordsMatch ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>

        <button type="submit">Create account</button>
      </form>
    </div>
  )
}

export default Register