export class TimeUtils {
    public static timeSince(date: Date) {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + " years ago";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months ago";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days ago";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours ago";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes ago";
        }
        if (seconds > 10) {
            return seconds + " seconds ago"
        }
        return "just now";

    }
}