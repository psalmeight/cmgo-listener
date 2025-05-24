package commands

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/go-resty/resty/v2"
)

type RawSignalMessage struct {
	Port    string `json:"port"`
	Message string `json:"message"`
}

type MinerInfo struct {
	MinerType       string `json:"minerType"`
	Ip              string `json:"ip"`
	Mac             string `json:"mac"`
	Port            string `json:"port"`
	Raw             string `json:"raw"`
	Hashrate        string `json:"hashrate"`
	HashrateUnit    string `json:"hashrateUnit"`
	FirmwareVersion string `json:"firmwareVersion"`
}

type Profile struct {
	IP   net.IPAddr
	User string
	Pass string
}

func errorHandler(message string, err error) error {
	fmt.Println("Error: ", message)
	fmt.Println("ErrorMsg: ", err)
	return err
}

func FetchCommand[T any](command string, response T, p *Profile) error {
	url := fmt.Sprintf("http://%s/cgi-bin/%s.cgi", p.IP.String(), command)

	client := resty.New()
	client.SetTimeout(10 * time.Second)

	resp, err := client.R().
		SetDigestAuth(p.User, p.Pass).
		Get(url)

	if err != nil {
		return errorHandler("Failed to fetch command", err)
	}

	if resp.StatusCode() != http.StatusOK {
		return errorHandler("Unexpected status code", err)
	}

	body := resp.Body()

	println(string(body))

	err = json.Unmarshal(body, &response)
	if err != nil {
		return errorHandler("Error parsing response body", err)
	}

	return nil
}

func DialCommand[T any](command string, response *T, p *Profile) error {
	address := net.JoinHostPort(p.IP.String(), "4028")
	message := fmt.Sprintf(`{"command":"%s","user":"%s","pass":"%s"}`, command, p.User, p.Pass)

	conn, err := net.Dial("tcp", address)
	if err != nil {
		return errorHandler("Something went wrong on dial", err)
	}
	defer conn.Close()

	_, err = fmt.Fprintln(conn, message)
	if err != nil {
		return errorHandler("Something went wrong on close", err)
	}

	decoder := json.NewDecoder(conn)
	err = decoder.Decode(&response)

	if err != nil {
		return errorHandler("Something went wrong on decode", err)
	}

	return nil
}
