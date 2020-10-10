import React from 'react';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl,
  FormGroup, FormControlLabel, Checkbox, Container, Box, Grid
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import './TopBar.css';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import DeleteForeverOutlinedIcon from '@material-ui/icons/DeleteForeverOutlined';
import UploadZone from '../DropZone'

import SimpleMenu from './simpleMenu'


/**
 * Define TopBar, a React componment of CS142 project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      userList: '',
      version: 0,
      loginID: '',
      loginName: '',
      open: false,
      fileName: '',
      visibilityOpen: false,
      userInvisible: [],
      allInvisible: false,
      deleteAccountOpen: false
    };
    if (this.props.match.params.userId) {
      axios.get("/user/" + this.props.match.params.userId).then(
        response => {
          this.setState({ user: response.data });
        }).catch(err => console.log(err))
    }

  }


  componentDidUpdate = (prevProps) => {

    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      axios.get("/admin/login").then(response => this.setState({ loginID: response.data.id, loginName: response.data.currentUser }))
        .catch(err => { console.log(err); this.setState({ loginID: '' }) });
      if (!this.props.match.params.userId) {
        this.setState({ user: '' });
      } else {
        axios.get("/user/" + this.props.match.params.userId).then(
          response => {
            this.setState({ user: response.data });
          }).catch((error) => console.log(error));
      }
    }
  }

  handleExit = () => {
    axios.post("/admin/logout").then(response => {
      console.log(response);
      this.setState({ loginID: '', loginName: '' });
      this.props.callback(this.state.loginId, this.state.loginName);
    }).catch(err => { console.log(err); this.setState({ loginID: '' }) });
  }

  handleUploadButtonClicked = (e) => {
    console.log(this.uploadInput);
    e.preventDefault();
    if (this.uploadInput) {
      this.setState({ open: false });
      // Create a DOM form and add the file to it under the name uploadedphoto
      let user_allowed = [];
      for (var i = 0; i < this.state.userInvisible.length; i++) {
        if (!this.state.userInvisible[i]) {
          user_allowed.push(this.state.userList[i]._id);
        }
      }
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput[0]);
      domForm.append('new', user_allowed);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log("New photo created with id" + res.data)
        }).catch(err => console.log(`POST ERR: ${err}`));

    }
    this.setState({ allInvisible: false });
  }

  handleClickOpen = () => {
    this.setState({ open: true });
    axios.get("/user/list").then(
      response => {
        {
          if (response.status == 401) {
            console.log('Unauthorized');
          } else {
            this.setState({ userList: response.data });
            console.log(this.state.userList)
          }
        }
      }).then(() => {
        let usersVisibility = [];
        for (var i = 0; i < this.state.userList.length; i++) {
          usersVisibility.push(false);
        }
        console.log(usersVisibility);
        this.setState({ userInvisible: usersVisibility });
      }
      ).catch((error) => console.log(error));
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleVisibilityOpen = () => {
    this.setState({ visibilityOpen: true });
  }

  handleVisibilityClose = () => {
    let usersVisibility = [];
    for (var i = 0; i < this.state.userList.length; i++) {
      usersVisibility[i] = false;
    }

    this.setState({ visibilityOpen: false, userInvisible: usersVisibility, allInvisible: false });
  }

  handleVisibilityConfirm = () => {
    console.log(this.state.userInvisible)
    this.setState({ visibilityOpen: false });
  }

  handleVisibilityChange = (e, user) => {
    let pos = this.state.userList.indexOf(user);
    let usersVisibility = this.state.userInvisible;
    usersVisibility[pos] = e.target.checked;
    this.setState({ userInvisible: usersVisibility });
    if (!usersVisibility[pos]) {
      this.setState({ allInvisible: false });
    } else if (usersVisibility.filter(v => v == false).length === 1) {
      this.setState({ allInvisible: true });
    }
    console.log(usersVisibility);
  }

  handleAllVisibilityChange = (e) => {
    let usersVisibility = this.state.userInvisible;
    for (var i = 0; i < this.state.userList.length; i++) {
      if (this.state.userList[i]._id != this.state.loginID) {
        usersVisibility[i] = e.target.checked;
      }
    }
    this.setState({ userInvisible: usersVisibility });
    this.setState({ allInvisible: e.target.checked });

  }

  handleDeleteAccountOpen = () => {
    this.setState({ deleteAccountOpen: true });
  }
  handleDeleteAccountClose = () => {
    this.setState({ deleteAccountOpen: false });
  }
  handleDeleteAccount = () => {
    axios.post("/delete/user/" + this.state.loginID).then(res => {
      console.log(res);
      this.setState({ deleteAccountOpen: false });
      this.handleExit();
    });


  }

  render() {

    return (
      <AppBar className="cs142-topbar-appBar" >


        <Toolbar className="cs142-topbar-appBar-toolBar">

          {!this.state.loginName ?
            <Grid container spacing={0} alignItems="center" justify='flex-start'>
              <Grid item xs={1}>
              </Grid>
              <Grid item  > <Typography variant='h5'> Please Login to the Photo-Share-App</Typography> </Grid>

            </Grid>

            :

            <Grid container spacing={0} alignItems="center" justify='center'>
              <Grid container item xs={4} >
                <Box component='span'>

                  <IconButton color='inherit' aria-label="upload-picture" component="span" onClick={this.handleClickOpen}>
                    <PhotoCamera />
                  </IconButton>
                  <Dialog open={this.state.open} fullWidth onClose={this.handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Upload New Photo</DialogTitle>
                    <DialogContent>

                      <div>
                        <UploadZone confirmCallback={(domFileRef) => { this.uploadInput = domFileRef }} />
                      </div>

                      <IconButton className='visibility-control' color="primary" aria-label="visibility-control" component="span" onClick={this.handleVisibilityOpen}>
                        < VisibilityOffIcon />
                      </IconButton>
                      <Dialog open={this.state.visibilityOpen} onClose={this.handleVisibilityClose} aria-labelledby="invisible-to-users">
                        <DialogTitle id="invisible-to-users"> Who Can&apos;t See It? </DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            Check the boxes for users who should not view this photo.
            </DialogContentText>
                          <FormControl component="fieldset">
                            <FormGroup>
                              <FormControlLabel
                                control={<Checkbox
                                  id='visibility-select-all'
                                  checked={this.state.allInvisible}
                                  onChange={(e) => this.handleAllVisibilityChange(e)} />}
                                label={<Typography variant='button'>Only visible to myself</Typography>}
                              />
                              {this.state.userList.length > 0 && this.state.userList.map((data) =>
                                (data._id != this.state.loginID) &&
                                <FormControlLabel
                                  key={data.first_name}
                                  control={<Checkbox name={data.first_name}
                                    checked={this.state.userInvisible[this.state.userList.indexOf(data)]}
                                    onChange={(e) => this.handleVisibilityChange(e, data)}
                                  />}
                                  label={data.first_name + ' ' + data.last_name}
                                />
                              )}
                            </FormGroup>
                          </FormControl>
                        </DialogContent>
                        <DialogActions>
                          <Button size='large' onClick={this.handleVisibilityClose} color="primary">
                            Cancel
                            </Button>
                          <Button size='large' onClick={this.handleVisibilityConfirm} color="primary">
                            Confirm
                            </Button>
                        </DialogActions>
                      </Dialog>

                    </DialogContent>
                    <DialogActions>
                      <Button onClick={this.handleClose} color="primary" >
                        <Typography variant='h6'> Cancel </Typography>
                      </Button>
                      <Button onClick={this.handleUploadButtonClicked} color="primary">
                        <Typography variant='h6'> Upload </Typography>
                      </Button>

                    </DialogActions>
                  </Dialog>

                </Box>
              </Grid>

              <Grid container item xs={4} justify='center'> {this.props.match.params.type === 'users' &&
                <Typography variant="h5" color="inherit">
                  Profile of {this.state.user.first_name + ' ' + this.state.user.last_name}
                </Typography>
              }
                {this.props.match.params.type === 'photos' &&
                  <Typography variant="h5" color="inherit">
                    Photos of {this.state.user.first_name + ' ' + this.state.user.last_name}
                  </Typography>
                } </Grid>
              <Grid container item xs={4} alignItems="center" justify='flex-end'>
                <Typography variant='h5' component='span'>

                  Hi,&nbsp;
              </Typography>
                <Typography variant='h5' component='span' id='welcome-message'>{this.state.loginName}</Typography>
                <SimpleMenu handleExit={this.handleExit} handleDeleteAccount={this.handleDeleteAccount}
                  handleDeleteAccountOpen={this.handleDeleteAccountOpen} handleDeleteAccountClose={this.handledeleteAccountClose} deleteAccountOpen={this.state.deleteAccountOpen} />

              </Grid>
            </Grid>
          }
        </Toolbar>

      </AppBar>
    );
  }
}

export default TopBar;
