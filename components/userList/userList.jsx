import React from 'react';
import axios from 'axios';
import {
  List,
  ListItem,
  ListItemText,
  Container,
  Typography,
  AppBar,
  Toolbar,
}
  from '@material-ui/core';
import './userList.css';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import FaceIcon from '@material-ui/icons/Face';
import PeopleIcon from '@material-ui/icons/People';


/**
 * Define UserList, a React componment of CS142 project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: ''
    }
    axios.get("/user/list").then(
      response => { {
        if (response.status == 401) {
          console.log(1);
        } else {
        this.setState({ userList: response.data })
        }
      }}).catch((error) => console.log(error));
  }

  handleButtonClick = (id) => {
    window.location.href = "http://localhost:3000/photo-share.html#/users/" + id;
  }

  render() {
    return (
      <div>
        <div id='user-group-banner'> <PeopleIcon /> <Typography variant='h6' display='inline'> UserList </Typography> </div>
        <List component="nav">
          
          {this.state.userList.length > 0 && this.state.userList.map((data) =>
            <ListItem button divider key={data._id} onClick={(e) => this.handleButtonClick(data._id, e)}>
              <ListItemIcon>
                <FaceIcon />
              </ListItemIcon>
              <ListItemText primary={data.first_name + ' ' + data.last_name} />
            </ListItem>
          )}
        </List>
        
      </div>
    )

  }
}

export default UserList;
