package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type SystemInfo struct {
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
	SystemFilesystemVersion string `json:"system_filesystem_version"`
	FirmwareType            string `json:"firmware_type"`
	Port                    int    `json:"port"`
}

func (a *App) PokeMiner(ip string, port int) SystemInfo {
	var systemInfo SystemInfo
	url := fmt.Sprintf("http://%s/cgi-bin/get_system_info.cgi", ip)
	username := "root"
	password := "root"

	client := resty.New()
	client.SetTimeout(10 * time.Second)

	resp, err := client.R().
		SetDigestAuth(username, password).
		Get(url)

	if err != nil {
		fmt.Printf("Error while making request: %v\n", err)
		return systemInfo
	}

	if resp.StatusCode() != http.StatusOK {
		fmt.Printf("Unexpected status code: %d, Response: %s\n", resp.StatusCode(), string(resp.Body()))
		return systemInfo
	}

	body := resp.Body()

	err = json.Unmarshal(body, &systemInfo)
	if err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
		return systemInfo
	}
	systemInfo.Port = port
	runtime.EventsEmit(a.ctx, "responseEvent", systemInfo)

	return systemInfo
}
