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

const wasSessionFailure = (session: CompleteSession) => {
    return session.wasFailure() && session.isDurationReasonable();
}



class SessionLengthGraph extends Graph<SessionHistory> {
    protected type: ChartType = 'scatter';
    protected axes: GraphAxes = {
        x: { label: `Tageszeit`, unit: TimeUnit.Hours, min: 0, max: 24 },
        y: { label: `Dauer`, unit: TimeUnit.Seconds },
    };

    public async draw(history: SessionHistory) {
        const start = history.getEarliestSession()!.getStartTime();
        const end = history.getLatestSession()!.getEndTime();

        const sessionCount = history.getSessions(wasSessionFailure).length;

        this.title = [
            `Länge einer User-Session auf der LEA-Seite`,
            `Start: ${formatDate(start, LONG_DATE_TIME_FORMAT_OPTIONS)} | Ende: ${formatDate(end, LONG_DATE_TIME_FORMAT_OPTIONS)}`,
            `Anzahl der User-Sessions: ${sessionCount}`,
        ];

        await super.draw(history);
    }

    protected generateDatasets(history: SessionHistory) {
        return WEEKDAYS.map((weekday, i) => {
            const sessions = history.getSessionsByWeekday(weekday, wasSessionFailure);
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

export default SessionLengthGraph;