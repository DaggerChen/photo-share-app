import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { Typography } from '@material-ui/core';



export default function NameOccupation(props) {
  // console.log(props);
  return (
  
    <div className='header'>
      <div>
        <h1 className='name'> <i>{props.user.first_name} {props.user.last_name} </i> </h1>
        <Typography variant='h4' display='inline'> 	&ensp; </Typography>
        <span id='occupation'> {props.user.occupation} </span>
      </div>
      <span id='location'> {props.user.location} </span>
    </div>



  );
}