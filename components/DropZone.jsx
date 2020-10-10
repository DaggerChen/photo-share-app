

import React, { Component } from 'react'
import { DropzoneArea } from 'material-ui-dropzone'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { blue } from '@material-ui/core/colors';

class UploadZone extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: []
        };
    }

    handleChange(files) {
        this.setState({
            files: files
        });
        this.props.confirmCallback(files);
        
        
    }
    


    render() {
        const theme = createMuiTheme({
            overrides: {
                MuiDropzoneArea: {
                    icon: {
                        color: '#3f51b5'
                    },
                    text: {
                        color: '#2c387e'

                    }
                }
            }
        });

        return (
            <MuiThemeProvider theme={theme}>
                <DropzoneArea
                    onChange={this.handleChange.bind(this)}
                    acceptedFiles={['image/*']}
                    previewGridProps={{ container: { justify: 'center' } }}
                    filesLimit={1}
                    showFileNamesInPreview
                    dropzoneText='Drag and drop an image here or click'
                    maxFileSize={5000000}
                    Icon={AddAPhotoIcon}
                />
            </MuiThemeProvider>
        )
    }
}

export default UploadZone;