import React, { useState, useContext } from 'react';
import './Auth.css';
import AuthContext from '../context/auth-context';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const authContext = useContext(AuthContext);

  const onChangeEmail = e => {
    setEmail(e.target.value);
  };

  const onChangePassword = e => {
    setPassword(e.target.value);
  };

  const onSwitchMode = () => {
    setIsLogin(isLogin => !isLogin);
  };

  const submitHandler = e => {
    e.preventDefault();
    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    //1st method to call endpoint
    let requestBody = {
      query: `
        query Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            userId
            token
            tokenExpiration
          }
        }
      `,
      variables: {
        email: email,
        password: password
      }
    };

    if (!isLogin) {
      //2nd method to call endpoint
      requestBody = {
        query: `
          mutation {
            createUser(userInput: { email: "${email}", password: "${password}" }) {
              _id
              email
            }
          }
        `
      };
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        if (isLogin && resData?.data?.login?.token) {
          const { userId, token, tokenExpiration } = resData?.data?.login;
          authContext.login(userId, token, tokenExpiration);
        }
      })
      .catch(err => {
        console.error(err);
      });
  };

  return (
    <form className='auth-form' onSubmit={submitHandler}>
      <div className='form-control'>
        <label htmlFor='email'>E-Mail</label>
        <input type='email' id='email' value={email} onChange={onChangeEmail} />
      </div>
      <div className='form-control'>
        <label htmlFor='password'>Password</label>
        <input type='password' id='password' value={password} onChange={onChangePassword} />
      </div>
      <div className='form-actions'>
        <button type='submit'>{isLogin ? 'Login' : 'Signup'}</button>
        <button type='button' onClick={onSwitchMode}>Switch to {isLogin ? 'Signup' : 'Login'}</button>
      </div>
    </form>
  );
};

export default AuthPage;
