export class TimeoutError extends Error {
    public name = 'TimeoutError';
}

export class AggregateError extends Error {
    public name = 'AggregateError';
}

export class UnexpectedAlertOpenError extends Error {
    public name = 'UnexpectedAlertOpenError';
}



// Custom errors
export class NoAppointmentsError extends Error {
    public name = 'NoAppointmentsError';
}

export class InternalServerError extends Error {
    public name = 'InternalServerError';
}

export class ElementMissingFromPageError extends Error {
    public name = 'ElementMissingFromPageError';
}

export class InfiniteSpinnerError extends Error {
    public name = 'InfiniteSpinnerError';
}

export class PageStructureIntegrityError extends Error {
    public name = 'PageStructureIntegrityError';
}