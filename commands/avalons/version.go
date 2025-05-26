package avalons

import (
	"cmgo-listener/commands"
	"net"
)

type VersionResponse struct {
	STATUS []struct {
		STATUS      string `json:"STATUS"`
		When        int    `json:"When"`
		Code        int    `json:"Code"`
		Msg         string `json:"Msg"`
		Description string `json:"Description"`
	} `json:"STATUS"`
	VERSION []struct {
		CGMiner string `json:"CGMiner"`
		API     string `json:"API"`
		STM8    string `json:"STM8"`
		PROD    string `json:"PROD"`
		MODEL   string `json:"MODEL"`
		HWTYPE  string `json:"HWTYPE"`
		SWTYPE  string `json:"SWTYPE"`
		VERSION string `json:"VERSION"`
		LOADER  string `json:"LOADER"`
		DNA     string `json:"DNA"`
		MAC     string `json:"MAC"`
		UPAPI   string `json:"UPAPI"`
	} `json:"VERSION"`
	ID int `json:"id"`
}

func GetVersion(ip string) (VersionResponse, error) {
	var response VersionResponse

	err := commands.DialCommand("version", &response, &commands.Profile{
		IP:   net.IPAddr{IP: net.ParseIP(ip)},
		User: "root",
		Pass: "root",
	})

	if err != nil {
		return response, err
	}

	return response, nil
}
