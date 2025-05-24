package miners

import (
	"cmgo-listener/commands"
	"cmgo-listener/commands/antminers"
	"context"
	"fmt"

	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

func TryAntminer(ctx context.Context, ip string, port int, mac string) (commands.MinerInfo, error) {
	var response antminers.SystemInfoResponse
	var minerInfo commands.MinerInfo

	fmt.Println("Fetching antminer system info for IP:", ip)
	response, err := antminers.GetSystemInfo(ip)

	if err != nil {
		return minerInfo, err
	}

	fmt.Println("Fetching antminer summary for IP:", ip)
	summary, err := antminers.GetSummary(ip)

	if err != nil {
		return minerInfo, err
	}

	printer := message.NewPrinter(language.AmericanEnglish)
	hashrate := printer.Sprintf("%.2f", summary.SUMMARY[0].Rate5S/1000)

	minerInfo.MinerType = response.Minertype
	minerInfo.Ip = ip
	minerInfo.Mac = mac
	minerInfo.Port = fmt.Sprintf("%d", port)
	minerInfo.Hashrate = hashrate
	minerInfo.HashrateUnit = "TH/s"
	minerInfo.FirmwareVersion = response.SystemFilesystemVersion

	return minerInfo, err
}
