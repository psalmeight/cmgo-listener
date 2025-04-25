package main

import (
	"cmgo-listener/miners"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var listener *Listener

type Listener struct {
	listeners map[int]*net.UDPConn
	mu        sync.Mutex
	app       *App
}

func NewListener(app *App) *Listener {
	return &Listener{
		listeners: make(map[int]*net.UDPConn),
		app:       app,
	}
}

// Listener {
// 	app
// 	listeners: [{ 1234: connection, 2345: connection, 4556: connection }]
// }

func (app *App) ExportToCsv(data string) {
	err := os.WriteFile("container-miners.csv", []byte(data), 0644)
	if err != nil {
		fmt.Println(err)
	}

	DownloadCSV(app.ctx)
}

func DownloadCSV(ctx context.Context) {
	// Define the path of your CSV file in the root folder
	sourceFile := "container-miners.csv" // Ensure this file exists in your root directory

	// Open the save file dialog
	destPath, _ := runtime.SaveFileDialog(ctx, runtime.SaveDialogOptions{
		Title:           "Save CSV File",
		DefaultFilename: "container-miners.csv",
		Filters: []runtime.FileFilter{
			{DisplayName: "CSV Files (*.csv)", Pattern: "*.csv"},
		},
	})

	// Check if a destination was selected
	if destPath == "" {
		fmt.Println("No file path selected")
		return
	}

	// Copy the file to the selected destination
	err := copyFile(sourceFile, destPath)
	if err != nil {
		fmt.Println("Error copying file:", err)
		return
	}

	fmt.Println("CSV file downloaded successfully at:", destPath)
}

func copyFile(src, dest string) error {
	// Open the source file
	source, err := os.Open(src)
	if err != nil {
		return err
	}
	defer source.Close()

	// Create the destination file
	destination, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer destination.Close()

	// Copy contents
	_, err = io.Copy(destination, source)
	return err
}

func (app *App) InitializePorts(port []int) {
	if listener == nil {
		fmt.Println("Initiating new listener for port", port)
		listener = NewListener(app)
	}
}

func (app *App) StartListeningPorts(ports []int) {
	for _, port := range ports {
		listener.StartOrStopListening(port)
	}
}

func (lm *Listener) StartOrStopListening(port int) error {
	lm.mu.Lock()
	defer lm.mu.Unlock()

	if conn, exists := lm.listeners[port]; exists {
		conn.Close()
		delete(lm.listeners, port)
		fmt.Printf("Removed listener on port %d\n", port)
		return nil
	}

	address := fmt.Sprintf(":%d", port)
	udpAddr, err := net.ResolveUDPAddr("udp", address)
	if err != nil {
		return fmt.Errorf("something went wrong on port %d: %v", port, err)
	}

	conn, err := net.ListenUDP("udp", udpAddr)
	if err != nil {
		return fmt.Errorf("failed to create listener on port %d: %v", port, err)
	}

	lm.listeners[port] = conn

	go lm.listen(conn, port)

	return nil
}

func (lm *Listener) listen(conn *net.UDPConn, port int) {
	fmt.Printf("Listening to port %d", port)
	buffer := make([]byte, 1024)
	for {
		n, _, err := conn.ReadFromUDP(buffer)
		if err != nil {
			fmt.Printf("Listener on port %d error: %v\n", port, err)
			return
		}
		msg := string(buffer[:n])
		lm.app.Probe("", strconv.Itoa(port), msg)
	}
}

func (app *App) Probe(ip string, port string, message string) miners.MinerInfo {

	var minerInfo miners.MinerInfo
	var err error
	var goldShellResponse miners.GoldShellIPReportResponse

	ipMac := make([]string, 2)
	intPort, _ := strconv.Atoi(port)

	if intPort == 14235 {
		ipMac = strings.Split(message, ",")
		if len(ipMac) > 0 {
			minerInfo, err = miners.TryAntminer(app.ctx, ipMac[0], intPort)
		}
	} else if intPort == 8888 {
		ipMac = strings.Split(message[3:], "MAC:")

		if len(ipMac) > 0 {
			minerInfo, err = miners.TryWhatsminer(app.ctx, ipMac[0], intPort)
		}
	} else {
		_ = json.Unmarshal([]byte(message), &goldShellResponse)
		ipMac[0] = goldShellResponse.IP
		ipMac[1] = goldShellResponse.Mac
	}

	if err != nil {
		fmt.Println(err)
	}

	runtime.EventsEmit(app.ctx, "responseEvent", minerInfo)
	return minerInfo
}
