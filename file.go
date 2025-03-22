package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func (app *App) LoadPorts() ([]int, error) {
	file, err := os.Open("ports.txt")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var line string
	if scanner.Scan() {
		line = scanner.Text()
	}

	if err := scanner.Err(); err != nil {
		fmt.Println("error 1 ", err)
		return nil, err
	}

	strPorts := strings.Split(line, ",")
	ports := make([]int, 0, len(strPorts))
	for _, str := range strPorts {
		port, err := strconv.Atoi(strings.TrimSpace(str))
		if err != nil {
			return nil, fmt.Errorf("invalid port number: %v", err)
		}
		ports = append(ports, port)
	}

	return ports, nil
}

func (app *App) SavePorts(port int) error {
	fmt.Println("saving new port ", port)
	file, err := os.OpenFile("ports.txt", os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("error 2 ", err)
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return err
	}

	if info.Size() == 0 {
		_, err = file.WriteString(fmt.Sprintf("%d", port))
	} else {
		_, err = file.WriteString(fmt.Sprintf(",%d", port))
	}
	return err
}

func (app *App) Replace(portsToReplace []int) error {
	file, err := os.OpenFile("ports.txt", os.O_RDWR|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	for _, port := range portsToReplace {
		app.SavePorts(port)
	}
	return nil
}
