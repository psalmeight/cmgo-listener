export namespace main {
	
	export class SystemInfo {
	    minertype: string;
	    nettype: string;
	    netdevice: string;
	    macaddr: string;
	    hostname: string;
	    ipaddress: string;
	    netmask: string;
	    gateway: string;
	    dnsservers: string;
	    system_mode: string;
	    system_kernel_version: string;
	    system_filesystem_version: string;
	    firmware_type: string;
	    port: number;
	
	    static createFrom(source: any = {}) {
	        return new SystemInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.minertype = source["minertype"];
	        this.nettype = source["nettype"];
	        this.netdevice = source["netdevice"];
	        this.macaddr = source["macaddr"];
	        this.hostname = source["hostname"];
	        this.ipaddress = source["ipaddress"];
	        this.netmask = source["netmask"];
	        this.gateway = source["gateway"];
	        this.dnsservers = source["dnsservers"];
	        this.system_mode = source["system_mode"];
	        this.system_kernel_version = source["system_kernel_version"];
	        this.system_filesystem_version = source["system_filesystem_version"];
	        this.firmware_type = source["firmware_type"];
	        this.port = source["port"];
	    }
	}

}

