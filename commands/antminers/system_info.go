package antminers

import (
	"cmgo-listener/commands"
	"net"
)

type SystemInfoResponse struct {
	Minertype               string `json:"minertype"`
	Nettype                 string `json:"nettype"`
	Netdevice               string `json:"netdevice"`
	Macaddr                 string `json:"macaddr"`
	Hostname                string `json:"hostname"`
	Ipaddress               string `json:"ipaddress"`
	Netmask                 string `json:"netmask"`
	Gateway                 string `json:"gateway"`
	Dnsservers              string `json:"dnsservers"`
	SystemMode              string `json:"system_mode"`
	SystemKernelVersion     string `json:"system_kernel_version"`
	SystemFilesystemVersion string `json:"system_filesystem_version"` //firmwareversion
	FirmwareType            string `json:"firmware_type"`
	Port                    int    `json:"port"`
}

func GetSystemInfo(ip string) (SystemInfoResponse, error) {
	var response SystemInfoResponse

	err := commands.FetchCommand("get_system_info", &response, &commands.Profile{
		IP:   net.IPAddr{IP: net.ParseIP(ip)},
		User: "root",
		Pass: "root",
	})

	if err != nil {
		return response, err
	}

	return response, nil
}
