import { Log } from '../../types';
import TimeDuration, { TimeUnit } from '../TimeDuration';
import os from 'os';
import process from 'process';
import crypto from 'crypto';
import { EXPECTED_ERRORS } from '../../config';
import { FIVE_MINUTES, LogMessages } from '../../constants';
import { BackToFindAppointmentPageError, NoAppointmentsError } from '../../errors';

interface Options {
    id: string,
    startTime?: Date,
    endTime?: Date,
}

class Session {
    protected id: string;

    protected startTime?: Date;
    protected endTime?: Date;
    
    protected logs: Log[];
    protected errors: string[];

    protected constructor ({ id, startTime, endTime }: Options) {
        this.id = id;
        this.startTime = startTime;
        this.endTime = endTime;
        this.logs = [];
        this.errors = [];
    }

    public static create(startTime?: Date, endTime?: Date) {
        const host = os.hostname();
        const processId = process.pid;
        
        const id = `${host}|${processId}|${crypto.randomUUID()}`;

        return new Session({ id, startTime, endTime });
    }

    public getId() {
        return this.id;
    }

    public getStartTime() {
        return this.startTime;
    }
    
    public getEndTime() {
        return this.endTime;
    }

    public start(start: Date) {
        this.startTime = start;
    }

    public end(end: Date) {
        this.endTime = end;
    }

    // Session is ready to be started
    public isReady() {
        return !this.startTime && !this.endTime;
    }

    // Session started, but didn't finish yet
    public isOpen() {
        return this.startTime && !this.endTime;
    }

    // Session was started and finished
    public isClosed() {
        return this.startTime && this.endTime;
    }

    // The session was completed, no error was detected, and
    // the success message was logged: there seems to be an
    // appointment available!
    public foundAppointment() {
        return (
            this.isClosed() &&
            this.errors.length === 0 &&
            this.logs.map(log => log.msg).includes(LogMessages.Success)
        );
    }

    public foundNoAppointment() {
        return (
            this.isClosed() &&
            this.errors.length === 1 &&
            [NoAppointmentsError, BackToFindAppointmentPageError]
                .map(err => err.name).includes(this.errors[0])
        );
    }

    public pushLog(log: Log) {
        this.logs.push(log);
    }

    public getLogs() {
        return this.logs;
    }

    public getErrors() {
        return this.logs
            .map(log => log.err)
            .filter(Boolean) as string[];
    }

    public hasUnexpectedErrors() {
        return this.getUnexpectedErrors().length > 0;
    }

    public getUnexpectedErrors() {
        return this.getErrors()
            .filter(err => !EXPECTED_ERRORS.map(e => e.name).includes(err));
    }

    public getDuration() {
        if (!this.startTime) throw new Error('Missing session start.');
        if (!this.endTime) throw new Error('Missing session end.');

        const startTime = this.startTime.getTime();
        const endTime = this.endTime.getTime();

        return new TimeDuration(endTime - startTime, TimeUnit.Milliseconds);
    }

    public isDurationReasonable = () => {
        if (!this.isClosed()) throw new Error(`Session isn't complete.`);
        
        return this.getDuration().smallerThan(FIVE_MINUTES);
    }
}

export default Session;