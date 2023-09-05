import React from 'react';
import AuthContext from './auth-context';

class AuthProvider extends React.Component {
  state = {
    userId: null,
    token: null,
    tokenExpiration: 0,
  };

  login = (userId, token, tokenExpiration) => {
    this.setState({ userId, token, tokenExpiration });
  };

  logout = () => {
    this.setState({ userId: null, token: null, tokenExpiration: 0 });
  };

  render() {
    return (
      <AuthContext.Provider value={{
        token: this.state.token,
        userId: this.state.userId,
        login: this.login,
        logout: this.logout
      }}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
};

export default AuthProvider;
