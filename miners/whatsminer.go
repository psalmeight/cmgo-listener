package miners

import (
	"context"
	"fmt"
)

func TryWhatsminer(ctx context.Context, ip string, port int, mac string) (MinerInfo, error) {
	var minerInfo MinerInfo

	model, err := GetMinerModel(ip)
	if err != nil {
		fmt.Println("Error fetching miner info: Whatsminer", err)
		return minerInfo, err
	}

	miner, err := GetMinerInfo(ip)
	if err != nil {
		fmt.Println("Error fetching miner info: Whatsminer", err)
		return minerInfo, err
	}

	minerInfo.MinerType = fmt.Sprintf("%s %s", miner.Msg.Hostname, model)
	minerInfo.Ip = ip
	minerInfo.Mac = mac
	minerInfo.Port = fmt.Sprintf("%d", port)

	return minerInfo, nil
}
