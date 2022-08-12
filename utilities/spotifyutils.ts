export namespace SpotifyUtils {
    export function CovertDurationToTime(duration_ms: number | undefined): string {
        if (!duration_ms)
            return '00:00';
        
        let duration = new Date(duration_ms).toISOString();
        const offset = duration.at(11) !== "0" || duration.at(12) !== "0" ? -3 : 0;
        return duration.slice(14 + offset, 19);
    }

    export function GetPercentageProgress(position: number | undefined, duration_ms: number | undefined) {
        if (position && duration_ms) {
            return Number((position / duration_ms).toFixed(3)) * 100;
        }
        return 0;
    }

    export function getContextLink(contextUri: string | undefined | null): string {
        if (contextUri) {
            const contextStr = contextUri.split(':');
            if (contextStr.length === 3) {
                const contextType = contextStr[1];
                const contextId = contextStr[2];
                let navigateTarget = '';
                switch (contextType) {
                    case 'album':
                        navigateTarget = 'albums';
                        break;
                    case 'artist':
                        navigateTarget = 'artists';
                        break;
                    case 'show':
                        navigateTarget = 'podcasts';
                        break;
                    case 'episode':
                        navigateTarget = 'episodes';
                        break;
                    case 'playlist':
                        navigateTarget = 'playlists';
                        break;
                    default:
                        return "/";
                }

                return `/${navigateTarget}/${contextId}`;
            }
        }
        return "/";
    }
}