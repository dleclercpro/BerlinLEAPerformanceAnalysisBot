import { ChartType } from 'chart.js';
import Graph from './Graph';
import { getTimeSpentSinceMidnight } from '../../utils/time';
import SessionHistory from '../sessions/SessionHistory';
import { WEEKDAYS } from '../../constants/times';
import { GraphAxes, Locale, TimeUnit } from '../../types';
import { formatDate, translateWeekday } from '../../utils/locale';
import CompleteSession from '../sessions/CompleteSession';
import { LONG_DATE_TIME_FORMAT_OPTIONS } from '../../config/locale';
import { WEEKDAY_COLORS } from '../../config/styles';
import { NotEnoughDataError } from '../../errors';

const IGNORE_LENGTHY_SESSIONS = true;

const noAppointmentSessionFilter = (session: CompleteSession) => {
    return session.foundNoAppointment(IGNORE_LENGTHY_SESSIONS);
}

/**
 * This graph shows how long it takes a user to reach the 'keine Termine frei'
 * message on an hourly basis.
 */
class UserSessionLengthUntilFailureGraph extends Graph<SessionHistory> {
    protected name: string = 'UserSessionLengthUntilFailure';
    protected type: ChartType = 'scatter';
    protected axes: GraphAxes = {
        x: { label: `Tageszeit`, unit: TimeUnit.Hours, min: 0, max: 24 },
        y: { label: `Dauer`, unit: TimeUnit.Seconds },
    };

    public async draw(history: SessionHistory) {
        if (history.getSize() < 2) throw new NotEnoughDataError('Not enough data to plot graph.');
        
        const start = history.getEarliestSession()!.getStartTime();
        const end = history.getLatestSession()!.getEndTime();

        const sessionCount = history.getSessions(noAppointmentSessionFilter).length;

        this.title = [
            `Länge einer User-Session auf der Seite des Berliner LEA`,
            `Gesamtanzahl der betrachteten User-Sessions: ${sessionCount}`,
            `Start: ${formatDate(start, LONG_DATE_TIME_FORMAT_OPTIONS)}`,
            `Ende: ${formatDate(end, LONG_DATE_TIME_FORMAT_OPTIONS)}`,
        ];

        await super.draw(history);
    }

    protected generateDatasets(history: SessionHistory) {
        return WEEKDAYS.map((weekday, i) => {
            const sessions = history.getSessionsByWeekday(weekday, noAppointmentSessionFilter);
            const data = sessions.map(session => {
                return {
                    x: getTimeSpentSinceMidnight(session.getStartTime()).to(this.axes.x.unit as TimeUnit).getAmount(),
                    y: session.getDuration().to(this.axes.y.unit as TimeUnit).getAmount(),
                };
            });

            // Daily graph: first and last point (midnight) should be equal
            if (data.length > 0) {
                data.push({ x: 24, y: data[0].y });
            }

            return {
                data,
                label: translateWeekday(weekday, Locale.DE),
                color: WEEKDAY_COLORS[i],
            };
        });
    }
}

export default UserSessionLengthUntilFailureGraph;