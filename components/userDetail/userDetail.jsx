import React from 'react';
import axios from 'axios';
import {
  Typography,
  createMuiTheme,
  ThemeProvider,
  Divider,
  Button,
  withStyles,
} from '@material-ui/core';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import './userDetail.css';
import NameOccupation from './NameOccupation';
import DropzoneDialogExample from '../DropZone';

const StyledButton = withStyles({
  
  label: {
    textTransform: 'capitalize',
  },
})(Button);

/**
 * Define UserDetail, a React componment of CS142 project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: ""
    };
    if (this.props.match.params.userId) {
      axios.get("/user/" + this.props.match.params.userId).then(
        response => { this.setState({ user: response.data }); }).catch((error) => console.log(error))
    }
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.match.params.userId !== prevProps.match.params.userId) {
      axios.get("/user/" + this.props.match.params.userId).then(
        response => {
          this.setState({ user: response.data })
        }).catch(err => {console.log(err)});

    }
  }

  render() {
    
    return (
        <div>
        { this.state.user &&
        <NameOccupation user={this.state.user} />
        }
        
        <Divider light />
        <br />
        <div className='descriptions'>
          <StyledButton
            className='button'
            variant="contained"
            color="primary"
            size="medium"
            href={"#/photos/" + this.state.user._id}
            endIcon={<PhotoLibraryIcon />}>
            album
              </StyledButton>
          <Typography variant="h6" >
            {this.state.user.description}
          </Typography>
          
        </div>

        </div>


      
    );
  }
}

export default UserDetail;
