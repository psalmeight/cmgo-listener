package whatsminers

import (
	"cmgo-listener/commands"
	"net"
)

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

func GetDevDetails(ip string) (DevDetailsResponse, error) {
	var response DevDetailsResponse

	err := commands.DialCommand("devdetails", &response, &commands.Profile{
		IP:   net.IPAddr{IP: net.ParseIP(ip)},
		User: "admin",
		Pass: "admin",
	})

	if err != nil {
		return response, err
	}

	return response, nil
}
