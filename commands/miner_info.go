package commands

import (
	"net"
)

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

func GetMinerInfo(ip string) (MinerInfoResponse, error) {
	var response MinerInfoResponse

	err := DialCommand("get_miner_info", &response, &Profile{
		IP:   net.IPAddr{IP: net.ParseIP(ip)},
		User: "admin",
		Pass: "admin",
	})

	if err != nil {
		return response, err
	}

	return response, nil
}
