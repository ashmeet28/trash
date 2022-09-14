while true; do
        xsetroot -name "  $(cat /sys/devices/platform/asus-nb-wmi/hwmon/hwmon5/fan1_input) RPM  $(cat /sys/class/net/wlp1s0/operstate | tr '[a-z]' '[A-Z]')  $(cat /sys/class/power_supply/BAT0/capacity)%  $(free -m | head -n 2 | tail -n 1 | tr -s ' ' | cut -d ' ' -f 7) MiB  $(date +%R)  "
        sleep 3
done &

exec dwm
