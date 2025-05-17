export namespace commands {
	
	export class MinerInfo {
	    minerType: string;
	    ip: string;
	    mac: string;
	    port: string;
	    raw: string;
	    hashrate: string;
	    hashrateUnit: string;
	    firmwareVersion: string;
	
	    static createFrom(source: any = {}) {
	        return new MinerInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.minerType = source["minerType"];
	        this.ip = source["ip"];
	        this.mac = source["mac"];
	        this.port = source["port"];
	        this.raw = source["raw"];
	        this.hashrate = source["hashrate"];
	        this.hashrateUnit = source["hashrateUnit"];
	        this.firmwareVersion = source["firmwareVersion"];
	    }
	}

}

