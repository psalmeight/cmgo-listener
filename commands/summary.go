package commands

import (
	"net"
)

type SummaryResponse struct {
	STATUS []struct {
		STATUS string `json:"STATUS"`
		Msg    string `json:"Msg"`
	} `json:"STATUS"`
	SUMMARY []struct {
		Elapsed               int     `json:"Elapsed"`
		MHSAv                 float64 `json:"MHS av"`
		MHS5S                 float64 `json:"MHS 5s"`
		MHS1M                 float64 `json:"MHS 1m"`
		MHS5M                 float64 `json:"MHS 5m"`
		MHS15M                float64 `json:"MHS 15m"`
		HSRT                  float64 `json:"HS RT"`
		Accepted              int     `json:"Accepted"`
		Rejected              int     `json:"Rejected"`
		TotalMH               float64 `json:"Total MH"`
		Temperature           float64 `json:"Temperature"`
		FreqAvg               int     `json:"freq_avg"`
		FanSpeedIn            int     `json:"Fan Speed In"`
		FanSpeedOut           int     `json:"Fan Speed Out"`
		Power                 int     `json:"Power"`
		PowerRate             float64 `json:"Power Rate"`
		PoolRejected          float64 `json:"Pool Rejected%"`
		PoolStale             float64 `json:"Pool Stale%"`
		Uptime                int     `json:"Uptime"`
		HashStable            bool    `json:"Hash Stable"`
		HashStableCostSeconds int     `json:"Hash Stable Cost Seconds"`
		HashDeviation         float64 `json:"Hash Deviation%"`
		TargetFreq            int     `json:"Target Freq"`
		TargetMHS             float64 `json:"Target MHS"`
		EnvTemp               float64 `json:"Env Temp"`
		PowerMode             string  `json:"Power Mode"`
		FactoryGHS            int     `json:"Factory GHS"`
		PowerLimit            int     `json:"Power Limit"`
		ChipTempMin           float64 `json:"Chip Temp Min"`
		ChipTempMax           float64 `json:"Chip Temp Max"`
		ChipTempAvg           float64 `json:"Chip Temp Avg"`
		Debug                 string  `json:"Debug"`
		BtminerFastBoot       string  `json:"Btminer Fast Boot"`
		UpfreqComplete        int     `json:"Upfreq Complete"`
	} `json:"SUMMARY"`
	ID int `json:"id"`
}

func GetSummary(ip string) (SummaryResponse, error) {
	var response SummaryResponse

	err := DialCommand("summary", &response, &Profile{
		IP:   net.IPAddr{IP: net.ParseIP(ip)},
		User: "admin",
		Pass: "admin",
	})

	if err != nil {
		return response, err
	}

	return response, nil
}
