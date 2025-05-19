package miners

import (
	"cmgo-listener/commands"
	"context"
	"fmt"

	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

func TryAntminer(ctx context.Context, ip string, port int, mac string) (commands.MinerInfo, error) {
	var response commands.SystemInfoResponse
	var minerInfo commands.MinerInfo

	fmt.Println("Fetching antminer system info for IP:", ip)
	response, err := commands.GetSystemInfo(ip)

	if err != nil {
		return minerInfo, err
	}

	fmt.Println("Fetching antminer summary for IP:", ip)
	summary, err := commands.GetSummary(ip)

	if err != nil {
		return minerInfo, err
	}

	printer := message.NewPrinter(language.AmericanEnglish)
	hashrate := printer.Sprintf("%.2f", summary.SUMMARY[0].MHS5S/1000000)

	minerInfo.MinerType = response.Minertype
	minerInfo.Ip = ip
	minerInfo.Mac = mac
	minerInfo.Port = fmt.Sprintf("%d", port)
	minerInfo.Hashrate = hashrate
	minerInfo.HashrateUnit = "TH/s"
	minerInfo.FirmwareVersion = response.SystemFilesystemVersion

	return minerInfo, err
}
