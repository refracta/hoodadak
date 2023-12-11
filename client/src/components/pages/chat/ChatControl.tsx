import React from "react";
import {IconButton, Paper, TextField} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

export default function
    ChatControl({connectionStatus, uploadPercent, downloadPercent, handleFileUpload, handleSendMessage}: {
    connectionStatus: string
    uploadPercent: number,
    downloadPercent: number,
    handleFileUpload: React.ChangeEventHandler<HTMLInputElement>
    handleSendMessage: (message: string, setMessage: React.Dispatch<React.SetStateAction<string>>) => void
}) {
    const [message, setMessage] = React.useState('');
    return (
        <Paper component="form"
               sx={{
                   display: 'flex',
                   alignItems: 'center',
                   width: 'calc(100% - 3px - 20px)',
                   margin: '10px 10px 10px 10px',
                   border: 'solid 1.5px #1976d2',
                   borderRadius: '30px'
               }}>
            <IconButton style={{
                background:
                    `linear-gradient(to top, rgba(100, 181, 246, 0.7) ${uploadPercent}%, transparent ${uploadPercent}%),
                    linear-gradient(to bottom, rgba(244, 67, 54, 0.7) ${downloadPercent}%, transparent ${downloadPercent}%)`
            }} disabled={connectionStatus === 'disconnected' || uploadPercent > 0} sx={{p: '10px'}}
                        aria-label="upload picture" component="label">
                <input hidden accept="*" type="file" onChange={handleFileUpload}/>
                <AttachFileIcon/>
            </IconButton>
            <TextField
                disabled={connectionStatus === 'disconnected'}
                multiline
                maxRows={4}
                placeholder="Type a message"
                variant="standard"
                InputProps={{disableUnderline: true}}
                sx={{ml: 1, flex: 1}}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (message.length === 0) {
                            return;
                        }
                        handleSendMessage(message, setMessage);
                    }
                }
                }
            />
            <IconButton sx={{p: '10px'}} aria-label="send" disabled={message.length == 0}
                        onClick={() => handleSendMessage(message, setMessage)}>
                <SendIcon/>
            </IconButton>
        </Paper>
    );
}
