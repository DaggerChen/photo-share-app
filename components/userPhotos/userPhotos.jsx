import React from 'react';
import axios from 'axios';

import {
  Typography,
  Button,
  Divider,
  IconButton,
  ThemeProvider,
  createMuiTheme,
  Paper,
  withStyles,
  Tooltip,
  Badge,
  Fab,
  Toolbar,
  Box
} from '@material-ui/core';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ClearIcon from '@material-ui/icons/Clear';

import CommentBlock from './commentBlock';
import './userPhotos.css';
import NameOccupation from '../userDetail/NameOccupation'
import ScrollTop from '../ScrollTop'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

const StyledButton = withStyles({

  label: {
    textTransform: 'capitalize',
  },
})(Button);

/**
 * Define UserPhotos, a React componment of CS142 project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: '',
      user: '',
      loginId: '',
      fullName: '',
      likes: [],
      numLikes: []
    };
    console.log(props);

    axios.get("/photosOfUser/" + this.props.match.params.userId).then(
      response => {
        console.log(response.data);
        this.setState({ user: response.data });
      }).catch((error) => console.log(error));

    if (this.props.match.params.userId) {
      axios.get("/user/" + this.props.match.params.userId).then(
        response => { this.setState({ userInfo: response.data }); }).catch((error) => console.log(error))
    }

    axios.get("admin/login").then(
      response => { this.setState({ loginId: response.data.id, fullName: response.data.fullName }) }
    ).catch(err => console.log(err));
    axios.post("/checkPhotoLike/" + this.props.match.params.userId, { reorder: 1 }).then(
      response => {

        this.setState({ likes: response.data.photoLikes });
        this.setState({ numLikes: response.data.numLikes });
        
      }
    ).catch(err => console.log(err));
  }
  timeConvert = (date) => {
    let commentTime = new Date(date);
    let offset = commentTime.getTimezoneOffset();
    let newTime = new Date(commentTime.getTime() - (offset * 60 * 1000));
    let newTimeString = newTime.toISOString();
    return newTimeString.replace(/T|(\..*)/g, ' ');
  }

  handleSubmitComment = () => {

    axios.get("/photosOfUser/" + this.props.match.params.userId).then(
      response => { this.setState({ user: response.data }) }).catch((error) => console.log(error));

  }

  handleLike = (photo) => {
    let pos = this.state.user.indexOf(photo);
    let newLikes = this.state.likes;
    let newNumLikes = this.state.numLikes;
    newLikes[pos] = 1;
    newNumLikes[pos] += 1;
    axios.post("/likePhoto/" + photo._id);
    this.setState({ likes: newLikes });
    this.setState({ numLikes: newNumLikes });



    console.log("photo liked");
  }
  handleDislike = (photo) => {
    let pos = this.state.user.indexOf(photo);
    let newLikes = this.state.likes;
    let newNumLikes = this.state.numLikes;
    newLikes[pos] = 0;
    newNumLikes[pos] -= 1;
    axios.post("/dislikePhoto/" + photo._id);
    this.setState({ likes: newLikes });
    this.setState({ numLikes: newNumLikes });

    console.log("photo disliked");
  }

  handleDeleteComment = (photo, comment) => {
    console.log(photo);
    axios.post("/delete/comment/" + photo._id + '/' + comment._id).then(res => console.log(res)).catch(err => console.log(err));
    axios.get("/photosOfUser/" + this.props.match.params.userId).then(
      response => { this.setState({ user: response.data }) }).catch((error) => console.log(error));
  }

  handleDeletePhoto = (photo) => {
    console.log(photo);
    axios.post("/delete/photo/" + photo._id);
    axios.get("/photosOfUser/" + this.props.match.params.userId).then(
      response => { this.setState({ user: response.data }) }).catch((error) => console.log(error));
  }

  render() {
    const theme = createMuiTheme({
      typography: {
        button: {
          textTransform: 'capitalize'
        },
      },
      palette: {
        secondary: {
          main: '#b22a00',
        }
      }

    });

    return (
      <div className='wholeSection' >
        <Box id="back-to-top-anchor" />
        {this.state.userInfo &&
          <NameOccupation user={this.state.userInfo} />

        }
        <Divider light />
        <br />
        <div className='profileButton'>

          <StyledButton
            className='button'
            variant="contained"
            color="primary"
            size='medium'
            href={"#/users/" + this.props.match.params.userId}
            endIcon={<AccountBoxIcon />}>
            profile
        </StyledButton>
        </div>



        <div className='photo-comment' >

          {this.state.user &&
            this.state.user.map((photo) =>

              <Paper variant='outlined' className='photo-section' key={photo.file_name}>
                {(this.state.loginId === this.props.match.params.userId) &&
                  <IconButton
                    id='delete'
                    size='small'
                    onClick={(e) => this.handleDeletePhoto(photo, e)}>
                    <ClearIcon />
                  </IconButton>
                }
                <img src={"http://localhost:3000/images/" + photo.file_name}></img>
                <Typography variant='subtitle2'> {this.timeConvert(photo.date_time)} </Typography>
                <div className='new-comment'>

                  <CommentBlock {...this.props} pos={this.state.user.indexOf(photo)} photo={photo}
                    refresh={this.handleSubmitComment} />

                  <ThemeProvider theme={theme}>
                    {this.state.likes[this.state.user.indexOf(photo)] ?
                      (<Tooltip title='Like'>
                        <IconButton size="medium" onClick={(e) => this.handleDislike(photo, e)}>
                          <Badge badgeContent={this.state.numLikes[this.state.user.indexOf(photo)]} color='secondary'
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}>
                            < FavoriteIcon color='secondary' fontSize="inherit" />
                          </Badge>
                        </IconButton>
                      </Tooltip>)
                      :
                      (<Tooltip title='Dislike'>
                        <IconButton size="medium" onClick={(e) => this.handleLike(photo, e)}>
                          <Badge badgeContent={this.state.numLikes[this.state.user.indexOf(photo)]} color='secondary'
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}>
                            < FavoriteBorderIcon color='secondary' fontSize="inherit" />
                          </Badge>
                        </IconButton>
                      </Tooltip>)
                    }

                  </ThemeProvider>

                </div>

                

                <div className='comment-section'>
                  {photo.comments[0] && 
                    <div>
                      <Divider light />
                      <br />
                    </div>
                  }
                  {photo.comments &&
                    photo.comments.map((oneComment) =>
                      <div className='comment-all' key={oneComment._id}>
                        
                        { (oneComment.user && oneComment.user._id === this.state.loginId) &&
                          <IconButton size='small' className='delete-comment'
                            onClick={(e) => this.handleDeleteComment(photo, oneComment, e)}>
                            <ClearIcon />
                          </IconButton>
                        }
                        
                        <Typography className='comment-text' variant='subtitle2' > {oneComment.comment} </Typography>
                        {oneComment.user &&
                        <div className='comment'>

                          <StyledButton color="primary" id='user-link' href={"http://localhost:3000/photo-share.html#/users/" + oneComment.user._id}>
                            {oneComment.user.first_name + ' ' + oneComment.user.last_name}
                          </StyledButton>

                          <Typography variant='subtitle2' className='commentDate'> {
                            this.timeConvert(oneComment.date_time)
                          }  </Typography>

                        </div>
                      }

                        <Divider />

                      </div>
                    )
                  }

                </div>
              </Paper>

            )

          }



        </div>
        <ScrollTop {...this.props}>
          <Fab color='primary' size='small' aria-label='scroll back to top'>
            <KeyboardArrowUpIcon />
          </Fab>
        </ScrollTop>
      </div>
    )
  }
}

export default UserPhotos;
