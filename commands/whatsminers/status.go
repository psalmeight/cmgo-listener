package whatsminers

import (
	"cmgo-listener/commands"
	"net"
)

type Status struct {
	STATUS string `json:"STATUS"`
	When   int    `json:"When"`
	Code   int    `json:"Code"`
	Msg    struct {
		Mineroff        string `json:"mineroff"`
		MineroffReason  string `json:"mineroff_reason"`
		MineroffTime    string `json:"mineroff_time"`
		FirmwareVersion string `json:"FirmwareVersion"`
		PowerMode       string `json:"power_mode"`
		HashPercent     string `json:"hash_percent"`
	} `json:"Msg"`
	Description string `json:"Description"`
}

func GetStatus(ip string) (Status, error) {
	var response Status

	err := commands.DialCommand("status", &response, &commands.Profile{
		IP:   net.IPAddr{IP: net.ParseIP(ip)},
		User: "admin",
		Pass: "admin",
	})

	if err != nil {
		return response, err
	}

	return response, nil
}
