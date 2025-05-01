package miners

import (
	"context"
	"encoding/json"
	"fmt"
)

func TryGoldshell(ctx context.Context, ip string, port int, mac string, message string) (MinerInfo, error) {
	var minerInfo MinerInfo
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
