package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/go-resty/resty/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type MinerInfo struct {
	MinerType string `json:"minerType"`
	Ip        string `json:"ip"`
	Mac       string `json:"mac"`
	Port      string `json:"port"`
}

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
	var minerInfo MinerInfo
	var response AntminerResponse
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

	fmt.Println("Antminer response:", response)
	response.Port = port

	minerInfo.MinerType = response.Minertype
	minerInfo.Ip = ip
	minerInfo.Mac = response.Macaddr
	minerInfo.Port = fmt.Sprintf("%d", port)

	fmt.Println("Antminer response:", minerInfo)

	return minerInfo, nil
}

type DevDetailsResponse struct {
	Status []struct {
		Status string `json:"STATUS"`
		Msg    string `json:"Msg"`
	} `json:"STATUS"`
	Devdetails []struct {
		Devdetails int    `json:"DEVDETAILS"`
		Name       string `json:"Name"`
		ID         int    `json:"ID"`
		Driver     string `json:"Driver"`
		Kernel     string `json:"Kernel"`
		Model      string `json:"Model"`
	} `json:"DEVDETAILS"`
	ID int `json:"id"`
}

type MinerInfoResponse struct {
	Status string `json:"STATUS"`
	When   int    `json:"When"`
	Code   int    `json:"Code"`
	Msg    struct {
		Ntp      []string `json:"ntp"`
		IP       string   `json:"ip"`
		Proto    string   `json:"proto"`
		Netmask  string   `json:"netmask"`
		Gateway  string   `json:"gateway"`
		DNS      string   `json:"dns"`
		Hostname string   `json:"hostname"`
		Mac      string   `json:"mac"`
		Ledstat  string   `json:"ledstat"`
		Minersn  string   `json:"minersn"`
		Powersn  string   `json:"powersn"`
	} `json:"Msg"`
	Description string `json:"Description"`
}

func TryWhatsminer(ctx context.Context, ip string, port int) (MinerInfo, error) {
	var minerInfo MinerInfo

	model, err := getModel(ip)
	if err != nil {
		fmt.Println("Error fetching miner info: Whatsminer", err)
		return minerInfo, err
	}

	miner, err := getMinerInfo(ip)
	if err != nil {
		fmt.Println("Error fetching miner info: Whatsminer", err)
		return minerInfo, err
	}

	minerInfo.MinerType = fmt.Sprintf("%s %s", miner.Msg.Hostname, model)
	minerInfo.Ip = miner.Msg.IP
	minerInfo.Mac = miner.Msg.Mac
	minerInfo.Port = fmt.Sprintf("%d", port)

	fmt.Println("Whatsminer response:", minerInfo)

	return minerInfo, nil
}

func getModel(ip string) (string, error) {
	var devdetailsResponse DevDetailsResponse
	address := net.JoinHostPort(ip, "4028")
	message := `{"command":"devdetails","user":"admin","pass":"admin"}`
	conn, err := net.Dial("tcp", address)
	if err != nil {
		fmt.Println("Error connecting:", err)
		return "", err
	}
	defer conn.Close()

	_, err = fmt.Fprintln(conn, message)
	if err != nil {
		fmt.Println("Error sending message:", err)
		return "", err
	}

	decoder := json.NewDecoder(conn)
	err = decoder.Decode(&devdetailsResponse)

	if err != nil {
		fmt.Println("Error decoding response:", err)
		return "", err
	}

	return devdetailsResponse.Devdetails[0].Model, nil
}

func getMinerInfo(ip string) (MinerInfoResponse, error) {
	var minerInfoResponse MinerInfoResponse
	address := net.JoinHostPort(ip, "4028")
	message := `{"command":"get_miner_info","user":"admin","pass":"admin"}`
	conn, err := net.Dial("tcp", address)
	if err != nil {
		fmt.Println("Error connecting:", err)
		return minerInfoResponse, err
	}
	defer conn.Close()

	_, err = fmt.Fprintln(conn, message)
	if err != nil {
		fmt.Println("Error sending message:", err)
		return minerInfoResponse, err
	}

	decoder := json.NewDecoder(conn)
	err = decoder.Decode(&minerInfoResponse)
	if err != nil {
		fmt.Println("Error decoding response:", err)
		return minerInfoResponse, err
	}

	fmt.Println("Miner info response:", minerInfoResponse)

	return minerInfoResponse, nil
}

func (a *App) PokeMiner(ip string, port int) MinerInfo {
	var minerInfo MinerInfo

	if antminerInfo, err := TryAntminer(a.ctx, ip, port); err == nil {
		runtime.EventsEmit(a.ctx, "responseEvent", antminerInfo)
		return antminerInfo
	} else {
		fmt.Println("Error fetching miner info: Antminer", err)
	}

	// If error ang antminer
	var err error
	minerInfo, err = TryWhatsminer(a.ctx, ip, port)
	if err != nil {
		fmt.Println("Error fetching miner info: Whatsminer", err)
	}

	runtime.EventsEmit(a.ctx, "responseEvent", minerInfo)
	return minerInfo
}
