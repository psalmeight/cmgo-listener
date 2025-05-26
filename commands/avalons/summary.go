package avalons

import (
	"cmgo-listener/commands"
	"net"
)

type SummaryResponse struct {
	STATUS []struct {
		STATUS      string `json:"STATUS"`
		When        int    `json:"When"`
		Code        int    `json:"Code"`
		Msg         string `json:"Msg"`
		Description string `json:"Description"`
	} `json:"STATUS"`
	SUMMARY []struct {
		Elapsed            int     `json:"Elapsed"`
		MHSAv              float64 `json:"MHS av"`
		MHS30S             float64 `json:"MHS 30s"`
		MHS1M              float64 `json:"MHS 1m"`
		MHS5M              float64 `json:"MHS 5m"`
		MHS15M             float64 `json:"MHS 15m"`
		FoundBlocks        int     `json:"Found Blocks"`
		Getworks           int     `json:"Getworks"`
		Accepted           int     `json:"Accepted"`
		Rejected           int     `json:"Rejected"`
		HardwareErrors     int     `json:"Hardware Errors"`
		Utility            float64 `json:"Utility"`
		Discarded          int     `json:"Discarded"`
		Stale              int     `json:"Stale"`
		GetFailures        int     `json:"Get Failures"`
		LocalWork          int     `json:"Local Work"`
		RemoteFailures     int     `json:"Remote Failures"`
		NetworkBlocks      int     `json:"Network Blocks"`
		TotalMH            float64 `json:"Total MH"`
		WorkUtility        float64 `json:"Work Utility"`
		DifficultyAccepted float64 `json:"Difficulty Accepted"`
		DifficultyRejected float64 `json:"Difficulty Rejected"`
		DifficultyStale    float64 `json:"Difficulty Stale"`
		BestShare          int64   `json:"Best Share"`
		DeviceHardware     float64 `json:"Device Hardware%"`
		DeviceRejected     float64 `json:"Device Rejected%"`
		PoolRejected       float64 `json:"Pool Rejected%"`
		PoolStale          float64 `json:"Pool Stale%"`
		LastGetwork        int     `json:"Last getwork"`
	} `json:"SUMMARY"`
	ID int `json:"id"`
}

func GetSummary(ip string) (SummaryResponse, error) {
	var response SummaryResponse

	err := commands.DialCommand("summary", &response, &commands.Profile{
		IP:   net.IPAddr{IP: net.ParseIP(ip)},
		User: "root",
		Pass: "root",
	})

	if err != nil {
		return response, err
	}

	return response, nil
}
