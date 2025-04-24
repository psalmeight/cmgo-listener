package miners

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-resty/resty/v2"
)

type AntminerResponse struct {
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

func TryAntminer(ctx context.Context, ip string, port int) (MinerInfo, error) {
	var response AntminerResponse
	var minerInfo MinerInfo

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
		return minerInfo, err
	}

	if resp.StatusCode() != http.StatusOK {
		fmt.Printf("Unexpected status code: %d, Response: %s\n", resp.StatusCode(), string(resp.Body()))
		return minerInfo, err
	}

	body := resp.Body()

	err = json.Unmarshal(body, &response)
	if err != nil {
		fmt.Printf("Error parsing JSON: %v\n", err)
		return minerInfo, err
	}

	response.Port = port
	minerInfo.MinerType = response.Minertype
	minerInfo.Ip = ip
	minerInfo.Mac = response.Macaddr
	minerInfo.Port = fmt.Sprintf("%d", port)

	return minerInfo, nil
}
