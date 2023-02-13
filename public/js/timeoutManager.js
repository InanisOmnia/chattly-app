class Timer{
    /**
     *
     * @param {{ms: Number, cb: Function}} opts
     */
    constructor(opts) {
        this.cb = opts.cb;
        this.ms = opts.ms;
        this.timer = setTimeout(this.cb, this.ms);
    }

    restartTimeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.cb, this.ms);
        return this;
    }

    cancelTimeout() {
        clearTimeout(this.timer);
        return this;
    }

    fireNow() {
        clearTimeout(this.timer);
        this.cb.call();
        return this;
    }
}