#!/bin/bash
echo "10.1.1.41,AC:BF:B3:6F:AC:4C" | socat - UDP-DATAGRAM::14235
echo "10.1.1.42,66:6A:2E:CE:D2:DC" | socat - UDP-DATAGRAM::14235
# echo "10.1.1.54,02:E4:E6:C6:3A:78" | socat - UDP-DATAGRAM::14235
# echo "10.1.1.104,58:42:D0:BB:D1:A8" | socat - UDP-DATAGRAM::14235
echo "IP:10.9.7.13MAC:C8:11:16:00:32:AE" | socat - UDP-DATAGRAM::8888
echo "IP:10.9.7.17MAC:C8:11:05:00:56:9D" | socat - UDP-DATAGRAM::8888
# echo "IP:10.9.2.15MAC:C8:09:24:00:77:84" | socat - UDP-DATAGRAM::8888
# echo "IP:10.9.2.15MAC:C8:09:24:00:77:84" | socat - UDP-DATAGRAM::8888
# echo '{"version": "2.1.4", "ip": "172.16.10.41", "dhcp": "enable", "model": "Goldshell-HS5", "ctrlsn": "CS304014616D119C", "mac": "28:E2:97:1E:CF:EF", "mask": "255.255.255.128", "gateway": "172.16.10.1", "cpbsn": ["H50PSA6020004F11146E6CF201", "H50PSA6020004F11146E6CF287", "H50PSA6020004F11146E6CECE6", "H50PSA6020004F11146E6CED0D"], "dns": null, "boxsn": "H50BS1464FF8116", "time": "2025-04-12 02:09:46", "ledstatus": false}' | socat - UDP-DATAGRAM::1314
