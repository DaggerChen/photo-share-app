import React from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
}
  from '@material-ui/core';
import "./LoginRegister.css";


/**
 * Define UserList, a React componment of CS142 project #5
 */
class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: '',
      password: '',
      secondPassword: '',
      loginId: '',
      open: false,
    }

  }

  handleLoginName = (event) => {
    this.setState({ loginName: event.target.value });
  }
  handleChangePassword = (event) => {
    this.setState({ password: event.target.value });
  }

  handleSubmit = (event) => {
    
    axios.post("/admin/login", {

      login_name: this.state.loginName,
      password: this.state.password
    }).then(response => {
      this.setState({ loginId: response.data.id });
      this.props.callback(this.state.loginId, this.state.loginName)
    }).catch(err => { this.setState({ loginId: '' }); alert("Invalid Login Name!"); console.log(err) });

  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleRegister = () => {
    if (!this.state.loginId || !this.state.firstName || !this.state.lastName || !this.state.newPassword ||
      !this.state.passwordAgain || !this.state.location || !this.state.occupation || !this.state.description) {
      alert("All fields must be completed");
    }
    else if (this.state.newPassword !== this.state.passwordAgain) {
      alert("The passwords entered must match!");
    } else {
      this.setState({ open: false });
      axios.post('/user', {
        loginName: this.state.loginId,
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        password: this.state.newPassword,
        location: this.state.location,
        occupation: this.state.occupation,
        description: this.state.description
      }).then((res) => {
        console.log(res);
      }).catch(err => console.log(err));
    }
  }

  handleChangeInput = (event) => {
    let value = event.target.value;
    this.setState({ [event.target.id]: value });
  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {

      this.handleSubmit();
    }
  }
  render() {

    return (
      <Container className='login-window' maxWidth='xs' >
        <div className='login-text'>
          <TextField placeholder='Your Login Name' label='Login Name' onChange={this.handleLoginName} onKeyDown={this.handleKeyDown}/>
        </div>
        <div className='login-text'>
          <TextField type='password' placeholder='Password' label='Password' onChange={this.handleChangePassword} onKeyDown={this.handleKeyDown}/>
        </div>

        <div className='login-button'>
          <Button variant='outlined' color='primary' component='span' onClick={this.handleSubmit} > Login </Button>
        </div>
        <div className='login-button'>
          <Button variant='outlined' color='primary' component='span' onClick={this.handleClickOpen}> Register Me! </Button>
          <Dialog open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title" >
            <DialogTitle id="form-dialog-title">Register New User</DialogTitle>
            <DialogContent >
              <DialogContentText>
                Fill in all blanks to register as an new user!
              </DialogContentText>
              <div className='register'>
                <TextField autoFocus margin="dense" id="loginId" label="Account Name" fullWidth onChange={(e) => this.handleChangeInput(e)} />
                <div id='name'>
                  <TextField autoFocus id="firstName" label="First Name" onChange={(e) => this.handleChangeInput(e)} />

                  <TextField autoFocus id="lastName" label="Last Name" onChange={(e) => this.handleChangeInput(e)} />
                </div>
                <TextField autoFocus margin="dense" id="newPassword" label="Password" type='password' onChange={(e) => this.handleChangeInput(e)} />
                <TextField autoFocus margin="dense" id="passwordAgain" label="Enter Your Password Again" type='password' onChange={(e) => this.handleChangeInput(e)} />
                <TextField autoFocus margin="dense" id="location" label="Location" fullWidth onChange={(e) => this.handleChangeInput(e)} />
                <TextField autoFocus margin="dense" id="occupation" label="Occupation" fullWidth onChange={(e) => this.handleChangeInput(e)} />
                <TextField autoFocus margin="dense" id="description" label="Describe Yourself" multiline rows={3} fullWidth onChange={(e) => this.handleChangeInput(e)} />
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
          </Button>
              <Button onClick={this.handleRegister} color="primary">
                Submit
          </Button>
            </DialogActions>
          </Dialog>
        </div>

      </Container>
    )

  }
}

export default LoginRegister;
