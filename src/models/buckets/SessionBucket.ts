import { ErrorCounts } from '../../types';
import { generateEmptyCounts, toCountsFromArray } from '../../utils/array';
import { getTimeSpentSinceMidnight } from '../../utils/time';
import TimeDuration from '../TimeDuration';
import CompleteSession from '../sessions/CompleteSession';
import Bucket from './Bucket';

class SessionBucket extends Bucket<TimeDuration, CompleteSession> {

    public getStartTime() {
        return this.start;
    }

    public getEndTime() {
        return this.end;
    }

    public getSessions() {
        return this.data;
    }

    public getErrorCounts(errorFilter: (error: string) => boolean = () => true): ErrorCounts {
        const errors = this
            .getSessions()
            .reduce((prevErrors: string[], session: CompleteSession) => {
                return [...prevErrors, ...session.getErrors()];
            }, [])
            .filter(errorFilter);

        return {
            ...generateEmptyCounts(errors),
            ...toCountsFromArray(errors),
        };
    }

    public format() {
        return `[${this.start.format()}-${this.end.format()}]`;
    }

    public contains(session: CompleteSession) {
        const sinceMidnight = getTimeSpentSinceMidnight(session.getStartTime());

        return this.start.smallerThanOrEquals(sinceMidnight) && sinceMidnight.smallerThan(this.end);
    }
}

export default SessionBucket;