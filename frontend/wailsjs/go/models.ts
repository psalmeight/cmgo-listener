export namespace miners {
	
	export class RawSignalMessage {
	    port: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new RawSignalMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.port = source["port"];
	        this.message = source["message"];
	    }
	}

}

