package miners

import (
	"cmgo-listener/commands"
	"context"
	"encoding/json"
	"fmt"
)

type GoldShellIPReportResponse struct {
	Version   string      `json:"version"`
	IP        string      `json:"ip"`
	Dhcp      string      `json:"dhcp"`
	Model     string      `json:"model"`
	Ctrlsn    string      `json:"ctrlsn"`
	Mac       string      `json:"mac"`
	Mask      string      `json:"mask"`
	Gateway   string      `json:"gateway"`
	Cpbsn     []string    `json:"cpbsn"`
	DNS       interface{} `json:"dns"`
	Boxsn     string      `json:"boxsn"`
	Time      string      `json:"time"`
	Ledstatus bool        `json:"ledstatus"`
}

func TryGoldshell(ctx context.Context, ip string, port int, mac string, message string) (commands.MinerInfo, error) {
	var minerInfo commands.MinerInfo
	var res GoldShellIPReportResponse

	err := json.Unmarshal([]byte(message), &res)

	if err != nil {
		return minerInfo, err
	}

	minerInfo.MinerType = res.Model
	minerInfo.Ip = res.IP
	minerInfo.Mac = res.Mac
	minerInfo.Port = fmt.Sprintf("%d", port)

	return minerInfo, nil
}
