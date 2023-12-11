import {AppContext} from "../../types/hoodadak-client";
import {User} from "../../types/hoodadak";

export function getStatusColor({users, chat, connectionStatus, user}: AppContext, rawTargetUser?: User) {
    if (!rawTargetUser) {
        rawTargetUser = chat?.user;
    }
    const targetUser = users.find(u => u.hash === rawTargetUser?.hash);
    const isSelectedMe = targetUser?.selectedUser?.hash === user?.hash;
    let statusColor;
    if (connectionStatus === 'connected' && targetUser?.hash === chat?.user.hash) {
        statusColor = 'green';
    } else if (isSelectedMe) {
        statusColor = 'orange';
    } else if (targetUser) {
        statusColor = 'red';
    }
    return statusColor;
}

/*
    let targetUser = users.find(u => u.hash === chat?.user.hash);
    let isSelectedMe = targetUser?.selectedUser?.hash === user?.hash;
    let statusColor;
    if (connectionStatus === 'connected') {
        statusColor = 'green';
    } else if (isSelectedMe) {
        statusColor = 'orange';
    } else if (targetUser) {
        statusColor = 'red';
    }
 */