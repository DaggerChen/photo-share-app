import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, withStyles } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';


export default function SimpleMenu(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton size='medium' aria-controls="simple-menu" color='inherit' aria-haspopup="true" onClick={handleClick}>
                <AccountCircleIcon />
            </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                getContentAnchorEl={null}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
            >
                <MenuItem onClick={handleClose}>Profile</MenuItem>

                <MenuItem onClick={props.handleExit}>Logout</MenuItem>
                <MenuItem onClick={props.handleDeleteAccountOpen}>Delete Account</MenuItem>
                <Dialog open={props.deleteAccountOpen} onClose={props.handleDeleteAccountClose} aria-labelledby="delete-account">
                    <DialogTitle id="delete-account"> Delete Account </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete your account?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={props.handleDeleteAccountClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={props.handleDeleteAccount} color="primary">
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Menu>
        </div>
    );
}


