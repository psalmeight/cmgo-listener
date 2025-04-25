#!/bin/bash
echo "10.1.1.23,3C:A3:08:73:8C:6D" | socat - UDP-DATAGRAM::14235
echo "IP:10.10.1.11MAC:3C:A3:08:73:8C:6D" | socat - UDP-DATAGRAM::8888
# echo '{"version": "2.1.4", "ip": "172.16.10.41", "dhcp": "enable", "model": "Goldshell-HS5", "ctrlsn": "CS304014616D119C", "mac": "28:E2:97:1E:CF:EF", "mask": "255.255.255.128", "gateway": "172.16.10.1", "cpbsn": ["H50PSA6020004F11146E6CF201", "H50PSA6020004F11146E6CF287", "H50PSA6020004F11146E6CECE6", "H50PSA6020004F11146E6CED0D"], "dns": null, "boxsn": "H50BS1464FF8116", "time": "2025-04-12 02:09:46", "ledstatus": false}' | socat - UDP-DATAGRAM::1314
