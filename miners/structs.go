package miners

type RawSignalMessage struct {
	Port    string `json:"port"`
	Message string `json:"message"`
}

type MinerInfo struct {
	MinerType string `json:"minerType"`
	Ip        string `json:"ip"`
	Mac       string `json:"mac"`
	Port      string `json:"port"`
}

type DevDetailsResponse struct {
	Status []struct {
		Status string `json:"STATUS"`
		Msg    string `json:"Msg"`
	} `json:"STATUS"`
	Devdetails []struct {
		Devdetails int    `json:"DEVDETAILS"`
		Name       string `json:"Name"`
		ID         int    `json:"ID"`
		Driver     string `json:"Driver"`
		Kernel     string `json:"Kernel"`
		Model      string `json:"Model"`
	} `json:"DEVDETAILS"`
	ID int `json:"id"`
}

type MinerInfoResponse struct {
	Status string `json:"STATUS"`
	When   int    `json:"When"`
	Code   int    `json:"Code"`
	Msg    struct {
		Ntp      []string `json:"ntp"`
		IP       string   `json:"ip"`
		Proto    string   `json:"proto"`
		Netmask  string   `json:"netmask"`
		Gateway  string   `json:"gateway"`
		DNS      string   `json:"dns"`
		Hostname string   `json:"hostname"`
		Mac      string   `json:"mac"`
		Ledstat  string   `json:"ledstat"`
		Minersn  string   `json:"minersn"`
		Powersn  string   `json:"powersn"`
	} `json:"Msg"`
	Description string `json:"Description"`
}
