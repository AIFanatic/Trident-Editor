interface IDragEvent {
    data: any;
    validation: (data: IDragEvent, to: any) => boolean;
};

class _ExtendedDataTransfer {
    private data: IDragEvent;

    constructor() {
        this.data = null;
    }

    public set(data: IDragEvent) {
        this.data = data;
    }

    public get() {
        return this.data.data;
    }

    public validate(to: any): boolean {
        const data = this.data;
        return data.validation(data.data, to);
    }

    public remove<T>(e: React.DragEvent<T>) {
        this.data = null;
    }
}

export const ExtendedDataTransfer = new _ExtendedDataTransfer();