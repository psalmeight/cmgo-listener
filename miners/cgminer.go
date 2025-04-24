package miners

import (
	"encoding/json"
	"fmt"
	"net"
)

func GetMinerModel(ip string) (string, error) {
	var devdetailsResponse DevDetailsResponse
	address := net.JoinHostPort(ip, "4028")
	message := `{"command":"devdetails","user":"admin","pass":"admin"}`
	conn, err := net.Dial("tcp", address)
	if err != nil {
		fmt.Println("Error connecting:", err)
		return "", err
	}
	defer conn.Close()

	_, err = fmt.Fprintln(conn, message)
	if err != nil {
		fmt.Println("Error sending message:", err)
		return "", err
	}

	decoder := json.NewDecoder(conn)
	err = decoder.Decode(&devdetailsResponse)

	if err != nil {
		fmt.Println("Error decoding response:", err)
		return "", err
	}

	return devdetailsResponse.Devdetails[0].Model, nil
}

func GetMinerInfo(ip string) (MinerInfoResponse, error) {
	var minerInfoResponse MinerInfoResponse
	address := net.JoinHostPort(ip, "4028")
	message := `{"command":"get_miner_info","user":"admin","pass":"admin"}`
	conn, err := net.Dial("tcp", address)
	if err != nil {
		fmt.Println("Error connecting:", err)
		return minerInfoResponse, err
	}
	defer conn.Close()

	_, err = fmt.Fprintln(conn, message)
	if err != nil {
		fmt.Println("Error sending message:", err)
		return minerInfoResponse, err
	}

	decoder := json.NewDecoder(conn)
	err = decoder.Decode(&minerInfoResponse)
	if err != nil {
		fmt.Println("Error decoding response:", err)
		return minerInfoResponse, err
	}

	fmt.Println("Miner info response:", minerInfoResponse)

	return minerInfoResponse, nil
}
