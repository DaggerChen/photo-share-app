import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { IconButton, Tooltip, Badge } from '@material-ui/core';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import axios from 'axios';


export default function CommentBlock(props) {
    const [open, setOpen] = React.useState(false);
    const [comment, setComment] = React.useState('');

    const handleClickOpen = () => {
        console.log(props);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    const handleSubmitComment = (photo) => {

        axios.post("/commentsOfPhoto/" + photo._id, {
            comment: comment,
        }).catch(err => console.log(err));
        { props.refresh(photo) };
        console.log(photo);
        setOpen(false);
    }

    return (
        <span>
            <Tooltip title='Add Comment'>
                <IconButton
                    color="primary"
                    size='medium'
                    onClick={handleClickOpen}>
                    <Badge
                        badgeContent={props.photo.comments.length}
                        color='primary'
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                    >
                        <ChatBubbleOutlineIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth='sm'>
                <DialogTitle id="form-dialog-title">Add Comment</DialogTitle>
                <DialogContent>

                    <TextField
                        autoFocus
                        multiline
                        label="Comment"
                        rows={3}
                        type="Required"
                        fullWidth
                        onChange={() => setComment(event.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
          </Button>
                    <Button onClick={() => handleSubmitComment(props.photo)} color="primary">
                        Submit
          </Button>
                </DialogActions>
            </Dialog>
        </span>
    );
}