package miners

import (
	"cmgo-listener/commands"
	"cmgo-listener/commands/whatsminers"
	"context"
	"fmt"

	"golang.org/x/text/language"
	"golang.org/x/text/message"
)

func TryWhatsminer(ctx context.Context, ip string, port int, mac string) (commands.MinerInfo, error) {
	var minerInfo commands.MinerInfo

	fmt.Println("Fetching whatsminer devdetails for IP:", ip)
	devDetails, err := whatsminers.GetDevDetails(ip)
	model := devDetails.Devdetails[0].Model

	if err != nil {
		return minerInfo, err
	}

	fmt.Println("Fetching whatsminer miner info for IP:", ip)
	miner, err := whatsminers.GetMinerInfo(ip)

	if err != nil {
		return minerInfo, err
	}
	fmt.Println("Fetching whatsminer summary for IP:", ip)
	summary, err := whatsminers.GetSummary(ip)

	if err != nil {
		return minerInfo, err
	}
	fmt.Println("Fetching whatsminer status for IP:", ip)
	status, err := whatsminers.GetStatus(ip)
	if err != nil {
		return minerInfo, err
	}

	printer := message.NewPrinter(language.AmericanEnglish)
	hashrate := printer.Sprintf("%.2f", summary.SUMMARY[0].MHS5S/1000000)

	minerInfo.MinerType = fmt.Sprintf("%s %s", miner.Msg.Hostname, model)
	minerInfo.Ip = ip
	minerInfo.Mac = mac
	minerInfo.Port = fmt.Sprintf("%d", port)
	minerInfo.Hashrate = hashrate
	minerInfo.HashrateUnit = "TH/s"
	minerInfo.FirmwareVersion = status.Msg.FirmwareVersion

	return minerInfo, nil
}
