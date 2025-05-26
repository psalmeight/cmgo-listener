package miners

import (
	"cmgo-listener/commands"
	"cmgo-listener/commands/avalons"
	"context"
	"fmt"
)

func TryAvalon(ctx context.Context, ip string, port int, mac string) (commands.MinerInfo, error) {
	var minerInfo commands.MinerInfo

	fmt.Println("Fetching avalon version for IP:", ip)
	version, err := avalons.GetVersion(ip)

	if err != nil {
		return minerInfo, err
	}

	fmt.Println("Fetching avalon summary for IP:", ip)
	summary, err := avalons.GetSummary(ip)

	if err != nil {
		return minerInfo, err
	}

	minerInfo.MinerType = version.VERSION[0].PROD
	minerInfo.Ip = ip
	minerInfo.Mac = mac
	minerInfo.Port = fmt.Sprintf("%d", port)
	minerInfo.Hashrate = fmt.Sprintf("%.2f", summary.SUMMARY[0].MHS5M/1000000) // Convert to TH/s and format as string
	minerInfo.HashrateUnit = "TH/s"
	minerInfo.FirmwareVersion = version.VERSION[0].VERSION

	return minerInfo, nil
}
