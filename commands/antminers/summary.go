package antminers

import (
	"cmgo-listener/commands"
	"net"
)

type SummaryResponse struct {
	STATUS struct {
		STATUS     string `json:"STATUS"`
		When       int    `json:"when"`
		Msg        string `json:"Msg"`
		APIVersion string `json:"api_version"`
	} `json:"STATUS"`
	INFO struct {
		MinerVersion string `json:"miner_version"`
		CompileTime  string `json:"CompileTime"`
		Type         string `json:"type"`
	} `json:"INFO"`
	SUMMARY []struct {
		Elapsed   int     `json:"elapsed"`
		Rate5S    float64 `json:"rate_5s"`
		Rate30M   float64 `json:"rate_30m"`
		RateAvg   float64 `json:"rate_avg"`
		RateIdeal float64 `json:"rate_ideal"`
		RateUnit  string  `json:"rate_unit"`
		HwAll     int     `json:"hw_all"`
		Bestshare int64   `json:"bestshare"`
		Status    []struct {
			Type   string `json:"type"`
			Status string `json:"status"`
			Code   int    `json:"code"`
			Msg    string `json:"msg"`
		} `json:"status"`
	} `json:"SUMMARY"`
}

func GetSummary(ip string) (SummaryResponse, error) {
	var response SummaryResponse

	err := commands.FetchCommand("summary", &response, &commands.Profile{
		IP:   net.IPAddr{IP: net.ParseIP(ip)},
		User: "root",
		Pass: "root",
	})

	if err != nil {
		return response, err
	}

	return response, nil
}
