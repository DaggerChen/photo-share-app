import React from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter, Route, Switch, Redirect
} from 'react-router-dom';
import {
  Grid, Typography, Paper
} from '@material-ui/core';
import './styles/main.css';

// import necessary components
import TopBar from './components/topBar/TopBar';
import UserDetail from './components/userDetail/UserDetail';
import UserList from './components/userList/UserList';
import UserPhotos from './components/userPhotos/UserPhotos';
import LoginRegister from './components/loginRegister/loginRegister';


class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loginName: '',
      loginId: '',
      refresh: 1,

    }
  }


  loginInfoCallback = (login_id, login_name) => {
    if (login_id) {
      this.setState({ loggedIn: true, loginId: login_id, loginName: login_name });
      window.location.href = "http://localhost:3000/photo-share.html#/users/" + this.state.loginId;
    } else {
      this.setState({ loggedIn: false, loginId: '', loginName: '' });
      window.location.href = "http://localhost:3000/photo-share.html#/login-register";
    }

  }

  render() {

    return (
      <div className='wrapper'>
        <HashRouter>

          <Grid container spacing={8} >

            <Grid item xs={12} >
              <Switch>
                <Route path="/:type/:userId"
                  render={props => <TopBar {...props} callback={this.loginInfoCallback} />} />
                <Route path="/" render={props => <TopBar {...props} callback={this.loginInfoCallback} />} />
              </Switch>
            </Grid>


            <Route path='/login-register'>

              {
                (!this.state.loggedIn) &&
                <Route path='/login-register' render={props => <LoginRegister {...props} callback={this.loginInfoCallback} />} />
              }


            </Route>
            {this.state.loggedIn &&
              <Switch>
                <Route path="/">

                  <Grid item sm={3}>
                    <Paper className="cs142-main-grid-item" elevation={2}>
                      <UserList className='name-list' />
                    </Paper>

                  </Grid>


                  <Grid item sm={9}>
                    <Paper className="cs142-main-grid-item" elevation={2}>
                      <Switch>

                        <Route exact path="/"
                          render={() =>
                            <Typography variant="body1">
                              Welcome to your photosharing app! This <a href="https://material-ui.com/demos/paper/">Paper</a> component
                  displays the main content of the application. The {"sm={9}"} prop in
                  the <a href="https://material-ui.com/layout/grid/">Grid</a> item component makes it responsively
                  display 9/12 of the window. The Switch component enables us to conditionally render different
                  components to this part of the screen. You don&apos;t need to display anything here on the homepage,
                  so you should delete this Route component once you get started.
                  </Typography>}
                        />
                        {
                          this.state.loggedIn ?
                            <Route path="/photos/:userId" render={props => <UserPhotos {...props} />} />
                            :
                            <Redirect path="/photos/:userId" to="/login-register" />
                        }
                        {
                          this.state.loggedIn ?
                            <Route path="/users/:userId" render={props => <UserDetail {...props} />} />
                            :
                            <Redirect path="/users/:userId" to="/login-register" />
                        }

                        {
                          this.state.loggedIn ?
                            <Route path="/users" component={UserList} />
                            :
                            <Redirect path="/users" to="/login-register" />
                        }

                      </Switch>

                    </Paper>
                  </Grid>

                </Route>

              </Switch>
            }
            <Redirect path="/" to="/login-register" />

          </Grid>

        </HashRouter>
      </div>
    );
  }
}


ReactDOM.render(
  <PhotoShare />,
  document.getElementById('photoshareapp'),
);
